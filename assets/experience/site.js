(() => {
  "use strict";
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  root.classList.add("fit-motion");
  const art = document.querySelector(".hero-art");
  const progress = document.createElement("div");
  progress.className = "fit-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);
  function updateMotion() {
    const paused = reduced.matches;
    root.dataset.motion = paused ? "paused" : "playing";
    if (paused && art) {
      art.style.removeProperty("--art-x");
      art.style.removeProperty("--art-y");
    }
    document.dispatchEvent(new CustomEvent("fit:motion", {detail: {paused}}));
  }
  reduced.addEventListener("change", updateMotion);
  updateMotion();

  // The content stays visible if observers are unavailable.
  const selectors = [
    ".flavor-heading", ".benefit", ".proof-item", ".fit-closing > div",
    ".hero-copy", ".manifesto > *", ".chapter-copy", ".principle",
    ".statement > *", ".closing > div", ".section-head", ".product",
    ".promise article", ".memory", ".cta > *", ".related-card",
    ".story-strip article", ".ingredient-card", ".flavor-switcher",
    ".nutrition-page .flavor-story", ".facts-section"
  ];
  const enterTargets = document.querySelectorAll(selectors.join(","));
  const observer = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    }
  }, {threshold: .07, rootMargin: "0px 0px -20px 0px"}) : null;
  enterTargets.forEach((element, index) => {
    element.classList.add("fit-enter");
    element.style.setProperty("--enter-delay", Math.min(index % 3 * 65, 130) + "ms");
    if (observer) observer.observe(element);
    else element.classList.add("is-in");
  });

  let scrollQueued = false;
  function renderScroll() {
    scrollQueued = false;
    const available = root.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (available > 0 ? Math.min(1, window.scrollY / available) : 0) + ")";
  }
  window.addEventListener("scroll", () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(renderScroll); }
  }, {passive: true});
  renderScroll();

  if (art) {
    let pointerFrame = 0;
    art.addEventListener("pointermove", event => {
      if (!finePointer.matches || root.dataset.motion === "paused") return;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const bounds = art.getBoundingClientRect();
        art.style.setProperty("--art-x", ((event.clientX - bounds.left) / bounds.width - .5) * 12 + "px");
        art.style.setProperty("--art-y", ((event.clientY - bounds.top) / bounds.height - .5) * 10 + "px");
      });
    }, {passive: true});
    art.addEventListener("pointerleave", () => {
      cancelAnimationFrame(pointerFrame);
      art.style.removeProperty("--art-x");
      art.style.removeProperty("--art-y");
    });
  }

  const flavors = {
    "thai-chili": {image: "thaichilimain.png", name: "Thai Chili", note: "A little heat. A lot of flavor."},
    "thai-lime": {image: "thailimemain.png", name: "Thai Lime", note: "Bright. Tangy. Gone."},
    "truffle": {image: "trufflemain.png", name: "Truffle", note: "Earthy. Savory. A little extra."}
  };
  const heroImage = document.querySelector("#hero-flavor-image");
  const flavorName = document.querySelector("#hero-flavor-name");
  const flavorNote = document.querySelector("#hero-flavor-note");
  const choices = [...document.querySelectorAll("[data-hero-flavor]")];
  let selection = 0;
  if (heroImage && flavorName) {
    flavorName.setAttribute("aria-live", "polite");
    choices.forEach(button => button.addEventListener("click", async () => {
      const ticket = ++selection;
      const flavor = flavors[button.dataset.heroFlavor];
      const preload = new Image();
      preload.src = flavor.image;
      try { await preload.decode(); } catch { return; }
      if (ticket !== selection) return;
      heroImage.src = flavor.image;
      heroImage.alt = flavor.name + " Wagyu tallow chips";
      flavorName.textContent = flavor.name;
      if (flavorNote) flavorNote.textContent = flavor.note;
      choices.forEach(choice => {
        const active = choice === button;
        choice.classList.toggle("active", active);
        choice.setAttribute("aria-pressed", String(active));
      });
      if (root.dataset.motion !== "paused") heroImage.animate(
        [{opacity: .25, transform: "scale(.96)"}, {opacity: 1, transform: "scale(1)"}],
        {duration: 400, easing: "cubic-bezier(.16,1,.3,1)"}
      );
    }));
  }
})();
