/* Gautam Kumar — editorial layout behaviour.
   Everything here is enhancement: the page is fully readable without it. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- theme ---- */
  var KEY = "gk-theme";
  var btn = document.querySelector(".theme-btn");
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  } catch (e) {}

  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  if (btn) {
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      btn.setAttribute("aria-label", "Switch to " + (next === "dark" ? "light" : "dark") + " theme");
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  }

  /* ---- layout preference ----
     The link works on its own; this only records the choice so a returning
     visitor lands on the layout they picked. Never redirects on its own. */
  var layoutLink = document.querySelector("[data-layout]");
  if (layoutLink) {
    layoutLink.addEventListener("click", function () {
      try { localStorage.setItem("gk-layout", layoutLink.getAttribute("data-layout")); } catch (e) {}
    });
  }

  /* ---- scroll: progress bar, active nav, back-to-top ---- */
  var bar = document.querySelector(".progress");
  var toTop = document.querySelector(".to-top");
  var sections = [].slice.call(document.querySelectorAll("main section[id]"));
  var links = {};
  [].forEach.call(document.querySelectorAll(".topnav a"), function (a) {
    links[a.getAttribute("href").slice(1)] = a;
  });

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;

      if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
      if (toTop) toTop.classList.toggle("visible", y > 600);

      var active = null;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= 120) active = sections[i].id;
      }
      for (var id in links) {
        if (id === active) links[id].setAttribute("aria-current", "true");
        else links[id].removeAttribute("aria-current");
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---- reveal on scroll (only if supported; content is visible otherwise) ---- */
  var revealables = [].slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !reduced) {
    root.classList.add("js");
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -40px 0px" }
    );
    revealables.forEach(function (el) { io.observe(el); });

    /* Safety net: nothing may stay invisible because an observer misfired. */
    window.setTimeout(function () {
      revealables.forEach(function (el) { el.classList.add("in"); });
    }, 2500);
  }

  /* ---- project filter ---- */
  var filterBtns = [].slice.call(document.querySelectorAll(".filter-btn"));
  var projects = [].slice.call(document.querySelectorAll(".proj"));
  var counter = document.querySelector(".proj-count b");

  function applyFilter(f) {
    var shown = 0;
    projects.forEach(function (p) {
      var match = f === "all" || p.getAttribute("data-category") === f;
      p.classList.toggle("is-hidden", !match);
      if (match) shown++;
    });
    if (counter) counter.textContent = shown;
  }

  filterBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      filterBtns.forEach(function (o) {
        o.classList.remove("active");
        o.setAttribute("aria-pressed", "false");
      });
      b.classList.add("active");
      b.setAttribute("aria-pressed", "true");
      applyFilter(b.getAttribute("data-filter"));
    });
  });

  /* ---- animated counters for the stats row ---- */
  var statNums = [].slice.call(document.querySelectorAll(".stat-num"));
  if ("IntersectionObserver" in window && statNums.length) {
    var so = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          so.unobserve(en.target);
          var el = en.target;
          var raw = el.getAttribute("data-value") || el.textContent;
          var target = parseInt(raw, 10);
          var suffix = raw.replace(/[0-9]/g, "");
          if (isNaN(target) || reduced) return;
          var start = null, dur = 1100;
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) window.requestAnimationFrame(step);
          }
          el.textContent = "0" + suffix;
          window.requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 }
    );
    statNums.forEach(function (el) { so.observe(el); });
  }
})();
