// This is a template for the sidebar that is seen across the entire user interface
// It is much easier to manage/adjust if the source code is in one place
// Even if it's a little harder to read because its in JavaScript instead of regular HTML

// Build the sidebar as a web component to work with Electrons loading style
class GamerDailiesSidebar extends HTMLElement{
    connectedCallback() {
            this.style.display = 'contents';

            const title = this.getAttribute('title') || 'Dashboard';

            this.innerHTML = `
                <aside class="sidebar d-flex flex-column p-3" id="sidebarSection">
                    <a href="settings.html?category=profile"
                        class="sidebar-profile d-flex align-items-center gap-2 pb-3 sidebar-divider text-dark text-decoration-none"
                        aria-label="Open profile settings">
                            <i class="bi bi-person-circle fs-1"></i>
                            <span id="profileName" class="small">Dashboard</span>
                    </a>

                    <nav class="d-grid gap-3 mt-4">
                        <a href="all_lists.html" class="btn btn-light border border-dark rounded-pill fw-bold btn-sm">All Lists</a>
                        <a href="all_reminders.html" class="btn btn-light border border-dark rounded-pill fw-bold btn-sm">All Reminders</a>
                    </nav>

                    <div class="mt-auto d-flex flex-column align-items-center gap-2">
                    <a href="settings.html" class="btn btn-secondary btn-sm fw-bold">
                        <i class="bi bi-gear-fill"></i> Settings
                    </a>
                    <a href="profile_select.html" class="btn btn-danger btn-sm">Log Out</a>
                    </div>
                </aside>
            `;
    }
}

// Allows the new class to be used as an HTML tag
customElements.define('gamer-dailies-sidebar', GamerDailiesSidebar);


// ------------------------- How To Use --------------------------
// --- In each HTML page put this line where the sidebar will go 
// <gamer-dailies-sidebar></gamer-dailies-sidebar>

// --- Put this line after the bootstrap js script tag before any page js
// --- The sidebar elements need to be loaded in before the page js
// --- can use them to display things like the profile name & pic
// <script src="../assets/templates/sidebar.js"></script>