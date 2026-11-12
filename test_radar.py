"""Tests for Whop Radar, using made-up samples only.  Run:  python3 -m unittest -v test_radar"""
import copy
import json
import unittest
from datetime import datetime, timezone
from pathlib import Path

import radar

HERE = Path(__file__).resolve().parent
SAMPLES = HERE / "samples"
SETTINGS = radar.load_settings()
NO_BURN = {"per_day": None, "days_left": None, "text": "need 2 snapshots"}


def load(name):
    return json.loads((SAMPLES / name).read_text(encoding="utf-8"))


def good_campaign(**changes):
    c = {"name": "Night Owl Podcast Clips", "organiser": "Example Clips Co", "rate_per_1k": 2.0,
         "budget": 5000, "paid_out": 500, "clippers": 40, "min_views": 1000,
         "platforms": "YouTube, TikTok", "countries": None,
         "rules": "Clip any full episode of the podcast. No follower minimum. No pre-approval needed."}
    c.update(changes)
    return c


def score(**changes):
    return radar.score_campaign(good_campaign(**changes), NO_BURN, SETTINGS)


class DedupeTests(unittest.TestCase):
    def setUp(self):
        self.conn = radar.open_db(":memory:")

    def test_notification_arriving_twice_is_saved_once_and_noise_dropped(self):
        r = radar.ingest_data(self.conn, load("notifications.json"), SETTINGS)
        self.assertEqual(sorted(n["key"] for n in r["new"]), ["post_CAMPb", "post_CHALLENGE1", "post_TOPUP1"])
        self.assertEqual(r["duplicates"], 2)   # same message id; same text posted to 2 channels
        self.assertEqual(r["noise"], 1)
        self.assertEqual(self.conn.execute("SELECT COUNT(*) FROM notifications").fetchone()[0], 3)

    def test_second_ingest_saves_nothing_new(self):
        radar.ingest_data(self.conn, load("notifications.json"), SETTINGS)
        r = radar.ingest_data(self.conn, load("notifications.json"), SETTINGS)
        self.assertEqual(r["new"], [])
        self.assertEqual(r["duplicates"], 5)

    def test_last_timestamp_is_kept_even_for_noise(self):
        radar.ingest_data(self.conn, load("notifications.json"), SETTINGS)
        self.assertEqual(radar.get_meta(self.conn, "last_notification_ts"), "2026-01-02T11:00:00.000Z")

    def test_bounty_gets_new_snapshot_only_when_it_changed(self):
        data = load("bounties.json")
        self.assertEqual(radar.ingest_data(self.conn, data, SETTINGS)["bounties_new"], 1)
        self.assertEqual(radar.ingest_data(self.conn, data, SETTINGS)["bounties_unchanged"], 1)
        changed = copy.deepcopy(data)
        changed["data"][0]["gross_paid_out_amount"] = 300
        self.assertEqual(radar.ingest_data(self.conn, changed, SETTINGS)["bounties_changed"], 1)
        self.assertEqual(self.conn.execute("SELECT COUNT(*) FROM campaigns").fetchone()[0], 1)
        self.assertEqual(self.conn.execute("SELECT COUNT(*) FROM snapshots").fetchone()[0], 2)

    def test_tags_are_stored_and_bad_tags_rejected(self):
        radar.ingest_data(self.conn, load("notifications.json"), SETTINGS)
        r = radar.ingest_data(self.conn, {"tags": [
            {"key": "post_CHALLENGE1", "tag": "challenge", "note": "24h posting challenge"},
            {"key": "post_TOPUP1", "tag": "join now"}]}, SETTINGS)
        self.assertEqual(r["tags_saved"], 1)
        self.assertEqual(len(r["tag_errors"]), 1)


class ParserTests(unittest.TestCase):
    def test_sample_page_is_prefilled(self):
        f = radar.parse_campaign_text((SAMPLES / "campaign_page.txt").read_text(encoding="utf-8"))
        self.assertEqual(f["name"], "Night Owl Podcast Clips")
        self.assertEqual(f["organiser"], "Example Clips Co")
        self.assertEqual(f["rate_per_1k"], 2.0)
        self.assertEqual(f["budget"], 5000)
        self.assertEqual(f["paid_out"], 1250.5)
        self.assertEqual(f["clippers"], 312)
        self.assertEqual(f["max_per_clip"], 250)
        self.assertEqual(f["min_views"], 1000)          # $2 minimum payout at $2 per 1K
        self.assertEqual(f["platforms"], "YouTube, TikTok, Instagram")
        self.assertTrue(f["rules"].startswith("- Clips must be 15-60 seconds"))

    def test_other_wordings(self):
        f = radar.parse_campaign_text("Stream Highlights\nBudget: $12.5K\nPaid out: $3,000\n"
                                      "$1,500 per 1M views\nCreators: 1.2K\nMax per clip: $100\n"
                                      "Minimum views: 5,000\nTikTok only. No YouTube.")
        self.assertEqual((f["budget"], f["paid_out"], f["rate_per_1k"]), (12500, 3000, 1.5))
        self.assertEqual((f["clippers"], f["max_per_clip"], f["min_views"]), (1200, 100, 5000))
        self.assertEqual(f["platforms"], "TikTok")

    def test_missing_numbers_stay_unknown(self):
        f = radar.parse_campaign_text("Mystery Campaign\nPost clips and get paid.")
        for key in ["rate_per_1k", "budget", "paid_out", "clippers", "max_per_clip", "min_views", "platforms"]:
            self.assertIsNone(f[key], key)


