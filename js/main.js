/* ==========================================================================
   Логика сайта. Менять здесь ничего не нужно — всё содержимое лежит
   в js/content.js.
   ========================================================================== */

(function () {
  "use strict";

  var SITE = window.SITE || {};
  var LANG_KEY = "site-lang";
  var languages = (SITE.languages && SITE.languages.length) ? SITE.languages : ["ru"];
  var lang = initialLang();

  /* ---------------- Вспомогательные функции ---------------- */

  function initialLang() {
    var saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) { /* хранилище недоступно */ }
    if (saved && languages.indexOf(saved) !== -1) return saved;
    var browser = (navigator.language || "").toLowerCase().slice(0, 2);
    if (languages.indexOf(browser) !== -1) return browser;
    return languages[0];
  }

  // Достаёт текст на текущем языке: "строка" или { ru: "...", en: "..." }
  function t(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.ru || value.en || "";
  }

  // Достаёт текст из SITE.texts по пути вида "hero.title"
  function text(path) {
    if (path === "brand") return t(SITE.brand);
    var node = SITE.texts || {};
    var parts = path.split(".");
    for (var i = 0; i < parts.length; i++) {
      if (node == null) return "";
      node = node[parts[i]];
    }
    return t(node);
  }

  // Создаёт HTML-элемент: el("div", { class: "x" }, [дети])
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var val = attrs[key];
        if (val === null || val === undefined || val === false) return;
        if (key === "text") node.textContent = val;
        else node.setAttribute(key, val === true ? "" : val);
      });
    }
    (children || []).forEach(function (child) {
      if (child) node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  /* ---------------- YouTube ---------------- */

  // Достаёт ID ролика из любой ссылки YouTube (shorts, watch, youtu.be, embed, live)
  function youTubeId(url) {
    if (!url) return null;
    url = String(url).trim();
    if (/^[\w-]{11}$/.test(url)) return url;
    var m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/))([\w-]{11})/);
    return m ? m[1] : null;
  }

  // Сначала показываем только картинку-обложку (сайт грузится быстро),
  // а сам плеер YouTube подгружаем, когда человек нажмёт «play».
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function caption(index, title) {
    if (index === null && !title) return null;
    return el("figcaption", { class: "work__caption" }, [
      index === null ? null : el("span", { class: "work__num", text: pad(index + 1) }),
      title ? el("span", { text: title }) : null
    ]);
  }

  function placeholder(format) {
    return [el("span", { text: text("works.soon") }), el("span", { text: format })];
  }

  function videoCard(item, kind, index) {
    var id = youTubeId(item.url);
    var title = t(item.title);
    var media;

    if (id) {
      var thumb = el("img", {
        src: "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg",
        alt: "",
        loading: "lazy",
        decoding: "async",
        width: "480",
        height: "360"
      });
      var btn = el("button", {
        class: "yt",
        type: "button",
        "aria-label": text("works.play") + (title ? ": " + title : "")
      }, [thumb, el("span", { class: "yt__play" })]);

      btn.addEventListener("click", function () {
        var iframe = el("iframe", {
          src: "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1",
          title: title || "YouTube",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          allowfullscreen: true,
          referrerpolicy: "strict-origin-when-cross-origin"
        });
        btn.replaceWith(iframe);
      });

      media = el("div", { class: "work__media" }, [btn]);
    } else {
      media = el("div", { class: "work__media placeholder" }, placeholder(kind === "vertical" ? "9:16" : "16:9"));
    }

    return el("figure", { class: "work work--" + kind }, [media, caption(index, title)]);
  }

  function renderVideos(listId, groupId, items, kind) {
    var list = document.getElementById(listId);
    var group = document.getElementById(groupId);
    if (!list) return;
    list.textContent = "";
    items = items || [];
    if (group) group.hidden = items.length === 0;
    items.forEach(function (item, i) { list.appendChild(videoCard(item, kind, i)); });
  }

  /* ---------------- Дизайн ---------------- */

  function ratio(format) {
    var m = String(format || "16:9").match(/^(\d+(?:\.\d+)?)\s*[:/x]\s*(\d+(?:\.\d+)?)$/);
    return m ? m[1] + " / " + m[2] : "16 / 9";
  }

  function renderDesigns() {
    var list = document.getElementById("designs");
    var group = document.getElementById("group-design");
    if (!list) return;
    list.textContent = "";
    var items = SITE.designs || [];
    if (group) group.hidden = items.length === 0;

    items.forEach(function (item) {
      var title = t(item.title);
      var media;

      if (item.image) {
        var img = el("img", { src: item.image, alt: title, loading: "lazy", decoding: "async" });
        var btn = el("button", {
          class: "design__btn",
          type: "button",
          "aria-label": text("works.open") + (title ? ": " + title : "")
        }, [img]);
        btn.addEventListener("click", function () { openLightbox(item.image, title); });
        media = el("div", { class: "design__media" }, [btn]);
      } else {
        media = el("div", { class: "design__media placeholder" }, placeholder(item.format || "16:9"));
      }
      media.style.aspectRatio = ratio(item.format);

      list.appendChild(el("figure", { class: "design" }, [media, caption(null, title)]));
    });
  }

  /* ---------------- Окно просмотра картинки ---------------- */

  var lightbox = document.getElementById("lightbox");
  var lightboxBody = document.getElementById("lightbox-body");

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxBody) return;
    lightboxBody.textContent = "";
    lightboxBody.appendChild(el("img", { src: src, alt: alt || "" }));
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else window.open(src, "_blank", "noopener");
  }

  if (lightbox) {
    document.getElementById("lightbox-close").addEventListener("click", function () { lightbox.close(); });
    // Клик по тёмному фону закрывает окно
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) lightbox.close(); });
    lightbox.addEventListener("close", function () { lightboxBody.textContent = ""; });
  }

  /* ---------------- Услуги ---------------- */

  function renderServices() {
    var list = document.getElementById("services-list");
    if (!list) return;
    list.textContent = "";
    (SITE.services || []).forEach(function (s) {
      var price = t(s.price);
      list.appendChild(el("li", null, [
        el("h3", { class: "price__title", text: t(s.title) }),
        el("p", {
          class: "price__value" + (price ? "" : " price__value--request"),
          text: price || text("services.onRequest")
        }),
        t(s.text) ? el("p", { class: "price__text", text: t(s.text) }) : null
      ]));
    });
  }

  /* ---------------- О нас ---------------- */

  function renderTeam() {
    var list = document.getElementById("team-list");
    if (!list) return;
    list.textContent = "";
    (SITE.team || []).forEach(function (m) {
      var name = t(m.name);
      var photo = m.photo
        ? el("div", { class: "member__photo" }, [el("img", { src: m.photo, alt: name, loading: "lazy" })])
        : el("div", { class: "member__photo member__photo--empty", "aria-hidden": "true", text: name.charAt(0) });

      var tags = (m.tags || []).map(t).filter(Boolean).join(" / ");

      list.appendChild(el("article", { class: "member" }, [
        photo,
        el("div", { class: "member__head" }, [
          el("h3", { class: "member__name", text: name }),
          el("p", { class: "member__role", text: t(m.role) })
        ]),
        el("p", { class: "member__bio", text: t(m.bio) }),
        tags ? el("p", { class: "member__tags", text: tags }) : null
      ]));
    });
  }

  /* ---------------- Контакты ---------------- */

  var CONTACT_LABELS = {
    telegram: "Telegram",
    discord: "Discord",
    email: { ru: "Почта", en: "Email" },
    youtube: "YouTube",
    tiktok: "TikTok",
    instagram: "Instagram",
    twitch: "Twitch",
    vk: "VK",
    x: "X"
  };

  // Если вместо ссылки указан только ник — собираем ссылку сами
  var PROFILE_URLS = {
    telegram: "https://t.me/",
    youtube: "https://www.youtube.com/@",
    tiktok: "https://www.tiktok.com/@",
    instagram: "https://www.instagram.com/",
    twitch: "https://www.twitch.tv/",
    vk: "https://vk.com/",
    x: "https://x.com/"
  };

  function contactLink(c) {
    var value = String(c.value || "").trim();
    if (c.url) return c.url;
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    if (c.type === "email") return "mailto:" + value;
    if (PROFILE_URLS[c.type]) return PROFILE_URLS[c.type] + value.replace(/^@/, "");
    return "";
  }

  function renderContacts() {
    var list = document.getElementById("contacts-list");
    if (!list) return;
    list.textContent = "";

    (SITE.contacts || []).forEach(function (c) {
      var label = t(c.label) || t(CONTACT_LABELS[c.type]) || c.type;
      var value = String(c.value || "").trim();
      var shown = value.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
      var href = contactLink(c);
      var card;

      var parts = [
        el("span", { class: "contact__label", text: label }),
        el("span", { class: "contact__value", text: shown || text("contacts.soon") })
      ];

      if (href) {
        var external = !/^mailto:/i.test(href);
        parts.push(el("span", { class: "contact__arrow", "aria-hidden": "true", text: "→" }));
        card = el("a", {
          class: "contact",
          href: href,
          target: external ? "_blank" : null,
          rel: external ? "noopener noreferrer" : null
        }, parts);
      } else if (value) {
        // Например, ник в Discord: ссылки нет, поэтому по нажатию копируем
        parts.push(el("span", { class: "contact__arrow", "aria-hidden": "true", text: text("contacts.copyShort") }));
        card = el("button", { class: "contact", type: "button", title: text("contacts.copy") }, parts);
        card.addEventListener("click", function () { copy(value); });
      } else {
        card = el("div", { class: "contact contact--soon" }, parts);
      }
      list.appendChild(el("li", null, [card]));
    });
  }

  function copy(value) {
    function done() { showToast(text("contacts.copied") + ": " + value); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(done, function () { fallbackCopy(value); done(); });
    } else {
      fallbackCopy(value);
      done();
    }
  }

  function fallbackCopy(value) {
    var area = el("textarea", { readonly: true, style: "position:fixed;opacity:0;top:0;left:0" });
    area.value = value;
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); } catch (e) { /* не получилось — ничего страшного */ }
    area.remove();
  }

  var toastTimer;
  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 2200);
  }

  /* ---------------- Язык ---------------- */

  function applyLang(next) {
    lang = next;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var value = text(node.getAttribute("data-i18n"));
      if (value) node.textContent = value;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (node) {
      var value = text(node.getAttribute("data-i18n-html"));
      if (value) node.innerHTML = value;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (node) {
      var value = text(node.getAttribute("data-i18n-aria"));
      if (value) node.setAttribute("aria-label", value);
    });

    var title = text("meta.title");
    if (title) document.title = title;
    var description = document.querySelector('meta[name="description"]');
    if (description && text("meta.description")) description.setAttribute("content", text("meta.description"));

    document.querySelectorAll("#lang [data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });

    renderVideos("videos-vertical", "group-vertical", SITE.verticalVideos, "vertical");
    renderVideos("videos-horizontal", "group-horizontal", SITE.horizontalVideos, "horizontal");
    renderDesigns();
    renderServices();
    renderTeam();
    renderContacts();
  }

  var langSwitch = document.getElementById("lang");
  if (langSwitch) {
    if (languages.length < 2) {
      langSwitch.hidden = true;
    } else {
      langSwitch.querySelectorAll("[data-lang]").forEach(function (b) {
        if (languages.indexOf(b.getAttribute("data-lang")) === -1) b.hidden = true;
        b.addEventListener("click", function () {
          var next = b.getAttribute("data-lang");
          if (next === lang) return;
          try { localStorage.setItem(LANG_KEY, next); } catch (e) { /* хранилище недоступно */ }
          applyLang(next);
        });
      });
    }
  }

  /* ---------------- Шапка и меню ---------------- */

  var header = document.getElementById("header");
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    if (!nav || !burger) return;
    nav.classList.toggle("is-open", open);
    header.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  }

  if (burger) {
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
  }
  if (nav) {
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });
  document.addEventListener("click", function (e) {
    if (header && !header.contains(e.target)) setMenu(false);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 860) setMenu(false);
  });

  // Подсветка пункта меню того раздела, который сейчас на экране
  if ("IntersectionObserver" in window && nav) {
    var links = nav.querySelectorAll('a[href^="#"]');
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------------- Запуск ---------------- */

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  applyLang(lang);
})();
