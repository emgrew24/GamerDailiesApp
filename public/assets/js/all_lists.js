// THIS IS ALL PLACEHOLDER DATA FOR TESTING UNTIL BACKEND GETS SET UP
const profile = { name: "SuperGamer24" };

let lists = [
  { id: 1, title: "Daily Quests",    created: "2026-09-01" },
  { id: 2, title: "Weekly Raids",    created: "2026-09-05" },
  { id: 3, title: "Farming Routes",  created: "2026-09-12" },
  { id: 4, title: "Event Checklist", created: "2026-10-01" },
  { id: 5, title: "Achievements",    created: "2026-10-03" },
];

let sortMode = "newest";
let manageMode = false;
const selectedIds = new Set();

// Element references
const allListsEl = document.getElementById("allLists");
const normalActions = document.getElementById("normalActions");
const manageActions = document.getElementById("manageActions");
const selectedCountEl = document.getElementById("selectedCount");
const duplicateSelectedBtn = document.getElementById("duplicateSelectedBtn");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function sortedLists() {
  const copy = [...lists];
  switch (sortMode) {
    case "name-asc":  return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "name-desc": return copy.sort((a, b) => b.title.localeCompare(a.title));
    case "oldest":    return copy.sort((a, b) => a.created.localeCompare(b.created));
    default:          return copy.sort((a, b) => b.created.localeCompare(a.created));
  }
}

function buildMenuItem(action, label, extraClass = "") {
  const li = el("li");
  const btn = el("button", `dropdown-item ${extraClass}`.trim(), label);
  btn.type = "button";
  btn.dataset.action = action;
  li.append(btn);
  return li;
}

// Show the right toolbar and update the "N selected" count
function updateToolbar() {
  const count = selectedIds.size;
  normalActions.classList.toggle("d-none", manageMode);
  manageActions.classList.toggle("d-none", !manageMode);
  allListsEl.classList.toggle("manage-mode", manageMode);

  selectedCountEl.textContent = `${count} selected`;
  duplicateSelectedBtn.disabled = count === 0;
  deleteSelectedBtn.disabled = count === 0;
}

// Display all lists on the page
function renderLists() {
  updateToolbar();
  allListsEl.replaceChildren();

  if (lists.length === 0) {
    allListsEl.append(el("p", "text-muted", "You haven't made any lists yet. Click “+ Add New” to get started!"));
    return;
  }

  sortedLists().forEach(list => {
    const isSelected = selectedIds.has(list.id);

    const col = el("div", "col");
    const item = el("div", "list-item");
    item.dataset.id = list.id;

    // Tile (link) & Selection Circle
    const wrap = el("div", "tile-wrap");

    const tile = el("a", "list-tile");
    tile.href = `list.html?id=${list.id}`;
    tile.setAttribute("aria-label", list.title);
    if (manageMode) {
      tile.setAttribute("role", "checkbox");
      tile.setAttribute("aria-checked", String(isSelected));
    }
    tile.append(el("i", "bi bi-card-checklist"));

    const circle = el("span", `select-circle${isSelected ? " selected" : ""}`);
    circle.setAttribute("aria-hidden", "true");

    wrap.append(tile, circle);

    // Title + kebab menu
    const caption = el("div", "d-flex justify-content-between align-items-center mt-2");
    caption.append(el("small", "fw-bold text-truncate", list.title));

    const dropdown = el("div", "dropdown");
    const toggle = el("button", "btn btn-link p-0 kebab-btn");
    toggle.type = "button";
    toggle.dataset.bsToggle = "dropdown";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", `Options for ${list.title}`);
    toggle.append(el("i", "bi bi-three-dots-vertical"));

    const menu = el("ul", "dropdown-menu");
    menu.append(
      buildMenuItem("rename", "Rename"),
      buildMenuItem("duplicate", "Duplicate"),
      buildMenuItem("delete", "Delete", "text-danger")
    );

    dropdown.append(toggle, menu);
    caption.append(dropdown);

    item.append(wrap, caption);
    col.append(item);
    allListsEl.append(col);
  });
}

function duplicateList(list, offset = 0) {
  lists.push({
    ...list,
    id: Date.now() + offset,   // offset avoids duplicate ids when copying several at once
    title: `${list.title} (copy)`,
    created: new Date().toISOString().slice(0, 10),
  });
}

// ---------- Grid clicks (selection + kebab menu actions) ---------- 
allListsEl.addEventListener("click", (e) => {
  // Manage mode: clicking a tile or its circle toggles selection instead of opening the list
  if (manageMode) {
    const target = e.target.closest(".list-tile, .select-circle");
    if (!target) return;
    e.preventDefault();

    const id = Number(target.closest(".list-item").dataset.id);
    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
    renderLists();
    return;
  }

  // Normal mode: kebab menu actions
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const id = Number(btn.closest(".list-item").dataset.id);
  const list = lists.find(l => l.id === id);

  if (btn.dataset.action === "rename") {
    const name = prompt("Rename list:", list.title);   // placeholder: swap for a modal later
    if (name && name.trim()) list.title = name.trim();
  } else if (btn.dataset.action === "duplicate") {
    duplicateList(list);
  } else if (btn.dataset.action === "delete") {
    if (confirm(`Delete "${list.title}"?`)) lists = lists.filter(l => l.id !== id);
  }
  renderLists();
});

// ---------- Manage Mode Toolbar ---------- 
document.getElementById("manageListsBtn").addEventListener("click", () => {
  manageMode = true;
  selectedIds.clear();
  renderLists();
});

document.getElementById("doneBtn").addEventListener("click", () => {
  manageMode = false;
  selectedIds.clear();
  renderLists();
});

duplicateSelectedBtn.addEventListener("click", () => {
  lists.filter(l => selectedIds.has(l.id)).forEach((list, i) => duplicateList(list, i));
  selectedIds.clear();
  renderLists();
});

deleteSelectedBtn.addEventListener("click", () => {
  const count = selectedIds.size;
  if (count === 0) return;
  document.getElementById("deleteModalTitle").textContent =
    `Delete ${count} ${count === 1 ? "List" : "Lists"}?`;
  deleteModal.show();
});

document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
  lists = lists.filter(l => !selectedIds.has(l.id));
  selectedIds.clear();
  deleteModal.hide();
  renderLists();
});

// ---------- Sort ---------- 
document.getElementById("sortMenu").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-sort]");
  if (!btn) return;
  sortMode = btn.dataset.sort;
  renderLists();
});

document.getElementById("profileName").textContent = `${profile.name}'s Dashboard`;
renderLists();