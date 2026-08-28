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
          btn.innerHTML = 'Service anfragen <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
        }
      }, 4000);
    });
  }
})();
