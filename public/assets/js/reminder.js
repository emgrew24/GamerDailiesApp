// THIS IS ALL PLACEHOLDER DATA FOR TESTING UNTIL BACKEND GETS SET UP
const profile = { name: "SuperGamer24" };

const COLORS = ["yellow", "orange", "green", "pink", "teal", "blue"];
const ICONS = [
  "bi-alarm-fill", "bi-gift-fill", "bi-star-fill", "bi-heart-fill",
  "bi-controller", "bi-trophy-fill", "bi-calendar-event-fill", "bi-bell-fill",
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const state = { color: "teal", icon: "bi-alarm-fill", start: "", end: "", picking: "start" };
let viewYear, viewMonth;

// Element references
const formWrap = document.getElementById("formWrap");
const form = document.getElementById("reminderForm");
const titleInput = document.getElementById("titleInput");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");
const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");
const allDayToggle = document.getElementById("allDayToggle");
const repeatSelect = document.getElementById("repeatSelect");
const customRepeat = document.getElementById("customRepeat");
const dateError = document.getElementById("dateError");
const calGrid = document.getElementById("calGrid");
const calTitle = document.getElementById("calTitle");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// Dates are handled as local "YYYY-MM-DD" strings to avoid timezone surprises
const pad = n => String(n).padStart(2, "0");
const toISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

/* ---------- Color + icon pickers ---------- */
function applyColor() {
  formWrap.className = `reminder-form-wrap reminder-${state.color} mx-auto`;
  document.getElementById("colorBtn").className = `color-swatch reminder-${state.color}`;
}

function applyIcon() {
  document.getElementById("tabIcon").className = `bi ${state.icon}`;
  document.getElementById("iconBtn").replaceChildren(el("i", `bi ${state.icon}`));
}

function buildPickers() {
  const colorOptions = document.getElementById("colorOptions");
  COLORS.forEach(color => {
    const b = el("button", `color-swatch reminder-${color}`);
    b.type = "button";
    b.dataset.color = color;
    b.setAttribute("aria-label", color);
    colorOptions.append(b);
  });

  const iconOptions = document.getElementById("iconOptions");
  ICONS.forEach(iconClass => {
    const b = el("button", "btn btn-light border fs-4 lh-1");
    b.type = "button";
    b.dataset.icon = iconClass;
    b.setAttribute("aria-label", iconClass.replace("bi-", "").replace("-fill", ""));
    b.append(el("i", `bi ${iconClass}`));
    iconOptions.append(b);
  });
}

document.getElementById("colorOptions").addEventListener("click", (e) => {
  const b = e.target.closest("[data-color]");
  if (!b) return;
  state.color = b.dataset.color;
  applyColor();
  renderCalendar();
});

document.getElementById("iconOptions").addEventListener("click", (e) => {
  const b = e.target.closest("[data-icon]");
  if (!b) return;
  state.icon = b.dataset.icon;
  applyIcon();
});

/* ---------- Mini calendar ---------- */
function renderCalendar() {
  calTitle.textContent = new Date(viewYear, viewMonth, 1)
    .toLocaleDateString(undefined, { month: "long", year: "numeric" });
  calGrid.replaceChildren();

  WEEKDAYS.forEach(d => calGrid.append(el("div", "cal-weekday", d)));

  const leadingBlanks = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayISO = toISO(new Date());

  for (let i = 0; i < leadingBlanks; i++) calGrid.append(el("div"));

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toISO(new Date(viewYear, viewMonth, day));
    const inRange = state.start && state.end && iso >= state.start && iso <= state.end;

    const btn = el("button", "cal-day", String(day));
    btn.type = "button";
    btn.dataset.date = iso;
    if (inRange) btn.classList.add("in-range");
    if (iso === todayISO) btn.classList.add("today");
    calGrid.append(btn);
  }
}

function showMonthOf(iso) {
  const d = parseISO(iso);
  viewYear = d.getFullYear();
  viewMonth = d.getMonth();
}

function changeMonth(delta) {
  const d = new Date(viewYear, viewMonth + delta, 1);
  viewYear = d.getFullYear();
  viewMonth = d.getMonth();
  renderCalendar();
}

document.getElementById("calPrev").addEventListener("click", () => changeMonth(-1));
document.getElementById("calNext").addEventListener("click", () => changeMonth(1));

// First click sets the start (and end), second click sets the end
calGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-date]");
  if (!btn) return;
  const iso = btn.dataset.date;

  if (state.picking === "start") {
    state.start = iso;
    state.end = iso;
    state.picking = "end";
  } else {
    if (iso < state.start) { state.end = state.start; state.start = iso; }
    else state.end = iso;
    state.picking = "start";
  }
  syncInputsFromState();
  renderCalendar();
});

/* ---------- Date/time fields ---------- */
function syncInputsFromState() {
  startDate.value = state.start;
  endDate.value = state.end;
  validateDates();
}

startDate.addEventListener("change", () => {
  if (!startDate.value) return;
  state.start = startDate.value;
  if (!state.end || state.end < state.start) state.end = state.start;
  endDate.value = state.end;
  showMonthOf(state.start);
  renderCalendar();
  validateDates();
});

endDate.addEventListener("change", () => {
  if (!endDate.value) return;
  state.end = endDate.value;
  renderCalendar();
  validateDates();
});

[startTime, endTime].forEach(input => input.addEventListener("change", validateDates));

allDayToggle.addEventListener("change", () => {
  startTime.disabled = endTime.disabled = allDayToggle.checked;
  validateDates();
});

repeatSelect.addEventListener("change", () => {
  customRepeat.classList.toggle("d-none", repeatSelect.value !== "custom");
});

// Returns true when the end is not before the start
function validateDates() {
  const allDay = allDayToggle.checked;
  const start = new Date(`${startDate.value}T${allDay ? "00:00" : startTime.value || "00:00"}`);
  const end = new Date(`${endDate.value}T${allDay ? "23:59" : endTime.value || "00:00"}`);
  const ok = !isNaN(start) && !isNaN(end) && end >= start;

  endDate.classList.toggle("is-invalid", !ok);
  dateError.classList.toggle("d-none", ok);
  return ok;
}

/* ---------- Save ---------- */
titleInput.addEventListener("input", () => titleInput.classList.remove("is-invalid"));

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const titleOk = titleInput.value.trim() !== "";
  titleInput.classList.toggle("is-invalid", !titleOk);
  const datesOk = validateDates();
  if (!titleOk || !datesOk) return;

  const reminder = {
    id: Date.now(),
    title: titleInput.value.trim(),
    description: document.getElementById("descInput").value.trim(),
    color: state.color,
    icon: state.icon,
    allDay: allDayToggle.checked,
    startDate: startDate.value,
    startTime: allDayToggle.checked ? null : startTime.value,
    endDate: endDate.value,
    endTime: allDayToggle.checked ? null : endTime.value,
    repeat: repeatSelect.value === "custom"
      ? { every: Number(document.getElementById("customInterval").value) || 1,
          unit: document.getElementById("customUnit").value }
      : repeatSelect.value,
    active: true,
  };

  console.log("New reminder:", reminder);   // placeholder: save to your real data source here
  window.location.href = "all_reminders.html";
});

/* ---------- Init ---------- */
const today = toISO(new Date());
state.start = state.end = today;
startDate.value = endDate.value = today;
showMonthOf(today);

buildPickers();
applyColor();
applyIcon();
renderCalendar();
document.getElementById("profileName").textContent = `${profile.name}'s Dashboard`;