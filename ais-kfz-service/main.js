/* ==========================================================================
   AIS Kfz Service — Interactions
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Header stuck state ---- */
  var header = document.getElementById("header");
  function onScroll() {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile drawer ---- */
  var drawer = document.getElementById("drawer");
  var burger = document.getElementById("burger");
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("is-open");
    if (burger) burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    var first = drawer.querySelector(".drawer__close");
    if (first) first.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    if (burger) { burger.setAttribute("aria-expanded", "false"); burger.focus(); }
    document.body.style.overflow = "";
  }
  if (burger) burger.addEventListener("click", openDrawer);
  var closeBtn = document.getElementById("drawerClose");
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (drawer) {
    drawer.addEventListener("click", function (e) {
      if (e.target.hasAttribute("data-close") || e.target.closest("[data-close]")) closeDrawer();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")) closeDrawer();
  });

  /* ---- FAQ accordion ---- */
  var faqList = document.getElementById("faqList");
  if (faqList) {
    faqList.querySelectorAll(".qa__q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".qa");
        var panel = item.querySelector(".qa__a");
        var isOpen = item.classList.contains("is-open");

        // close siblings (single-open accordion)
        faqList.querySelectorAll(".qa.is-open").forEach(function (open) {
          if (open !== item) {
            open.classList.remove("is-open");
            open.querySelector(".qa__a").style.height = "0px";
            open.querySelector(".qa__q").setAttribute("aria-expanded", "false");
          }
        });

        if (isOpen) {
          panel.style.height = "0px";
          item.classList.remove("is-open");
          btn.setAttribute("aria-expanded", "false");
        } else {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
          panel.style.height = panel.firstElementChild.offsetHeight + "px";
        }
      });
    });
    // keep open panel height correct on resize
    window.addEventListener("resize", function () {
      var open = faqList.querySelector(".qa.is-open .qa__a");
      if (open) open.style.height = open.firstElementChild.offsetHeight + "px";
    });
  }

  /* ---- Smooth scroll (Lenis) + scroll reveals + hero headline ----
     Design intent: subtle, restrained motion. Lenis smooths the scroll;
     reveals fade in on enter; the hero headline does one quiet line reveal.

     Reveals are triggered with IntersectionObserver, NOT ScrollTrigger.batch:
     with smooth scroll + deep links / anchor jumps, a batch can skip firing
     and leave a section blank. IO fires reliably on every scroll, jump and
     #deep-link, and the visual (the .is-in CSS transition) is identical.
     Everything degrades to plain native scroll for reduced-motion.          */
  var reveals = document.querySelectorAll(".reveal");

  function revealAll() {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  if (reduceMotion) {
    revealAll();                       // no smooth scroll, no animation
  } else {
    /* Lenis smooth scroll (runs on native scroll, so IO + anchors keep working) */
    if (typeof window.Lenis !== "undefined") {
      window.__lenis = new Lenis({
        lerp: 0.09,
        autoRaf: true,
        anchors: { offset: -84 },      // clear the fixed header on anchor jumps
        allowNestedScroll: true        // let the mobile drawer scroll natively
      });
    }

    /* Subtle image parallax — a little continuous, scroll-linked motion on key
       media. GPU-only (translate3d + a slight scale so edges never show). */
    var parallaxEls = document.querySelectorAll("[data-parallax]");
    if (parallaxEls.length) {
      var updateParallax = function () {
        var vh = window.innerHeight || 800;
        parallaxEls.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.bottom < -120 || r.top > vh + 120) return;   // skip off-screen
          var rel = (r.top + r.height / 2 - vh / 2) / vh;      // ~ -0.6..0.6 in view
          var speed = parseFloat(el.getAttribute("data-parallax-speed")) || 16;
          el.style.transform = "translate3d(0," + (-rel * speed).toFixed(2) + "px,0) scale(1.08)";
        });
      };
      updateParallax();
      if (window.__lenis) {
        window.__lenis.on("scroll", updateParallax);
      } else {
        window.addEventListener("scroll", updateParallax, { passive: true });
      }
      window.addEventListener("resize", updateParallax, { passive: true });
    }

    /* Reveals via IntersectionObserver — CSS handles motion + data-d stagger */
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      revealAll();
    }

    /* Hero headline: one quiet, line-by-line reveal (GSAP SplitText), after
       fonts load so line breaks are correct. Falls back cleanly on any error. */
    var heroTitle = document.getElementById("hero-title");
    if (heroTitle && typeof window.gsap !== "undefined" && typeof window.SplitText !== "undefined") {
      heroTitle.classList.add("is-in");
      var runSplit = function () {
        try {
          gsap.registerPlugin(SplitText);
          var split = new SplitText(heroTitle, { type: "lines", mask: "lines", linesClass: "split-line" });
          gsap.set(heroTitle, { opacity: 1 });
          gsap.from(split.lines, {
            yPercent: 100,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.11,
            delay: 0.1
          });
        } catch (e) {
          heroTitle.classList.add("is-in");
        }
      };
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(runSplit);
      } else {
        runSplit();
      }
    }
  }

  /* ---- Mobile sticky CTA (show after hero) ---- */
  var mobileCta = document.getElementById("mobileCta");
  var heroSection = document.querySelector(".hero");
  if (mobileCta && heroSection && "IntersectionObserver" in window) {
    var ctaObs = new IntersectionObserver(function (entries) {
      mobileCta.classList.toggle("is-visible", !entries[0].isIntersecting);
    }, { threshold: 0, rootMargin: "-40% 0px 0px 0px" });
    ctaObs.observe(heroSection);
  }

  /* ---- File input label ---- */
  var fileInput = document.getElementById("datei");
  var fileName = document.getElementById("fileName");
  if (fileInput && fileName) {
    fileInput.addEventListener("change", function () {
      fileName.textContent = fileInput.files.length
        ? fileInput.files[0].name
        : "Optional · Foto oder PDF, später per E-Mail möglich";
    });
  }

  /* ---- Form validation + mailto handoff ---- */
  var form = document.getElementById("contactForm");
  if (form) {
    var required = ["name", "phone", "nachricht"];

    function fieldWrap(input) { return input.closest(".field"); }

    function validateField(input) {
      var wrap = fieldWrap(input);
      var valid = input.value.trim().length > 0;
      if (wrap) wrap.classList.toggle("is-error", !valid);
      return valid;
    }

    required.forEach(function (id) {
      var input = document.getElementById(id);
      if (input) {
        input.addEventListener("blur", function () { validateField(input); });
        input.addEventListener("input", function () {
          var wrap = fieldWrap(input);
          if (wrap && wrap.classList.contains("is-error")) validateField(input);
        });
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var firstInvalid = null;

      required.forEach(function (id) {
        var input = document.getElementById(id);
        if (input && !validateField(input)) { ok = false; if (!firstInvalid) firstInvalid = input; }
      });

      var consent = document.getElementById("consent");
      if (consent && !consent.checked) {
        ok = false;
        if (!firstInvalid) firstInvalid = consent;
        consent.focus();
      }

      if (!ok) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Build a structured e-mail (user keeps control; no backend needed)
      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      var lines = [
        "Anfrage über ais-kfz-service.de",
        "--------------------------------",
        "Name: " + v("name"),
        "Telefon: " + v("phone"),
        "Fahrzeug: " + [v("marke"), v("modell"), v("baujahr")].filter(Boolean).join(" · "),
        "Anliegen: " + (v("thema") || "—"),
        "",
        "Beschreibung:",
        v("nachricht"),
        "",
        "Hinweis: Eigentumsnachweis liegt vor / kann vorgelegt werden."
      ];
      var subject = "Service-Anfrage: " + (v("thema") || "Fahrzeug") + " – " + v("name");
      var mailto = "mailto:info@ais-kfz.de"
        + "?subject=" + encodeURIComponent(subject)
        + "&body=" + encodeURIComponent(lines.join("\n"));

      var okBox = document.getElementById("formOk");
      if (okBox) okBox.classList.add("is-visible");

      var btn = document.getElementById("submitBtn");
      if (btn) { btn.textContent = "Anfrage geöffnet ✓"; btn.disabled = true; btn.style.opacity = ".6"; }

      window.location.href = mailto;

      setTimeout(function () {
        if (btn) {
          btn.disabled = false; btn.style.opacity = "";
          btn.innerHTML = '<span>Service anfragen</span> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
        }
      }, 4000);
    });
  }

  /* ---- Hero signal-net: subtle gold particle network (wiring/diagnostics) ---- */
  (function () {
    var canvas = document.getElementById("heroNet");
    if (!canvas || reduceMotion) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var hero = canvas.parentElement;
    // Positioning set inline so the canvas is never in normal flow, even if the
    // external CSS is delayed, cached, or missing (otherwise it would push the
    // hero content off-screen). CSS only refines opacity/mask.
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.zIndex = "0";
    canvas.style.pointerEvents = "none";
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var GOLD = "205,164,92";
    var nodes = [], w = 0, h = 0, raf = 0, running = false, mouse = { x: -9999, y: -9999 };

    function size() {
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(24, Math.min(60, Math.round((w * h) / 26000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.5 + 0.8
        });
      }
    }

    function step() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      var i, n;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        var dxm = mouse.x - n.x, dym = mouse.y - n.y;
        if (dxm * dxm + dym * dym < 24000) { n.x += dxm * 0.0009; n.y += dym * 0.0009; }
      }
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y, d2 = dx * dx + dy * dy;
          if (d2 < 20000) {
            ctx.strokeStyle = "rgba(" + GOLD + "," + ((1 - d2 / 20000) * 0.38).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(nodes[b].x, nodes[b].y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        ctx.fillStyle = "rgba(" + GOLD + ",0.85)";
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(step);
    }

    function start() { if (!running) { running = true; raf = requestAnimationFrame(step); } }
    function stop() { running = false; cancelAnimationFrame(raf); }

    size();
    start();
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 200); }, { passive: true });
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener("pointerleave", function () { mouse.x = -9999; mouse.y = -9999; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }, { threshold: 0 }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  })();

  /* ---- Stat count-up ---- */
  (function () {
    var nums = document.querySelectorAll(".stat__num");
    if (!nums.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion || !window.requestAnimationFrame) { el.textContent = target + suffix; return; }
      var dur = 1300, t0 = null;
      (function frame(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      })(performance.now());
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
      }, { threshold: 0.6 });
      nums.forEach(function (n) { io.observe(n); });
    } else {
      nums.forEach(run);
    }
  })();

  /* ---- Magnetic buttons + card spotlight (fine-pointer devices only) ---- */
  if (!reduceMotion && window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var clamp = function (v, m) { return Math.max(-m, Math.min(m, v)); };
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var mx = clamp((e.clientX - (r.left + r.width / 2)) * 0.22, 10);
        var my = clamp((e.clientY - (r.top + r.height / 2)) * 0.3, 6);
        btn.style.translate = mx.toFixed(1) + "px " + my.toFixed(1) + "px";
      });
      btn.addEventListener("pointerleave", function () { btn.style.translate = ""; });
    });
    document.querySelectorAll(".svc, .sit").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });
    });
  }
})();
