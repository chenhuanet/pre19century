(function () {
  "use strict";
  var root = document.documentElement;
  var THEME_KEY = "chenhua-theme";
  var LANG_KEY = "chenhua-lang";

  function readCookie(name) {
    try {
      var hit = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
      return hit ? decodeURIComponent(hit[1]) : "";
    } catch (e) { return ""; }
  }

  function cookieDomain() {
    var host = location.hostname;
    if (host === "chenhua.net" || host.slice(-12) === ".chenhua.net") return ".chenhua.net";
    return "";
  }

  function writeCookie(name, value) {
    try {
      var domain = cookieDomain();
      document.cookie = name + "=" + encodeURIComponent(value) +
        "; path=/; max-age=31536000; SameSite=Lax" + (domain ? "; domain=" + domain : "");
    } catch (e) {}
  }

  function meta() { return document.querySelector('meta[name="theme-color"]'); }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    writeCookie(THEME_KEY, theme);
    var m = meta();
    if (m) m.setAttribute("content", theme === "light" ? "#f6f2ea" : "#0d0c0b");
    var b = document.querySelector("[data-themebtn]");
    if (b) {
      var lang = root.getAttribute("data-lang") || "zh";
      b.setAttribute("aria-label", theme === "light"
        ? (lang === "en" ? "Switch to dark" : "切换到深色")
        : (lang === "en" ? "Switch to light" : "切换到浅色"));
    }
  }

  function bodyData(name) {
    return document.body ? (document.body.getAttribute(name) || "") : "";
  }

  var HEAD_ICONS = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    lang: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.8 12h16.4M12 3.5c2.1 2.4 3.2 5.4 3.2 8.5s-1.1 6.1-3.2 8.5c-2.1-2.4-3.2-5.4-3.2-8.5S9.9 5.9 12 3.5z"/></svg>'
  };

  function textOf(el) { return (el.textContent || "").replace(/\s+/g, ""); }

  function findSearchLink() {
    var nodes = document.querySelectorAll(".desknav a, .masthead-nav a, .sf-nav a");
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      var href = a.getAttribute("href") || "";
      if (textOf(a).toLowerCase().indexOf("search") >= 0 ||
          /(^|\/)search\/(?:$|index\.html)|search\/(?:index\.html)?$/.test(href)) {
        try { return new URL(href, location.href).href; } catch (e) { return href; }
      }
    }
    return "";
  }

  function removeSearchLinks() {
    var nodes = document.querySelectorAll(".desknav a, .masthead-nav a, .sf-nav a");
    for (var i = nodes.length - 1; i >= 0; i--) {
      var a = nodes[i];
      if (textOf(a).toLowerCase().indexOf("search") >= 0 ||
          /(^|\/)search\/(?:$|index\.html)/.test(a.getAttribute("href") || "")) {
        if (a.parentNode) a.parentNode.removeChild(a);
      }
    }
  }

  function removeHomeNavLink() {
    Array.prototype.forEach.call(document.querySelectorAll(".desknav, .masthead-nav"), function (nav) {
      var first = nav.querySelector("a");
      if (!first) return;
      var label = textOf(first);
      var href = first.getAttribute("href") || "";
      if (label.indexOf("尘画") >= 0 || label === "Frame & Grain" ||
          /^(\.\.\/|\.\.\/\.\.\/dist\/main\/|index\.html|\.\/|\/)$/.test(href)) {
        nav.removeChild(first);
      }
    });
  }

  function localizeBrand() {
    Array.prototype.forEach.call(document.querySelectorAll(".brand, .g-brand"), function (brand) {
      var brandLink = brand.closest("a") || brand;
      if (brandLink && root.getAttribute("data-lang") === "en") {
        brandLink.setAttribute("aria-label", "Frame & Grain home");
      }
      if (brand.querySelector(".wm-en")) return;
      var wm = brand.querySelector(".wm");
      if (!wm) return;
      var en = document.createElement("span");
      en.className = "wm-en";
      en.textContent = "Frame & Grain";
      wm.parentNode.insertBefore(en, wm.nextSibling);
    });
  }

  function headSearchForm(href) {
    var label = root.getAttribute("data-lang") === "en" ? "Search themes, people, places" : "搜主题、人物、地点";
    var form = document.createElement("form");
    form.className = "head-search";
    form.setAttribute("role", "search");
    form.setAttribute("action", href);
    form.innerHTML = '<input type="search" name="q" autocomplete="off" aria-label="' +
      (root.getAttribute("data-lang") === "en" ? "Search" : "搜索") + '" placeholder="' + label + '">' +
      '<button type="submit" aria-label="' + (root.getAttribute("data-lang") === "en" ? "Search" : "搜索") + '">' +
      HEAD_ICONS.search + "</button>";
    return form;
  }

  function normalizeHeader(header, searchHref) {
    var tools = header.querySelector(".right") || header.querySelector(".topmeta") || header.querySelector(".g-tools");
    if (!tools) return;
    var gallery = header.classList.contains("g-head");
    var iconClass = gallery ? "g-tool" : "iconbtn";
    if (searchHref) {
      Array.prototype.forEach.call(header.querySelectorAll(".head-search"), function (old) {
        if (old.parentNode) old.parentNode.removeChild(old);
      });
      var form = headSearchForm(searchHref);
      tools.parentNode.insertBefore(form, tools);
      header.className += " has-head-search";
      if (!header.querySelector(".searchbtn")) {
        var a = document.createElement("a");
        a.className = iconClass + " searchbtn";
        a.href = searchHref;
        a.setAttribute("aria-label", root.getAttribute("data-lang") === "en" ? "Search" : "搜索");
        a.innerHTML = HEAD_ICONS.search;
        tools.insertBefore(a, tools.firstChild);
      }
    }
    var langBtn = header.querySelector("[data-lang-toggle]");
    if (langBtn) {
      langBtn.innerHTML = HEAD_ICONS.lang;
      if (gallery) langBtn.className = "g-tool g-lang";
      langBtn.setAttribute("aria-label", root.getAttribute("data-lang") === "en" ? "Switch to Chinese" : "切换到英文");
    }
  }

  function addFooterCopy() {
    Array.prototype.forEach.call(document.querySelectorAll(".site-foot"), function (foot) {
      if (foot.querySelector(".sf-copy") || foot.querySelector(".sf-left")) return;
      var copy = document.createElement("span");
      copy.className = "sf-copy";
      copy.innerHTML = '<span data-l="zh">© 2026 尘画 · <a href="https://chenhua.net">chenhua.net</a></span>' +
        '<span data-l="en">© 2026 Frame & Grain · <a href="https://chenhua.net">chenhua.net</a></span>';
      foot.appendChild(copy);
    });
  }

  function markFooterLinks() {
    Array.prototype.forEach.call(document.querySelectorAll(".site-foot .sf-nav a"), function (a) {
      var href = (a.getAttribute("href") || "").toLowerCase();
      if (/(search|about|rights)/.test(href)) {
        a.setAttribute("data-sf-drop", "1");
      } else {
        a.setAttribute("data-sf-keep", "1");
      }
    });
  }

  var HEAD_NAV = [
    ["https://chenhua.net/themes/", "主题", "Themes"],
    ["https://chenhua.net/timeline/", "时间线", "Timeline"],
    ["https://chenhua.net/today/calendar.html", "日历", "Calendar"],
    ["https://photo.chenhua.net/", "摄影", "Photography"],
    ["https://paint.chenhua.net/", "绘画", "Painting"],
    ["https://netcn.org/", "导航", "Directory"]
  ];
  var FOOT_NAV = [
    ["https://chenhua.net/", "出尘入画", '<span class="sf-brand-long">Frame &amp; Grain</span><span class="sf-brand-short">Frame</span>'],
    ["https://chenhua.net/images/", "图片库", "Image Library"],
    ["https://chenhua.net/themes/", "主题", "Themes"],
    ["https://chenhua.net/timeline/", "时间线", "Timeline"],
    ["https://chenhua.net/today/calendar.html", "日历", "Calendar"],
    ["https://photo.chenhua.net/", "摄影", "Photography"],
    ["https://paint.chenhua.net/", "绘画", "Painting"],
    ["https://netcn.org/", "导航", "Directory"]
  ];

  function installGlobalNav() {
    var host = location.hostname;
    var path = location.pathname.replace(/\/index\.html$/, "/");
    var kind = (host === "photo.chenhua.net" || path.indexOf("/photo/") === 0)
      ? "photo"
      : ((host === "paint.chenhua.net" || path.indexOf("/paint/") === 0) ? "paint" : "main");
    function activeFor(href) {
      if (href.indexOf("chenhua.net/themes/") >= 0) return kind === "main" && path.indexOf("/themes") >= 0;
      if (href.indexOf("chenhua.net/timeline/") >= 0) return kind === "main" && path.indexOf("/timeline") >= 0;
      if (href.indexOf("chenhua.net/today/") >= 0) return kind === "main" && path.indexOf("/today") >= 0;
      if (href === "https://photo.chenhua.net/") return kind === "photo";
      if (href === "https://paint.chenhua.net/") return kind === "paint";
      return false;
    }
    function a(item) {
      var href = item[0];
      return '<a href="' + href + '"' + (activeFor(href) ? ' aria-current="page"' : '') +
        '><span data-l="zh">' + item[1] + '</span><span data-l="en">' + item[2] + '</span></a>';
    }
    var head = HEAD_NAV.map(a);
    var foot = FOOT_NAV.map(a);
    var headHtml = head.join("");
    var footHtml = foot.join("");
    Array.prototype.forEach.call(document.querySelectorAll(".desknav, .masthead-nav"), function (nav) {
      nav.innerHTML = headHtml;
    });
    Array.prototype.forEach.call(document.querySelectorAll(".site-foot .sf-nav"), function (nav) {
      nav.innerHTML = footHtml;
    });
    Array.prototype.forEach.call(document.querySelectorAll(".brand, .g-brand"), function (brand) {
      var link = brand.closest("a") || brand;
      if (link && link.tagName === "A") link.setAttribute("href", "https://chenhua.net/");
      var sub = brand.querySelector(".sub");
      if (sub) sub.innerHTML = '<span data-l="zh">尘归尘，画归画</span><span data-l="en">Image as history</span>';
      var mark = brand.querySelector("img.brand-mark");
      if (mark) mark.setAttribute("src", "https://chenhua.net/assets/leaf/joy.svg");
    });
  }

  var searchHref = findSearchLink();
  if (!searchHref) searchHref = "https://chenhua.net/search/";
  removeSearchLinks();
  removeHomeNavLink();
  localizeBrand();
  installGlobalNav();
  markFooterLinks();
  addFooterCopy();
  Array.prototype.forEach.call(document.querySelectorAll(".appbar, .masthead, .g-head"), function (header) {
    normalizeHeader(header, searchHref);
  });
  function refreshGlobalNav() {
    installGlobalNav();
    markFooterLinks();
  }
  refreshGlobalNav();
  [0, 180, 700, 1600].forEach(function (delay) {
    setTimeout(refreshGlobalNav, delay);
  });
  window.addEventListener("load", refreshGlobalNav);
  var footCss = document.createElement("style");
  footCss.textContent =
    ".wm-en{display:none;font-family:var(--serif);font-size:18px;line-height:1;letter-spacing:.06em;color:var(--accent,#c8a24a);white-space:nowrap}" +
    "html[data-lang=\"en\"] .brand .wm,html[data-lang=\"en\"] .g-brand .wm{display:none}" +
    "html[data-lang=\"en\"] .brand .wm-en,html[data-lang=\"en\"] .g-brand .wm-en{display:inline-block}" +
    ".site-foot .sf-nav a[data-sf-drop]{display:none}" +
    ".site-foot .sf-brand-short{display:none}" +
    "@media(max-width:899px){html[data-lang=\"en\"] .site-foot .sf-brand-long{display:none}html[data-lang=\"en\"] .site-foot .sf-brand-short{display:inline}}" +
    ".site-foot .sf-copy{display:inline-flex;align-items:center;font-size:9.5px;color:var(--dim,var(--muted));white-space:nowrap;letter-spacing:.01em}" +
    ".site-foot .sf-copy a{color:inherit;text-decoration:none;border-bottom:1px solid transparent}" +
    ".site-foot .sf-copy a:hover{color:var(--accent,var(--text));border-color:var(--accent,var(--text))}" +
    "html[data-lang=\"en\"] .site-foot .sf-copy [data-l=\"zh\"],html[data-lang=\"zh\"] .site-foot .sf-copy [data-l=\"en\"]{display:none}";
  document.head.appendChild(footCss);
  if (searchHref) {
    var headCss = document.createElement("style");
    headCss.textContent =
      ".head-search{display:flex;align-items:center;gap:3px;height:32px;min-width:92px;max-width:190px;flex:1 1 140px;" +
      "margin-left:auto;margin-right:3px;padding:0 4px 0 11px;border:1px solid var(--line,var(--rule,#3a332a));border-radius:999px;" +
      "background:var(--surface,var(--panel,#171412));color:var(--muted)}" +
      ".head-search input{min-width:0;width:100%;height:100%;border:0;outline:0;background:transparent;color:var(--text,var(--ink,#ede6d6));font:inherit;font-size:11px}" +
      ".head-search input::placeholder{color:var(--dim,var(--muted,#9b9184))}" +
      ".head-search button{width:24px;height:24px;flex:none;display:grid;place-items:center;border-radius:50%;color:var(--muted)}" +
      ".head-search button svg{width:15px;height:15px}" +
      ".g-tool svg,.iconbtn svg{width:18px;height:18px;flex:none}" +
      ".masthead.has-head-search .topmeta,.g-head.has-head-search .g-tools{margin-left:0}" +
      ".g-lang{font-size:0;padding:0;display:grid;place-items:center}" +
      "@media(max-width:899px){.head-search{display:none}}" +
      "@media(max-width:430px){.brand .wm-en,.g-brand .wm-en{font-size:15px;letter-spacing:.04em}}";
    document.head.appendChild(headCss);
  }

  function applyLang(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "en" ? "en" : "zh-CN");
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    writeCookie(LANG_KEY, lang);
    var t = bodyData(lang === "en" ? "data-title-en" : "data-title-zh");
    if (t) document.title = t;
    var d = bodyData(lang === "en" ? "data-desc-en" : "data-desc-zh");
    var m = document.querySelector('meta[name="description"]');
    if (m && d) m.setAttribute("content", d);
    var b = document.querySelector("[data-lang-toggle]");
    if (b) b.setAttribute("aria-label", lang === "en" ? "Switch to Chinese" : "切换到英文");
    if (window.history && history.replaceState) {
      var u = new URL(location.href);
      if (lang === "en") u.searchParams.set("lang", "en");
      else u.searchParams.delete("lang");
      history.replaceState(null, "", u.toString());
    }
    Array.prototype.forEach.call(document.querySelectorAll("img[data-alt-en]"), function (img) {
      var zh = img.getAttribute("data-alt-zh") || img.getAttribute("alt") || "";
      img.setAttribute("alt", lang === "en" ? (img.getAttribute("data-alt-en") || zh) : zh);
    });
    var hs = document.querySelector(".head-search input");
    if (hs) {
      hs.setAttribute("placeholder", lang === "en" ? "Search themes, people, places" : "搜主题、人物、地点");
      hs.setAttribute("aria-label", lang === "en" ? "Search" : "搜索");
    }
    var hsb = document.querySelector(".head-search button");
    if (hsb) hsb.setAttribute("aria-label", lang === "en" ? "Search" : "搜索");
    var sbtn = document.querySelector(".head-search + .right .searchbtn, .has-head-search .searchbtn");
    if (sbtn) sbtn.setAttribute("aria-label", lang === "en" ? "Search" : "搜索");
  }

  var initialTheme = readCookie(THEME_KEY);
  if (initialTheme !== "light" && initialTheme !== "dark") {
    try { initialTheme = localStorage.getItem(THEME_KEY) || ""; } catch (e) {}
  }
  if (initialTheme !== "light" && initialTheme !== "dark") {
    initialTheme = root.getAttribute("data-theme") ||
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  }
  applyTheme(initialTheme);
  var lang = "";
  try {
    lang = new URLSearchParams(location.search).get("lang") ||
      readCookie(LANG_KEY) || localStorage.getItem(LANG_KEY) || "";
  } catch (e) {}
  if (lang !== "en" && lang !== "zh") lang = root.getAttribute("data-lang") || "zh";
  applyLang(lang);

  document.addEventListener("click", function (e) {
    var tb = e.target.closest("[data-themebtn]");
    if (tb) {
      applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
      return;
    }
    var lb = e.target.closest("[data-lang-toggle]");
    if (lb) {
      applyLang(root.getAttribute("data-lang") === "en" ? "zh" : "en");
    }
  });

  var TAB_ICONS = [
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 10.5L12 4l8 6.5V20H4z"/><path d="M9.5 20v-5h5v5"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 7h8M8 11h6"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 3v18"/><path d="M10 7h8M10 12h6M10 17h9"/><circle cx="6" cy="7" r="1.6" fill="currentColor" stroke="none"/><circle cx="6" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="6" cy="17" r="1.6" fill="currentColor" stroke="none"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="14" rx="2.5"/><circle cx="12" cy="13" r="4"/><path d="M8 6l1.5-2h5L16 6"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 5-5c0-2.8-4-5-9-5z"/><circle cx="7.5" cy="10" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="14" cy="7" r="1"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2.2 5.3-5.3 2.2 2.2-5.3z"/></svg>'
  ];

  function addTabbar() {
    Array.prototype.forEach.call(document.querySelectorAll(".tabbar"), function (el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    var links = FOOT_NAV.map(function (item) {
      var a = document.createElement("a");
      a.setAttribute("href", item[0]);
      a.innerHTML = '<span data-l="zh">' + item[1] + '</span><span data-l="en">' + item[2] + "</span>";
      return a;
    });
    var current = location.pathname.replace(/\/index\.html$/, "/");
    var best = -1;
    var bestLen = -1;
    links.forEach(function (a, i) {
      try {
        var u = new URL(a.href, location.href);
        var sameHost = u.hostname === location.hostname;
        if (!sameHost && kind === "main") {
          sameHost = u.hostname.replace(/^www\./, "") === location.hostname.replace(/^www\./, "");
        }
        if (sameHost && u.pathname !== "/" &&
            current.indexOf(u.pathname) === 0 && u.pathname.length > bestLen) {
          best = i;
          bestLen = u.pathname.length;
        }
      } catch (e) {}
    });
    if (best < 0) {
      if (location.hostname === "photo.chenhua.net") best = 4;
      else if (location.hostname === "paint.chenhua.net") best = 5;
      else best = 0;
    }
    function tabIconFor(a) {
      var href = (a.getAttribute("href") || "").toLowerCase();
      var label = textOf(a).toLowerCase();
      if (/netcn\.org/.test(href) || label.indexOf("directory") >= 0 || label.indexOf("导航") >= 0) return 7;
      if (/\/today\//.test(href)) return 3;
      if (/\/timeline\//.test(href)) return 2;
      if (/\/themes\//.test(href)) return 1;
      if (/photo\.|\/photo\//.test(href)) return 4;
      if (/paint\.|\/paint\//.test(href)) return 5;
      if (/\/search\//.test(href)) return 6;
      return 0;
    }
    var nav = document.createElement("nav");
    nav.className = "tabbar site-tabbar";
    nav.setAttribute("aria-label", root.getAttribute("data-lang") === "en" ? "Site navigation" : "全站导航");
    links.forEach(function (a, i) {
      var href = a.getAttribute("href") || "";
      var label = a.innerHTML;
      if (a.querySelector(".sf-brand-long") && a.querySelector(".sf-brand-short")) {
        label = root.getAttribute("data-lang") === "en"
          ? '<span data-l="en">' + a.querySelector(".sf-brand-short").textContent + "</span>"
          : '<span data-l="zh">尘画</span>';
      }
      nav.innerHTML += '<a class="tab' + (i === best ? " on" : "") + '" href="' + href + '"' +
        (i === best ? ' aria-current="page"' : "") + '>' +
        (TAB_ICONS[tabIconFor(a)] || "") + '<span class="tab-label">' + label + "</span></a>";
    });
    var style = document.getElementById("site-tabbar-style");
    if (!style) {
    style = document.createElement("style");
    style.id = "site-tabbar-style";
    style.textContent =
      ".site-tabbar{display:none}" +
      "html[data-lang=\"en\"] .site-tabbar [data-l=\"zh\"]{display:none}" +
      "html[data-lang=\"zh\"] .site-tabbar [data-l=\"en\"]{display:none}" +
      "@media(max-width:899px){" +
      "body.has-site-tabbar{padding-bottom:calc(62px + env(safe-area-inset-bottom))}" +
      ".site-tabbar{display:grid;position:fixed;left:0;right:0;bottom:0;z-index:40;" +
      "grid-template-columns:repeat(" + Math.max(links.length, 1) + ",minmax(0,1fr));gap:2px;align-items:center;" +
      "border-top:1px solid var(--line,var(--rule,#302b25));" +
      "background:var(--tabbar-bg,var(--bg,var(--paper,#0d0c0b)));" +
      "backdrop-filter:blur(20px);padding:5px 4px calc(5px + env(safe-area-inset-bottom))}" +
      ".site-tabbar .tab{display:flex;flex-direction:column;align-items:center;gap:2px;" +
      "min-width:0;padding:3px 0 2px;border-radius:10px;text-decoration:none;" +
      "color:var(--dim,var(--muted,var(--ink,#9b9184)));font-size:9.5px;letter-spacing:.02em}" +
      ".site-tabbar .tab svg{width:20px;height:20px;flex:none}" +
      ".site-tabbar .tab.on{color:var(--accent,#c8a24a)}" +
      ".site-tabbar .tab-label{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      "@media(max-width:430px){.site-tabbar .tab{font-size:8.5px;letter-spacing:0}.site-tabbar .tab svg{width:19px;height:19px}}" +
      "body.has-site-tabbar .site-foot .sf-nav{display:none}" +
      "body.has-site-tabbar .site-foot{margin-top:18px}" +
      "}";
    document.head.appendChild(style);
    }
    document.body.appendChild(nav);
    document.body.classList.add("has-site-tabbar");
  }

  function ensureTabbar() {
    var bars = document.querySelectorAll(".tabbar");
    if (bars.length === 1 && bars[0].classList.contains("site-tabbar") &&
        bars[0].querySelectorAll("a").length === FOOT_NAV.length) return;
    addTabbar();
  }

  function bootTabbar() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", ensureTabbar);
    } else {
      ensureTabbar();
    }
    window.addEventListener("load", ensureTabbar);
    [0, 180, 700, 1600].forEach(function (delay) {
      setTimeout(ensureTabbar, delay);
    });
  }
  bootTabbar();
})();

/* Theme image randomisation.  The static 8 + 8 cards are a no-JS fallback;
   every page load replaces them with a fresh pick from the theme's own pool. */
(function () {
  if (window.__chenhuaThemeRandom) return;
  window.__chenhuaThemeRandom = true;

  function readJSON(id) {
    var node = document.getElementById(id);
    if (!node) return null;
    try { return JSON.parse(node.textContent || "{}"); } catch (e) { return null; }
  }

  function shuffled(items) {
    var a = items.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function choose(items, n, used) {
    var out = [];
    var list = shuffled(items || []);
    for (var i = 0; i < list.length && out.length < n; i++) {
      var item = list[i];
      if (!item || !item.img || used[item.img]) continue;
      used[item.img] = true;
      out.push(item);
    }
    return out;
  }

  function applyThemePool(pool) {
    if (!pool) return;
    var used = {};
    [["painting", "paint-grid"], ["photo", "photo-grid"]].forEach(function (pair) {
      var kind = pair[0], id = pair[1];
      var grid = document.getElementById(id);
      if (!grid) return;
      var all = pool[kind] || [];
      // A pool of exactly eight would repeat the same whole set on every
      // load. Take seven from it; larger pools keep the full 8-card grid.
      var take = all.length > 8 ? 8 : (all.length > 1 ? 7 : all.length);
      var items = choose(all, take, used);
      if (!items.length) return;
      grid.innerHTML = items.map(function (x) { return x.html; }).join("");
      var counter = grid.parentNode.querySelector("h2 .n");
      if (counter) counter.textContent = String(items.length);
    });
  }

  function bootThemeDetail() {
    var pool = readJSON("theme-pool");
    if (pool && (pool.painting || pool.photo)) {
      applyThemePool(pool);
      return;
    }
    var node = document.getElementById("theme-pool");
    var src = node && node.getAttribute("data-src");
    if (!src || !window.fetch) return;
    fetch(src, { credentials: "same-origin" })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(applyThemePool)
      .catch(function () {});
  }

  function bootThemeIndex() {
    var map = readJSON("theme-covers");
    if (!map) return;
    var used = {};
    var cards = document.querySelectorAll("[data-theme-key]");
    for (var i = 0; i < cards.length; i++) {
      var key = cards[i].getAttribute("data-theme-key");
      var candidates = shuffled(map[key] || []);
      var pick = null;
      for (var j = 0; j < candidates.length; j++) {
        if (candidates[j].img && !used[candidates[j].img]) { pick = candidates[j]; break; }
      }
      if (!pick && candidates.length) pick = candidates[0];
      if (!pick || !pick.img) continue;
      var img = cards[i].querySelector(".pic img");
      if (!img) continue;
      img.src = pick.img;
      img.alt = pick.alt || img.alt;
      used[pick.img] = true;
    }
  }

  function bootThemeRandom() {
    bootThemeDetail();
    bootThemeIndex();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootThemeRandom);
  } else {
    bootThemeRandom();
  }
})();
