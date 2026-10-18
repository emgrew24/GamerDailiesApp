// THIS IS ALL PLACEHOLDER DATA FOR TESTING UNTIL BACKEND GETS SET UP
const profile = { name: "SuperGamer24" };

// Soft colors so highlighted text stays readable
const HIGHLIGHTS = ["#fff3a3", "#ffd6a5", "#c7f0c2", "#ffc2dd", "#bfeff0", "#bde3ff"];

const editor = document.getElementById("editor");
const editorScroll = document.getElementById("editorScroll");
const titleInput = document.getElementById("listTitle");
const panelWrap = document.getElementById("toolPanelWrap");
const openPanelBtn = document.getElementById("openPanelBtn");
const selectionBar = document.getElementById("selectionBar");

// Enter creates <p> paragraphs instead of <div>s
document.execCommand("defaultParagraphSeparator", false, "p");

/* ---------- Formatting helpers ---------- */
function run(command, value = null) {
  editor.focus();
  document.execCommand("styleWithCSS", false, true);   // highlight becomes background-color
  document.execCommand(command, false, value);
}

function toggleBlock(tag) {
  editor.focus();
  const current = document.queryCommandValue("formatBlock").toLowerCase();
  run("formatBlock", `<${current === tag ? "p" : tag}>`);
}

function currentList() {
  const node = getSelection().anchorNode;
  const elem = node && (node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement);
  const ul = elem && elem.closest("ul");
  return ul && editor.contains(ul) ? ul : null;
}

function toggleList(square) {
  editor.focus();
  const list = currentList();
  if (list && list.classList.contains("square-list") !== square) {
    list.classList.toggle("square-list", square);       // switch bullet style
    return;
  }
  run("insertUnorderedList");                           // add the list, or remove it if already that style
  const after = currentList();
  if (after) after.classList.toggle("square-list", square);
}

function insertTable() {
  const row = `<tr>${"<td><br></td>".repeat(3)}</tr>`;
  run("insertHTML", `<table class="table table-bordered"><tbody>${row.repeat(3)}</tbody></table><p><br></p>`);
}

const COMMANDS = {
  h1: () => toggleBlock("h1"),
  h2: () => toggleBlock("h2"),
  h3: () => toggleBlock("h3"),
  h4: () => toggleBlock("h4"),
  bullets: () => toggleList(false),
  square: () => toggleList(true),
  table: insertTable,
  numbered: () => run("insertOrderedList"),
  quote: () => toggleBlock("blockquote"),
  divider: () => run("insertHorizontalRule"),
};

/* ---------- Side panel ---------- */
function setPanel(open) {
  panelWrap.classList.toggle("open", open);
  panelWrap.toggleAttribute("inert", !open);     // keeps hidden buttons out of the tab order
  openPanelBtn.classList.toggle("d-none", open);
  openPanelBtn.setAttribute("aria-expanded", String(open));
}

openPanelBtn.addEventListener("click", () => setPanel(true));
document.getElementById("closePanelBtn").addEventListener("click", () => setPanel(false));

// Stop panel buttons from stealing focus, so the text selection/cursor stays put
panelWrap.addEventListener("mousedown", (e) => {
  if (e.target.closest("[data-cmd]")) e.preventDefault();
});

panelWrap.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cmd]");
  if (btn) COMMANDS[btn.dataset.cmd]();
});

/* ---------- Highlight color popup ---------- */
function buildSelectionBar() {
  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "bar-swatch bar-clear";
  clear.dataset.bg = "transparent";
  clear.setAttribute("aria-label", "Remove background color");
  clear.innerHTML = '<i class="bi bi-slash-circle"></i>';
  selectionBar.append(clear);

  HIGHLIGHTS.forEach(color => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "bar-swatch";
    b.dataset.bg = color;
    b.style.backgroundColor = color;
    b.setAttribute("aria-label", `Highlight ${color}`);
    selectionBar.append(b);
  });
}

function hideSelectionBar() {
  selectionBar.classList.add("d-none");
}

function updateSelectionBar() {
  const sel = getSelection();
  if (!sel.rangeCount || sel.isCollapsed ||
      !editor.contains(sel.anchorNode) || !editor.contains(sel.focusNode)) {
    hideSelectionBar();
    return;
  }

  const rect = sel.getRangeAt(0).getBoundingClientRect();
  if (!rect.width && !rect.height) { hideSelectionBar(); return; }

  selectionBar.classList.remove("d-none");        // show first so we can measure it
  const barW = selectionBar.offsetWidth;
  const barH = selectionBar.offsetHeight;

  let top = rect.top - barH - 8;
  if (top < 8) top = rect.bottom + 8;             // no room above: go below
  let left = rect.left + rect.width / 2 - barW / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - barW - 8));

  selectionBar.style.top = `${top}px`;
  selectionBar.style.left = `${left}px`;
}

// Keep the selection when clicking the popup
selectionBar.addEventListener("mousedown", (e) => e.preventDefault());

selectionBar.addEventListener("click", (e) => {
  const swatch = e.target.closest("[data-bg]");
  if (swatch) run("hiliteColor", swatch.dataset.bg);
});

// Show after the user finishes selecting (not while dragging)
editor.addEventListener("mouseup", () => setTimeout(updateSelectionBar, 0));
editor.addEventListener("keyup", updateSelectionBar);
document.addEventListener("mousedown", (e) => {
  if (!selectionBar.contains(e.target) && !editor.contains(e.target)) hideSelectionBar();
});
editorScroll.addEventListener("scroll", hideSelectionBar);
window.addEventListener("resize", hideSelectionBar);

/* ---------- Paste as plain text (keeps outside styles out of your lists) ---------- */
editor.addEventListener("paste", (e) => {
  e.preventDefault();
  const text = e.clipboardData.getData("text/plain");
  document.execCommand("insertText", false, text);
});

/* ---------- Title + Save ---------- */
titleInput.addEventListener("input", () => {
  document.getElementById("titleError").classList.add("d-none");
});

// Enter in the title jumps into the editor
titleInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); editor.focus(); }
});

document.getElementById("saveListBtn").addEventListener("click", () => {
  const title = titleInput.value.trim();
  if (!title) {
    document.getElementById("titleError").classList.remove("d-none");
    titleInput.focus();
    return;
  }

  const list = {
    id: Date.now(),
    title,
    content: editor.innerHTML,        // formatted content as HTML
    created: new Date().toISOString().slice(0, 10),
  };

  console.log("New list:", list);     // placeholder: save to your real data source here
  window.location.href = "all_lists.html";
});

/* ---------- Init ---------- */
buildSelectionBar();
document.getElementById("profileName").textContent = `${profile.name}'s Dashboard`;