class ScoringTests(unittest.TestCase):
    def assertFails(self, expected, **changes):
        result = score(**changes)
        self.assertEqual(result["score"], 0, changes)
        self.assertTrue(any(expected in f for f in result["fails"]), result["fails"])

    def test_good_campaign_passes(self):
        result = score()
        self.assertEqual(result["fails"], [])
        self.assertGreater(result["score"], 60)

    def test_every_fail_rule(self):
        self.assertFails("YouTube", platforms="TikTok, Instagram")
        self.assertFails("YouTube", platforms=None, rules="TikTok only campaign.")
        self.assertFails("21+", rules="Creators must be 21+ to join.")
        self.assertFails("Vietnam", rules="Not available for creators in India, Pakistan or Vietnam.")
        self.assertFails("Vietnam", rules="US only.")
        self.assertFails("Vietnam", countries="US,GB,CA")
        self.assertFails("follower", rules="Minimum 1,000 followers on the account.")
        self.assertFails("follower", rules="You need 5K+ subscribers.")
        self.assertFails("Tier 1", rules="At least 60% of views must come from Tier 1 audience.")
        self.assertFails("views", min_views=5000)
        self.assertFails("dedicated", rules="A dedicated page is required for this campaign.")
        self.assertFails("dedicated", rules="Your username must include the brand name.")
        self.assertFails("comments", rules="Pin a comment with the link on every clip.")
        self.assertFails("pre-approval", rules="Clips need pre-approval before posting.")
        self.assertFails("pre-approval", rules="Apply here first, approved clippers only.")
        self.assertFails("Clip Farm", organiser="ClipFarm")
        self.assertFails("SEGA", name="SEGA Sonic launch clips")

    def test_things_that_must_not_fail(self):
        for rules in ["No follower minimum. No pre-approval needed.",
                      "At least 30% of views from Tier 1 audience.",
                      "Vietnam, India and the US are all welcome.",
                      "Comments are not required."]:
            self.assertEqual(score(rules=rules)["fails"], [], rules)
        self.assertEqual(score(countries="PH,VN")["fails"], [])
        self.assertEqual(score(min_views=1000)["fails"], [])
        self.assertEqual(score(platforms=None)["fails"], [])       # unknown is not a fail

    def test_better_numbers_score_higher(self):
        base = score()["score"]
        self.assertLess(score(rate_per_1k=0.5)["score"], base)
        self.assertLess(score(paid_out=4900)["score"], base)
        self.assertLess(score(clippers=450)["score"], base)
        self.assertLess(score(name="Gadget Ads", rules="Clip the product ad.")["score"], base)
        slow = radar.score_campaign(good_campaign(), {"per_day": 10, "days_left": 30, "text": ""}, SETTINGS)
        fast = radar.score_campaign(good_campaign(), {"per_day": 900, "days_left": 1, "text": ""}, SETTINGS)
        self.assertGreater(slow["score"], fast["score"])

    def test_burn_rate_needs_two_snapshots(self):
        one = [{"taken_at": "2026-01-01T00:00:00Z", "paid_out": 1000, "budget": 5000}]
        self.assertEqual(radar.burn_info(one, SETTINGS)["text"], "need 2 snapshots")
        two = one + [{"taken_at": "2026-01-03T00:00:00Z", "paid_out": 2000, "budget": 5000}]
        burn = radar.burn_info(two, SETTINGS)
        self.assertEqual(burn["per_day"], 500)
        self.assertEqual(burn["days_left"], 6)


class BuildTests(unittest.TestCase):
    def test_html_has_three_blocks_question_marks_and_escaped_text(self):
        conn = radar.open_db(":memory:")
        radar.save_snapshot(conn, {"name": "Mystery <b>Campaign</b>", "link": "https://example.com/c"},
                            taken_at="2026-01-01T00:00:00Z")
        radar.save_snapshot(conn, good_campaign(name="Dying One", paid_out=1000), taken_at="2026-01-01T00:00:00Z")
        radar.save_snapshot(conn, good_campaign(name="Dying One", paid_out=4000), taken_at="2026-01-03T00:00:00Z")
        radar.save_snapshot(conn, good_campaign(name="Bad One", organiser="Clip Farm"))
        radar.ingest_data(conn, load("notifications.json"), SETTINGS)
        radar.ingest_data(conn, {"tags": [{"key": "post_CHALLENGE1", "tag": "challenge", "note": "24h challenge"},
                                          {"key": "post_TOPUP1", "tag": "budget top-up"}]}, SETTINGS)
        page, stats = radar.build_html(conn, SETTINGS, now=datetime(2026, 1, 3, 12, tzinfo=timezone.utc))
        for title in ["Top picks today", "Dying soon", "Needs action"]:
            self.assertIn(title, page)
        self.assertIn("rate ?, ? budget left, ? clippers, need 2 snapshots", page)
        self.assertIn("Mystery &lt;b&gt;Campaign&lt;/b&gt;", page)
        self.assertNotIn("<b>Campaign", page)
        self.assertIn('href="https://example.com/c"', page)
        self.assertIn("organiser is Clip Farm", page)
        self.assertEqual((stats["dying"], stats["actions"], stats["failed"]), (1, 1, 1))
        self.assertIn("24h challenge", page)
        self.assertNotIn("Budget topped up", page)     # top-ups are not in "Needs action"


if __name__ == "__main__":
    unittest.main()
