(function () {
  "use strict";
  var CFG = window.GALLERY_CONFIG || {};
  var state = { items: [], filters: { collection: "all", theme: "all", region: "all", decade: "all" }, visible: 30 };
  var masonry = document.getElementById("gMasonry");
  var chips = document.getElementById("gChips");
  var count = document.getElementById("gCount");
  var more = document.getElementById("gMore");

  var THEME_EN = {
    "信仰与图像": "Faith & Image", "山水与自然": "Landscape & Nature",
    "人物与自我": "Portrait & Self", "城市与日常": "City & Everyday",
    "文字与观看": "Word & Looking", "材料与技法": "Material & Technique"
  };
  var REGION_EN = {
    "中国": "China", "东亚": "East Asia", "南亚": "South Asia",
    "西亚·北非": "West Asia / North Africa", "撒哈拉以南非洲": "Sub-Saharan Africa",
    "欧洲": "Europe", "北美": "North America", "中南美": "Latin America",
    "大洋洲": "Oceania", "跨地域": "Cross-regional", "东南亚": "Southeast Asia"
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function lang() {
    return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "zh";
  }
  function L(zh, en) { return lang() === "en" ? en : zh; }
  function titleOf(item) { return lang() === "en" ? (item.title_en || item.title) : item.title; }
  function urlOf(item) {
    if (CFG.preview) return item.thumb_preview_url || item.preview_url || item.url;
    return item.thumb_url || item.url;
  }
  function detailOf(item) {
    var base = item.detail_collection === "paintings"
      ? (CFG.paintStaticBase || "../../dist/paint/painting/")
      : (CFG.photoStaticBase || "../../dist/photo/photo/");
    return base + encodeURIComponent(item.detail_slug || item.id) + ".html";
  }
  function labelFor(kind, value) {
    if (kind === "theme") return lang() === "en" ? (THEME_EN[value] || value) : value;
    if (kind === "region") return lang() === "en" ? (REGION_EN[value] || value) : value;
    return value;
  }
  function filtered() {
    return state.items.filter(function (x) {
      return (state.filters.collection === "all" || x.collection === state.filters.collection) &&
        (state.filters.theme === "all" || x.curation_theme === state.filters.theme) &&
        (state.filters.region === "all" || x.region === state.filters.region) &&
        (state.filters.decade === "all" || x.decade === state.filters.decade);
    });
  }
  function values(field) {
    var seen = {};
    state.items.forEach(function (x) { if (x[field]) seen[x[field]] = (seen[x[field]] || 0) + 1; });
    return Object.keys(seen).sort().map(function (k) { return [k, seen[k]]; });
  }
  function chip(kind, value, label, n) {
    return '<button class="g-chip ' + (state.filters[kind] === value ? "on" : "") +
      '" data-kind="' + kind + '" data-value="' + esc(value) + '">' + esc(label) + " " + n + "</button>";
  }
  function group(kind, label, defs) {
    return '<div class="g-filter-group"><span class="g-filter-label">' + esc(label) + "</span>" +
      defs.map(function (d) { return chip(kind, d[0], d[1], d[2]); }).join("") + "</div>";
  }
  function renderChips() {
    if (!chips) return;
    var total = state.items.length;
    var coll = [["all", L("全部", "All"), total]];
    var photoN = state.items.filter(function (x) { return x.collection === "photos"; }).length;
    var paintN = state.items.filter(function (x) { return x.collection === "paintings"; }).length;
    if (photoN) coll.push(["photos", L("摄影", "Photography"), photoN]);
    if (paintN) coll.push(["paintings", L("绘画", "Painting"), paintN]);
    var themes = [["all", L("全部主题", "All themes"), total]].concat(values("curation_theme").map(function (d) {
      return [d[0], labelFor("theme", d[0]), d[1]];
    }));
    var regions = [["all", L("全部地域", "All regions"), total]].concat(values("region").map(function (d) {
      return [d[0], labelFor("region", d[0]), d[1]];
    }));
    var decades = [["all", L("全部年代", "All dates"), total]].concat(values("decade").map(function (d) {
      return [d[0], d[0], d[1]];
    }));
    chips.innerHTML = group("collection", L("类型", "Type"), coll) +
      group("theme", L("主题", "Theme"), themes) +
      group("region", L("地域", "Region"), regions) +
      group("decade", L("年代", "Date"), decades);
  }
  function card(item) {
    var img = urlOf(item);
    return '<a class="g-card" href="' + esc(detailOf(item)) + '">' +
      '<div class="pic"><img src="' + esc(img) + '" alt="' + esc(titleOf(item)) + '" loading="lazy" decoding="async"></div>' +
      '<div class="body"><div class="yr">' + esc(item.date_label || item.year || "—") + "</div><h3>" + esc(titleOf(item)) + "</h3>" +
      '<div class="meta"><span class="tag">' + (item.collection === "paintings" ? L("绘画", "Painting") : L("摄影", "Photography")) +
      "</span><span>" + esc(item.decade || "") + "</span></div></div></a>";
  }
  function render() {
    var rows = filtered();
    var shown = rows.slice(0, state.visible);
    count.textContent = L(rows.length + " 帧 · 点击进入完整档案",
                          rows.length + " images · open the full archive");
    masonry.innerHTML = shown.length ? shown.map(card).join("") : '<div class="g-empty">' + L("这一类还没有影像。", "No images in this category yet.") + "</div>";
    more.style.display = state.visible < rows.length ? "" : "none";
  }
  function load() {
    var base = CFG.manifestBase || "";
    var p1 = fetch(base + "manifests/photos.json").then(function (r) { return r.json(); }).catch(function () { return { images: [] }; });
    var p2 = fetch(base + "manifests/paintings.json").then(function (r) { return r.json(); }).catch(function () { return { images: [] }; });
    Promise.all([p1, p2]).then(function (res) {
      state.items = (res[0].images || []).concat(res[1].images || []);
      state.items = state.items.filter(function (x) { return x.primary !== false; });
      state.items.sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
      var q = new URLSearchParams(location.search);
      var cfg = CFG.filters || {};
      ["theme", "region", "decade", "collection"].forEach(function (k) {
        if (q.get(k)) state.filters[k] = q.get(k);
        else if (cfg[k]) state.filters[k] = cfg[k];
      });
      renderChips();
      render();
    });
  }
  chips.addEventListener("click", function (e) {
    var b = e.target.closest("[data-kind]");
    if (!b) return;
    state.filters[b.getAttribute("data-kind")] = b.getAttribute("data-value");
    state.visible = 30;
    renderChips();
    render();
  });
  more.addEventListener("click", function () {
    state.visible += 30;
    render();
  });
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-lang-toggle]")) {
      var nextLang = lang() === "en" ? "zh" : "en";
      document.documentElement.setAttribute("data-lang", nextLang);
      document.documentElement.setAttribute("lang", nextLang === "en" ? "en" : "zh-CN");
      try { localStorage.setItem("chenhua-lang", nextLang); } catch (err) {}
      setTimeout(function () { renderChips(); render(); }, 0);
    }
    if (e.target.closest("[data-themebtn]")) {
      var light = document.documentElement.getAttribute("data-theme") === "light";
      document.documentElement.setAttribute("data-theme", light ? "dark" : "light");
      try { localStorage.setItem("chenhua-theme", light ? "dark" : "light"); } catch (err2) {}
    }
  });
  load();
})();
