// Search + filters for the home page (all concepts) and manufacturer pages (one maker).
(function () {
  const page = window.__PAGE__;
  const data = window.__CONCEPTS__;
  const POWER = { gasoline: "Gasoline", diesel: "Diesel", hybrid: "Hybrid", ev: "Electric", hydrogen: "Hydrogen" };
  const HIDDEN_BODIES = new Set(["Unclassified", "Other"]);
  const $ = (id) => document.getElementById(id);
  const state = { q: "", maker: "", from: "", to: "", body: new Set(), power: new Set(), photos: false, produced: false };
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const base = page.maker ? "../../" : "";

  const years = [...new Set(data.map((c) => c.year))].sort((a, b) => a - b);
  const opt = (v, t) => `<option value="${v}">${t}</option>`;
  $("from").innerHTML = opt("", "Any") + years.map((y) => opt(y, y)).join("");
  $("to").innerHTML = opt("", "Any") + years.slice().reverse().map((y) => opt(y, y)).join("");
  if ($("maker")) $("maker").innerHTML = opt("", "All") + window.__MAKERS__.slice().sort((a, b) => a.name.localeCompare(b.name)).map((m) => opt(esc(m.name), esc(m.name))).join("");

  function pills(el, items, set, label) {
    el.innerHTML = items.map((i) => `<button class="pill" aria-pressed="false" data-v="${i}">${label(i)}</button>`).join("");
    el.addEventListener("click", (e) => {
      const b = e.target.closest(".pill"); if (!b) return;
      const v = b.dataset.v; set.has(v) ? set.delete(v) : set.add(v);
      b.setAttribute("aria-pressed", set.has(v)); update();
    });
  }
  pills($("powers"), Object.keys(POWER).filter((p) => data.some((c) => c.power.includes(p))), state.power, (p) => POWER[p]);
  pills($("bodies"), [...new Set(data.map((c) => c.body))].filter((b) => !HIDDEN_BODIES.has(b)).sort(), state.body, (b) => b);
  $("extras").innerHTML = `<button class="pill" data-x="photos" aria-pressed="false">With photos</button><button class="pill" data-x="produced" aria-pressed="false">Reached production</button>`;
  $("extras").addEventListener("click", (e) => {
    const b = e.target.closest(".pill"); if (!b) return;
    state[b.dataset.x] = !state[b.dataset.x]; b.setAttribute("aria-pressed", state[b.dataset.x]); update();
  });

  $("q").addEventListener("input", (e) => { state.q = e.target.value.trim().toLowerCase(); update(); });
  for (const id of ["maker", "from", "to"]) if ($(id)) $(id).addEventListener("change", (e) => { state[id] = e.target.value; update(); });
  $("sort").addEventListener("change", update);
  $("reset").addEventListener("click", () => {
    Object.assign(state, { q: "", maker: "", from: "", to: "", photos: false, produced: false });
    state.body.clear(); state.power.clear();
    $("q").value = ""; ["maker", "from", "to"].forEach((id) => $(id) && ($(id).value = ""));
    document.querySelectorAll(".pill").forEach((p) => p.setAttribute("aria-pressed", "false"));
    update();
  });

  $("toggle").addEventListener("click", () => {
    const open = $("panel").hidden; $("panel").hidden = !open; $("toggle").setAttribute("aria-expanded", open);
  });
  const count = () => (state.maker ? 1 : 0) + (state.from ? 1 : 0) + (state.to ? 1 : 0) + state.body.size + state.power.size + (state.photos ? 1 : 0) + (state.produced ? 1 : 0);
  const active = () => state.q || state.maker || state.from || state.to || state.body.size || state.power.size || state.photos || state.produced;
  function match(c) {
    if (state.q && !`${c.name} ${c.maker} ${c.year}`.toLowerCase().includes(state.q)) return false;
    if (state.maker && c.maker !== state.maker) return false;
    if (state.from && c.year < +state.from) return false;
    if (state.to && c.year > +state.to) return false;
    if (state.body.size && !state.body.has(c.body)) return false;
    if (state.power.size && !c.power.some((p) => state.power.has(p))) return false;
    if (state.photos && !c.img) return false;
    if (state.produced && !c.prod) return false;
    return true;
  }
  const tile = (c) => `<a class="tile" href="${base}concept/${c.id}/"><span class="ph">${c.img ? `<img src="${c.img}" alt="" loading="lazy">` : ""}<i>${c.year}</i></span>
    <span class="cap2">${page.maker ? "" : `<small>${esc(c.maker)}</small>`}<b>${esc(c.name)}</b></span></a>`;

  const PAGE_SIZE = 90;
  let shown = 0, list = [];
  function paint(more) {
    if (!more) { shown = 0; $("grid").innerHTML = ""; }
    const next = list.slice(shown, shown + PAGE_SIZE);
    $("grid").insertAdjacentHTML("beforeend", next.map(tile).join(""));
    shown += next.length;
    let btn = $("more");
    if (shown < list.length) {
      if (!btn) { btn = document.createElement("button"); btn.id = "more"; btn.className = "more"; btn.onclick = () => paint(true); $("results").appendChild(btn); }
      btn.textContent = `Show more (${list.length - shown})`;
    } else if (btn) btn.remove();
  }
  function update() {
    const n = count(); $("badge").hidden = !n; $("badge").textContent = n;
    const on = !!active();
    if ($("makers")) { $("makers").hidden = on; $("results").hidden = !on; }
    if (!on && !page.maker) return;
    const sort = $("sort").value;
    list = data.filter(match).sort((a, b) =>
      sort === "year-desc" ? b.year - a.year || a.name.localeCompare(b.name)
      : sort === "name" ? a.name.localeCompare(b.name) : a.year - b.year || a.name.localeCompare(b.name));
    $("count").textContent = `${list.length} concept${list.length === 1 ? "" : "s"}`;
    if (!list.length) { $("grid").innerHTML = `<p class="empty">No concepts match these filters.</p>`; const m = $("more"); if (m) m.remove(); return; }
    paint(false);
  }
  update();
})();
