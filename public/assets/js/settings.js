// THIS IS ALL PLACEHOLDER DATA FOR TESTING UNTIL BACKEND GETS SET UP
const profile = { name: "SuperGamer24" };

// Placeholder data: replace names and settings with your real ones later
const categories = [
   { id: "profile", title: "Profile", settings: [
    { id: "displayName", type: "text", name: "Display name",
      desc: "This name appears at the top of your sidebar", value: "SuperGamer24" },
    { id: "showActivity", name: "Show recent activity",
      desc: "Show your recent lists on the dashboard", value: true },
  ]},
  { id: "general",     title: "General",     settings: [
    { id: "setting1", name: "Setting 1", desc: "Small description of setting", value: false },
    { id: "setting2", name: "Setting 2", desc: "Small description of setting", value: true },
    { id: "setting3", name: "Setting 3", desc: "Small description of setting", value: true  },
    { id: "setting4", name: "Setting 4", desc: "Small description of setting", value: false },
  ]},
  { id: "preferences", title: "Preferences", settings: [
    { id: "setting1", name: "Setting 1", desc: "Small description of setting", value: false },
    { id: "setting2", name: "Setting 2", desc: "Small description of setting", value: false },
    { id: "setting3", name: "Setting 3", desc: "Small description of setting", value: true  },
    { id: "setting4", name: "Setting 4", desc: "Small description of setting", value: false },
  ]},
  { id: "reminders",     title: "Reminders",     settings: [] },
  { id: "lists",         title: "Lists",         settings: [] },
  { id: "notifications", title: "Notifications", settings: [] },
  { id: "privacy",       title: "Privacy",       settings: [] },
  { id: "about",         title: "About",         settings: [] },
];

// See if the user is coming from clicking their profile or from the settings btn
const requested = new URLSearchParams(window.location.search).get("category");
let activeId = categories.some(c => c.id === requested) ? requested : "general";

const categoryList = document.getElementById("categoryList");
const settingsList = document.getElementById("settingsList");
const categoryTitle = document.getElementById("categoryTitle");
const settingsContent = document.getElementById("settingsContent");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderCategories() {
  categoryList.replaceChildren();
  categories.forEach(cat => {
    const isActive = cat.id === activeId;
    const btn = el("button", `category-btn${isActive ? " active" : ""}`, cat.title);
    btn.type = "button";
    btn.id = `tab-${cat.id}`;
    btn.dataset.id = cat.id;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(isActive));
    btn.tabIndex = isActive ? 0 : -1;       // arrow keys move between tabs
    categoryList.append(btn);
  });
}

function renderSettings() {
  const category = categories.find(c => c.id === activeId);
  categoryTitle.textContent = category.title;
  settingsContent.setAttribute("aria-labelledby", `tab-${category.id}`);
  settingsList.replaceChildren();

  if (category.settings.length === 0) {
    settingsList.append(el("p", "text-muted small mt-3", "No settings in this category yet."));
    return;
  }

  category.settings.forEach(s => {
    const row = el("div", "setting-row");

    const text = el("div");
    const label = el("label", "setting-name d-block", s.name);
    label.htmlFor = s.id;
    text.append(label, el("small", "setting-desc d-block", s.desc));

    // const wrap = el("div", "form-check form-switch");
    // const input = el("input", "form-check-input");
    // input.type = "checkbox";
    // input.id = s.id;
    // input.setAttribute("role", "switch");
    // input.checked = s.value;
    // input.dataset.setting = s.id;
    // wrap.append(input);
    // row.append(text, wrap);

    if (s.type === "text") {
        const input = el("input", "form-control form-control-sm border-dark w-50");
        input.type = "text";
        input.id = s.id;
        input.value = s.value;
        input.maxLength = 40;
        input.dataset.setting = s.id;
        row.append(text, input);
    } else {
        const wrap = el("div", "form-check form-switch");
        const input = el("input", "form-check-input");
        input.type = "checkbox";
        input.id = s.id;
        input.setAttribute("role", "switch");
        input.checked = s.value;
        input.dataset.setting = s.id;
        wrap.append(input);
        row.append(text, wrap);
    }

    settingsList.append(row);
  });
}

function selectCategory(id) {
  activeId = id;
  renderCategories();
  renderSettings();
}

categoryList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-id]");
  if (btn) selectCategory(btn.dataset.id);
});

// Up/down arrows move between categories
categoryList.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  e.preventDefault();
  const index = categories.findIndex(c => c.id === activeId);
  const next = (index + (e.key === "ArrowDown" ? 1 : -1) + categories.length) % categories.length;
  selectCategory(categories[next].id);
  document.getElementById(`tab-${categories[next].id}`).focus();
});

// Save a toggle when it changes
settingsList.addEventListener("change", (e) => {
  const input = e.target.closest("[data-setting]");
  if (!input) return;

  const category = categories.find(c => c.id === activeId);
  const setting = category.settings.find(s => s.id === input.dataset.setting);
  setting.value = input.type === "checkbox" ? input.checked : input.value.trim();

  console.log(`Setting "${setting.name}" is now ${setting.value}`);   // placeholder: save to real data source here
});

document.getElementById("profileName").textContent = `${profile.name}'s Dashboard`;
renderCategories();
renderSettings();