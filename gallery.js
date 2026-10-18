// Photo gallery on concept pages: arrows, keyboard, swipe and a thumbnail strip.
(function () {
  const root = document.getElementById("gallery");
  const dataEl = document.getElementById("gallery-data");
  if (!root || !dataEl) return;
  const photos = JSON.parse(dataEl.textContent);
  const img = document.getElementById("stage-img");
  const cap = document.getElementById("stage-cap");
  const count = document.getElementById("stage-count");
  const items = [...root.querySelectorAll(".strip-item")];
  const n = photos.length;
  let i = 0;

  const preload = (k) => { const p = photos[(k + n) % n]; if (p) new Image().src = p.full; };
  function show(k) {
    i = (k + n) % n;
    const p = photos[i];
    root.classList.add("loading");
    const next = new Image();
    next.onload = () => { img.src = p.full; root.classList.remove("loading"); };
    next.onerror = () => { img.src = p.full; root.classList.remove("loading"); };
    next.src = p.full;
    cap.innerHTML = p.cap;
    if (count) count.textContent = `${i + 1} / ${n}`;
    items.forEach((el, j) => {
      el.setAttribute("aria-selected", j === i);
      if (j === i) el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    });
    preload(i + 1); preload(i - 1);
  }

  root.querySelector(".prev").addEventListener("click", () => show(i - 1));
  root.querySelector(".next").addEventListener("click", () => show(i + 1));
  items.forEach((el) => el.addEventListener("click", () => show(+el.dataset.i)));
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, select, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "ArrowLeft") show(i - 1);
    else if (e.key === "ArrowRight") show(i + 1);
  });
  let x0 = null;
  const stage = root.querySelector(".stage");
  stage.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
  });
  preload(1);
})();
