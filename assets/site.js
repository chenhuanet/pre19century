(function () {
  "use strict";
  var root = document.documentElement;
  var THEME_KEY = "chenhua-theme";

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
      var en = (root.getAttribute("data-lang") || "zh") === "en";
      b.setAttribute("aria-label", theme === "light"
        ? (en ? "Switch to dark" : "切换到深色")
        : (en ? "Switch to light" : "切换到浅色"));
    }
  }

  var initial = readCookie(THEME_KEY);
  if (initial !== "light" && initial !== "dark") {
    try { initial = localStorage.getItem(THEME_KEY) || ""; } catch (e) { initial = ""; }
  }
  if (initial !== "light" && initial !== "dark") {
    initial = root.getAttribute("data-theme") || "dark";
  }
  applyTheme(initial);

  var btn = document.querySelector("[data-themebtn]");
  if (btn) {
    btn.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
    });
  }

  var langLink = document.querySelector("[data-lang-link]");
  if (langLink) {
    langLink.addEventListener("click", function () {
      try {
        localStorage.setItem("chenhua-lang", root.getAttribute("data-lang") === "en" ? "zh" : "en");
      } catch (e) {}
    });
  }
})();
