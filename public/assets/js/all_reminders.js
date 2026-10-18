// THIS IS ALL PLACEHOLDER DATA FOR TESTING UNTIL BACKEND GETS SET UP
const profile = { name: "SuperGamer24" };

// Example reminders
let reminders = [
  { id: 1, title: "Game event!",  icon: "bi-gift-fill",  color: "yellow", when: "Mon, Oct 1 - Sat, Oct 31, 2026", time: "All day", active: true },
  { id: 2, title: "Do tasks",     icon: "bi-star-fill",  color: "orange", when: "Every Wednesday", time: "3:00 pm", active: true },
  { id: 3, title: "Pet animals",  icon: "bi-heart-fill", color: "green",  when: "Every Weekday",   time: "4:30 pm", active: true },
  { id: 4, title: "Daily login",  icon: "bi-alarm-fill", color: "pink",   when: "Every Weekday",   time: "3:00 pm", active: true },
  { id: 5, title: "Do tasks",     icon: "bi-star-fill",  color: "teal",   when: "Every Monday",    time: "3:00 pm", active: false },
];

const COLORS = ["yellow", "orange", "green", "pink", "teal", "blue"];
const ICONS = [
  "bi-gift-fill", "bi-star-fill", "bi-heart-fill", "bi-alarm-fill",
  "bi-controller", "bi-trophy-fill", "bi-calendar-event-fill", "bi-bell-fill",
];

let manageMode = false;
let pendingDeleteId = null;
let pickerTarget = null;   // { id, type: "color" | "icon" }

const areaEl = document.getElementById("remindersArea");
const activeEl = document.getElementById("activeReminders");
const inactiveEl = document.getElementById("inactiveReminders");
const normalActions = document.getElementById("normalActions");
const manageActions = document.getElementById("manageActions");
const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
const pickerModal = new bootstrap.Modal(document.getElementById("pickerModal"));

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function buildMenuItem(action, label, extraClass = "") {
  const li = el("li");
  const btn = el("button", `dropdown-item ${extraClass}`.trim(), label);
  btn.type = "button";
  btn.dataset.action = action;
  li.append(btn);
  return li;
}

function buildReminder(r) {
  const item = el("div", "reminder-item");
  item.dataset.id = r.id;

  // Manage-mode controls: edit menu + turn on/off button
  const controls = el("div", "reminder-controls");

  const dropdown = el("div", "dropdown");
  const editBtn = el("button", "btn btn-link p-0 text-dark fs-5 lh-1");
  editBtn.type = "button";
  editBtn.dataset.bsToggle = "dropdown";
  editBtn.setAttribute("aria-expanded", "false");
  editBtn.setAttribute("aria-label", `Edit options for ${r.title}`);
  editBtn.append(el("i", "bi bi-pencil-square"));

  const menu = el("ul", "dropdown-menu dropdown-menu-end");
  menu.append(
    buildMenuItem("edit", "Edit Reminder"),
    buildMenuItem("color", "Edit Color"),
    buildMenuItem("icon", "Edit Icon"),
    buildMenuItem("toggle", r.active ? "Turn Off" : "Turn On"),
    buildMenuItem("delete", "Delete", "text-danger")
  );
  dropdown.append(editBtn, menu);

  const toggleBtn = el("button", `btn btn-link p-0 fs-4 lh-1 ${r.active ? "text-danger" : "text-success"}`);
  toggleBtn.type = "button";
  toggleBtn.dataset.action = "toggle";
  toggleBtn.setAttribute("aria-label", `${r.active ? "Turn off" : "Turn on"} ${r.title}`);
  toggleBtn.append(el("i", `bi ${r.active ? "bi-dash-circle-fill" : "bi-plus-circle-fill"}`));

  controls.append(dropdown, toggleBtn);

  // The card itself
  const card = el("div", `reminder-card reminder-${r.color}`);
  const icon = el("div", "reminder-icon");
  icon.append(el("i", `bi ${r.icon}`));

  const meta = el("div", "reminder-meta d-flex gap-3");
  meta.append(el("span", "", r.when), el("span", "", r.time));

  card.append(icon, el("div", "reminder-title text-truncate", r.title), meta);

  item.append(controls, card);
  return item;
}

function renderColumn(container, items, emptyText) {
  container.replaceChildren();
  if (items.length === 0) {
    container.append(el("p", "text-muted small", emptyText));
    return;
  }
  items.forEach(r => container.append(buildReminder(r)));
}

function renderReminders() {
  normalActions.classList.toggle("d-none", manageMode);
  manageActions.classList.toggle("d-none", !manageMode);
  areaEl.classList.toggle("manage-mode", manageMode);

  renderColumn(activeEl, reminders.filter(r => r.active), "No active reminders.");
  renderColumn(inactiveEl, reminders.filter(r => !r.active), "No inactive reminders.");
}

function openPicker(reminder, type) {
  pickerTarget = { id: reminder.id, type };
  document.getElementById("pickerModalTitle").textContent = type === "color" ? "Edit Color" : "Edit Icon";

  const options = document.getElementById("pickerOptions");
  options.replaceChildren();

  if (type === "color") {
    COLORS.forEach(color => {
      const b = el("button", `color-swatch reminder-${color}`);
      b.type = "button";
      b.dataset.value = color;
      b.setAttribute("aria-label", color);
      options.append(b);
    });
  } else {
    ICONS.forEach(iconClass => {
      const b = el("button", "btn btn-light border fs-4 lh-1");
      b.type = "button";
      b.dataset.value = iconClass;
      b.setAttribute("aria-label", iconClass.replace("bi-", "").replace("-fill", ""));
      b.append(el("i", `bi ${iconClass}`));
      options.append(b);
    });
  }
  pickerModal.show();
}

/* ---------- Card actions (menu items + on/off button) ---------- */
areaEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const id = Number(btn.closest(".reminder-item").dataset.id);
  const reminder = reminders.find(r => r.id === id);

  switch (btn.dataset.action) {
    case "edit":
      window.location.href = `edit_reminder.html?id=${id}`;   // placeholder page name
      break;
    case "color":
    case "icon":
      openPicker(reminder, btn.dataset.action);
      break;
    case "toggle":
      reminder.active = !reminder.active;
      renderReminders();
      break;
    case "delete":
      pendingDeleteId = id;
      document.getElementById("deleteReminderName").textContent = `“${reminder.title}”`;
      deleteModal.show();
      break;
  }
});

/* ---------- Picker + delete modals ---------- */
document.getElementById("pickerOptions").addEventListener("click", (e) => {
  const choice = e.target.closest("[data-value]");
  if (!choice || !pickerTarget) return;

  const reminder = reminders.find(r => r.id === pickerTarget.id);
  reminder[pickerTarget.type] = choice.dataset.value;
  pickerModal.hide();
  renderReminders();
});

document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
  reminders = reminders.filter(r => r.id !== pendingDeleteId);
  pendingDeleteId = null;
  deleteModal.hide();
  renderReminders();
});

/* ---------- Manage mode toggle ---------- */
document.getElementById("manageRemindersBtn").addEventListener("click", () => {
  manageMode = true;
  renderReminders();
});

document.getElementById("doneBtn").addEventListener("click", () => {
  manageMode = false;
  renderReminders();
});

document.getElementById("profileName").textContent = `${profile.name}'s Dashboard`;
renderReminders();