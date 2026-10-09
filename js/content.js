/* ==========================================================================
   СОДЕРЖИМОЕ САЙТА
   --------------------------------------------------------------------------
   Это единственный файл, который нужно менять, чтобы обновить сайт:
   ссылки на видео, картинки, тексты, цены и контакты.

   Правила, чтобы ничего не сломать:
   • Меняйте только текст внутри кавычек "...".
   • Не удаляйте запятые в конце строк и скобки { } [ ].
   • Текст на двух языках выглядит так:  { ru: "Привет", en: "Hello" }
   • Пустые кавычки "" означают «пока нет» — на сайте будет аккуратная заглушка.
   ========================================================================== */

window.SITE = {

  /* Языки сайта. Оставьте ["ru"] или ["en"], если нужен только один язык —
     тогда переключатель RU/EN исчезнет сам. */
  languages: ["ru", "en"],

  /* Название команды (в шапке и внизу сайта) */
  brand: { ru: "Саша и Архип", en: "Sasha & Arkhip" },


  /* ------------------------------------------------------------------------
     РАБОТЫ: ВИДЕО
     Вставьте ссылку на YouTube в поле url — подойдёт любая:
       https://youtube.com/shorts/xxxxxxxxxxx
       https://www.youtube.com/watch?v=xxxxxxxxxxx
       https://youtu.be/xxxxxxxxxxx
     Чтобы добавить ещё один ролик — скопируйте строку { ... } целиком,
     вместе с запятой в конце. Чтобы убрать — удалите строку.
     ------------------------------------------------------------------------ */

  // Вертикальные клипы (Shorts, TikTok, Reels) — формат 9:16
  verticalVideos: [
    { url: "", title: { ru: "Клип со стрима", en: "Stream clip" } },
    { url: "", title: { ru: "Клип со стрима", en: "Stream clip" } },
    { url: "", title: { ru: "Реклама бренда", en: "Brand ad" } },
    { url: "", title: { ru: "Клип со стрима", en: "Stream clip" } },
    { url: "", title: { ru: "Реклама бренда", en: "Brand ad" } },
    { url: "", title: { ru: "Клип со стрима", en: "Stream clip" } },
  ],

  // Горизонтальные видео — формат 16:9
  horizontalVideos: [
    { url: "", title: { ru: "Хайлайты стрима", en: "Stream highlights" } },
  ],


  /* ------------------------------------------------------------------------
     РАБОТЫ: ДИЗАЙН (картинки)
     image  — путь к картинке. Положите файл в папку images/works/
              и напишите, например: "images/works/preview-1.jpg"
     format — форма плитки: "16:9" (превью), "1:1" (логотип, аватар),
              "4:5" или "9:16" (вертикальная обложка)
     ------------------------------------------------------------------------ */
  designs: [
    { image: "", format: "16:9", title: { ru: "Превью для YouTube", en: "YouTube thumbnail" } },
    { image: "", format: "1:1",  title: { ru: "Логотип", en: "Logo" } },
    { image: "", format: "1:1",  title: { ru: "Аватар канала", en: "Channel avatar" } },
    { image: "", format: "16:9", title: { ru: "Превью для YouTube", en: "YouTube thumbnail" } },
  ],


  /* ------------------------------------------------------------------------
     УСЛУГИ И ЦЕНЫ
     price — цена, например "от 1 500 ₽" или { ru: "от 1 500 ₽", en: "from $20" }.
             Пусто "" — на сайте будет написано «По запросу».
     ------------------------------------------------------------------------ */
  services: [
    {
      title: { ru: "Вертикальный клип", en: "Vertical clip" },
      text:  { ru: "Shorts, TikTok, Reels до 60 секунд. Субтитры, звук, эффекты.", en: "Shorts, TikTok, Reels up to 60 seconds. Captions, sound, effects." },
      price: ""
    },
    {
      title: { ru: "Клипы для стримера", en: "Clips for streamers" },
      text:  { ru: "Регулярная нарезка ваших стримов. Объём — по договорённости.", en: "Regular clips from your streams. Volume by agreement." },
      price: ""
    },
    {
      title: { ru: "Горизонтальный монтаж", en: "Horizontal editing" },
      text:  { ru: "Ролики и хайлайты для YouTube, 16:9.", en: "Videos and highlights for YouTube, 16:9." },
      price: ""
    },
    {
      title: { ru: "Превью", en: "Thumbnail" },
      text:  { ru: "Превью для YouTube-видео или стрима.", en: "A thumbnail for a YouTube video or stream." },
      price: ""
    },
    {
      title: { ru: "Оформление канала", en: "Channel design" },
      text:  { ru: "Аватар, баннер, обложки, оверлеи для стрима.", en: "Avatar, banner, covers, stream overlays." },
      price: ""
    },
    {
      title: { ru: "Логотип", en: "Logo" },
      text:  { ru: "Для канала, стримера или бренда.", en: "For a channel, streamer or brand." },
      price: ""
    },
  ],


  /* ------------------------------------------------------------------------
     О НАС
     photo — путь к фото, например "images/team/sasha.jpg".
             Пусто "" — вместо фото будет заглушка.
     ------------------------------------------------------------------------ */
  team: [
    {
      name: { ru: "Саша", en: "Sasha" },
      role: { ru: "Монтаж", en: "Video editing" },
      photo: "",
      bio: {
        ru: "Монтирую вертикальные клипы со стримов и для брендов: выбираю момент, собираю ритм, делаю субтитры и звук.",
        en: "I edit vertical clips from streams and for brands: I pick the moment, set the pace, add captions and sound."
      },
      tags: ["Shorts", "TikTok", "Reels"]
    },
    {
      name: { ru: "Архип", en: "Arkhip" },
      role: { ru: "Дизайн", en: "Design" },
      photo: "",
      bio: {
        ru: "Рисую превью, обложки, баннеры и логотипы для каналов и брендов.",
        en: "I design thumbnails, covers, banners and logos for channels and brands."
      },
      tags: [{ ru: "Превью", en: "Thumbnails" }, { ru: "Обложки", en: "Covers" }, { ru: "Логотипы", en: "Logos" }]
    },
  ],


  /* ------------------------------------------------------------------------
     КОНТАКТЫ
     В value пишите ник или адрес — ссылка соберётся сама:
       telegram  — "@nickname"
       discord   — "nickname" (по нажатию ник скопируется)
       email     — "name@mail.com"
       youtube, tiktok, instagram, twitch, vk, x — "@nickname" или полная ссылка
     Если value пустое — строка будет с пометкой «скоро».
     Ненужную строку можно удалить целиком.
     ------------------------------------------------------------------------ */
  contacts: [
    { type: "telegram",  value: "" },
    { type: "discord",   value: "" },
    { type: "email",     value: "" },
    { type: "youtube",   value: "" },
    { type: "tiktok",    value: "" },
    { type: "instagram", value: "" },
  ],


  /* ------------------------------------------------------------------------
     ТЕКСТЫ НА СТРАНИЦЕ
     ------------------------------------------------------------------------ */
  texts: {
    meta: {
      title: { ru: "Саша и Архип — монтаж клипов и дизайн", en: "Sasha & Arkhip — video editing & design" },
      description: {
        ru: "Монтаж вертикальных клипов для Shorts, TikTok и Reels. Превью, обложки и логотипы для стримеров и брендов.",
        en: "Vertical clip editing for Shorts, TikTok and Reels. Thumbnails, covers and logos for streamers and brands."
      }
    },
    nav: {
      works:    { ru: "Работы",   en: "Work" },
      services: { ru: "Цены",     en: "Pricing" },
      about:    { ru: "О нас",    en: "About" },
      contacts: { ru: "Контакты", en: "Contact" },
      menu:     { ru: "Меню",     en: "Menu" }
    },
    hero: {
      title: {
        ru: "Монтируем вертикальные клипы и делаем дизайн для стримеров и брендов",
        en: "We edit vertical clips and design for streamers and brands"
      },
      tags: { ru: "Shorts, TikTok, Reels, превью, обложки, логотипы", en: "Shorts, TikTok, Reels, thumbnails, covers, logos" },
      cta:  { ru: "Связаться", en: "Get in touch" }
    },
    works: {
      title:      { ru: "Работы", en: "Work" },
      vertical:   { ru: "Вертикальные клипы", en: "Vertical clips" },
      horizontal: { ru: "Горизонтальные видео", en: "Horizontal videos" },
      design:     { ru: "Дизайн", en: "Design" },
      soon:       { ru: "Скоро", en: "Soon" },
      play:       { ru: "Смотреть", en: "Play" },
      open:       { ru: "Открыть", en: "Open" }
    },
    services: {
      title: { ru: "Услуги и цены", en: "Services & pricing" },
      lead: {
        ru: "Цена зависит от длины и сроков. Напишите, что нужно, — назовём точную.",
        en: "The price depends on length and deadline. Tell us what you need and we'll give you an exact quote."
      },
      onRequest: { ru: "По запросу", en: "On request" },
      cta: { ru: "Узнать цену", en: "Get a quote" }
    },
    about: {
      title: { ru: "О нас", en: "About us" }
    },
    contacts: {
      title: { ru: "Связаться", en: "Get in touch" },
      lead: {
        ru: "Напишите, что нужно сделать и к какому сроку.",
        en: "Tell us what you need and by when."
      },
      soon:   { ru: "скоро", en: "soon" },
      copy:   { ru: "Нажмите, чтобы скопировать", en: "Click to copy" },
      copyShort: { ru: "копировать", en: "copy" },
      copied: { ru: "Скопировано", en: "Copied" }
    },
    footer: {
      top: { ru: "Наверх", en: "Back to top" }
    },
    close: { ru: "Закрыть", en: "Close" }
  }
};
