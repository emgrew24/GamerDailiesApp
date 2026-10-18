// THIS IS ALL PLACEHOLDER DATA FOR TESTING UNTIL BACKEND GETS SET UP
const profile = { name: "SuperGamer24" };

// Storing reminder data
const reminders = [
  { title: "Game event!", icon: "bi-gift-fill", color: "yellow",
    when: "Mon, Oct 1 - Sat, Oct 31, 2026", time: "All day" },
  { title: "Do tasks", icon: "bi-star-fill", color: "orange",
    when: "Every Wednesday", time: "3:00 pm" },
];

// Storing list data
const recentLists = [
  { id: 1, title: "List Title 1" },
  { id: 2, title: "List Title 2" },
  { id: 3, title: "List Title 3" },
  { id: 4, title: "List Title 4" },
];

// Create elements with the html tag, class list, and content (if there is any)
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;   // textContent keeps user-entered text safe
  return node;
}

// Display upcomming reminders 
function renderReminders() {
  const container = document.getElementById("upcomingReminders");
  container.replaceChildren();

  if (reminders.length === 0) {
    container.append(el("p", "text-muted small", "No upcoming reminders."));
    return;
  }

  reminders.forEach(r => {
    const card = el("div", `reminder-card reminder-${r.color}`);

    const icon = el("div", "reminder-icon");
    icon.append(el("i", `bi ${r.icon}`));

    const meta = el("div", "reminder-meta");
    meta.append(el("div", "", r.when), el("div", "", r.time));

    card.append(icon, el("div", "reminder-title", r.title), meta);
    container.append(card);
  });
}

// Display recently created/opened lists
function renderRecentLists() {
  const container = document.getElementById("recentLists");
  container.replaceChildren();

  // Check if there area any recent lists to display
  if (recentLists.length === 0) {
    container.append(el("p", "text-muted small", "No recent activity yet."));
    return;
  }

  // Display each list thats available
  // Note - add a limit to how many lists can show up on the dashboard. 
  // ex. if there are more than 10 or 12 lists, only display the 8 most recent
  recentLists.forEach(list => {
    const col = el("div", "col");

    const link = el("a", "list-tile");        // the tile itself is the link
    link.href = `list.html?id=${list.id}`;
    link.setAttribute("aria-label", list.title);
    link.append(el("i", "bi bi-card-checklist"));

    col.append(link, el("small", "fw-bold d-block mt-2 text-truncate", list.title));
    container.append(col);
  });
}

// Display the users name in the sidebar
document.getElementById("profileName").textContent = `${profile.name}'s Dashboard`;
renderReminders();
renderRecentLists();