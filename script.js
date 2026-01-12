/* CareLink Case Study — script.js
   - Year in footer
   - Patient swipe gallery dots + snap
   - Active nav link on scroll
*/

(function () {
  // 1) Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 2) Patient swipe gallery (dots + snap)
  const viewport = document.getElementById("patientSwipe");
  const dotsWrap = document.getElementById("patientDots");

  if (viewport && dotsWrap) {
    const dots = Array.from(dotsWrap.querySelectorAll(".dot"));
    const slides = Array.from(viewport.querySelectorAll(".swipe-slide"));

    // CSS gap between slides is 14px (matches your CSS)
    const GAP = 14;

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    const setActiveDot = (index) => {
      dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    };

    const getSlideWidth = () => {
      const w = slides[0]?.getBoundingClientRect().width;
      return w || viewport.clientWidth;
    };

    const getIndexFromScroll = () => {
      const slideW = getSlideWidth();
      const idx = Math.round(viewport.scrollLeft / (slideW + GAP));
      return clamp(idx, 0, slides.length - 1);
    };

    // Set initial dot
    setActiveDot(getIndexFromScroll());

    // Scroll → update active dot (throttled)
    let ticking = false;
    viewport.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          setActiveDot(getIndexFromScroll());
          ticking = false;
        });
      },
      { passive: true }
    );

    // Dot click → scroll to slide
    dots.forEach((dot, i) => {
      dot.style.cursor = "pointer";
      dot.setAttribute("aria-label", `Go to patient screen ${i + 1}`);

      const go = () => {
        const slideW = getSlideWidth();
        viewport.scrollTo({ left: i * (slideW + GAP), behavior: "smooth" });
      };

      dot.addEventListener("click", go);

      // If you keep dots as <button>, this is already keyboard accessible.
      // This keeps it safe if they are ever changed back to spans.
      dot.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      });
    });

    // Snap after swipe (so it lands perfectly on a slide)
    let snapTimer = null;
    viewport.addEventListener(
      "scroll",
      () => {
        if (snapTimer) clearTimeout(snapTimer);
        snapTimer = setTimeout(() => {
          const idx = getIndexFromScroll();
          const slideW = getSlideWidth();
          viewport.scrollTo({ left: idx * (slideW + GAP), behavior: "smooth" });
          setActiveDot(idx);
        }, 120);
      },
      { passive: true }
    );

    // Keyboard navigation in gallery (left/right)
    viewport.setAttribute("tabindex", "0");
    viewport.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

      const idx = getIndexFromScroll();
      const next =
        e.key === "ArrowRight"
          ? clamp(idx + 1, 0, slides.length - 1)
          : clamp(idx - 1, 0, slides.length - 1);

      const slideW = getSlideWidth();
      viewport.scrollTo({ left: next * (slideW + GAP), behavior: "smooth" });
      setActiveDot(next);
    });
  }

  // 3) Active nav link highlight while scrolling
  const navLinks = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));

  if (navLinks.length) {
    const sections = navLinks
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);

    const linkById = new Map(
      navLinks.map((a) => [a.getAttribute("href").slice(1), a])
    );

    const markActive = (id) => {
      navLinks.forEach((a) => a.classList.remove("pill"));
      const active = linkById.get(id);
      if (active) active.classList.add("pill");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

        if (visible?.target?.id) markActive(visible.target.id);
      },
      {
        root: null,
        threshold: [0.25, 0.35, 0.5, 0.6],
        rootMargin: "-90px 0px -60% 0px",
      }
    );

    sections.forEach((s) => observer.observe(s));
    markActive(sections[0]?.id || "overview");
  }
})();
