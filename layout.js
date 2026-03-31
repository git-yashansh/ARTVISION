/* ============================================================
   SHARED LAYOUT — navbar + footer + loading screen
   Included via <script src="layout.js"></script> in each page
   ============================================================ */

(function () {

  /* ──────────────────────────────────────────────────────
     BUG 4 FIX — Navbar login state not updating after login
     --------------------------------------------------------
     Root cause: layout.js always rendered a hardcoded
     <a href="login.html" class="nav-cta">Login</a> link.
     After a successful login, script.js stored no state, so
     on every page load layout.js re-injected the same "Login"
     link regardless of whether the user had authenticated.

     Fix:
       1. On successful login (script.js initLoginForm), store
          the username in sessionStorage under 'av_user'.
       2. Here in layout.js, read sessionStorage on every page load.
          • If logged out  → render the "Login" CTA link as before.
          • If logged in   → render a user-menu pill showing the
            username + a dropdown with "My Dashboard" and "Log out".
       3. "Log out" clears sessionStorage and redirects to login.html.
       4. Using sessionStorage (not localStorage) means the session
          clears automatically when the browser tab/window closes,
          matching the expected behaviour of a portfolio login.
  ────────────────────────────────────────────────────── */

  const loggedInUser = sessionStorage.getItem('av_user');

  /* Build the auth nav item based on session state */
  const authNavItem = loggedInUser
    ? `
      <li class="nav-user-wrap">
        <button class="nav-user-btn" id="nav-user-btn" aria-expanded="false" aria-haspopup="true">
          <span class="nav-user-avatar">${loggedInUser.charAt(0).toUpperCase()}</span>
          <span class="nav-user-name">${escapeHtml(loggedInUser)}</span>
          <svg class="nav-user-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="nav-user-dropdown" id="nav-user-dropdown" role="menu">
          <a href="index.html" class="nav-dropdown-item" role="menuitem">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
          <a href="about.html" class="nav-dropdown-item" role="menuitem">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            My Profile
          </a>
          <div class="nav-dropdown-divider"></div>
          <button class="nav-dropdown-item nav-logout-btn" id="nav-logout" role="menuitem">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log Out
          </button>
        </div>
      </li>
    `
    : `<li><a href="login.html" class="nav-cta">Login</a></li>`;

  /* Simple XSS guard for username displayed in HTML */
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  const navHTML = `
  <!-- Loading Screen -->
  <div id="loading-screen">
    <div class="loader-logo">Artvision.</div>
    <div class="loader-bar-wrap"><div class="loader-bar"></div></div>
  </div>

  <!-- Custom Cursor -->
  <div class="cursor-dot"></div>
  <div class="cursor-ring"></div>

  <!-- Navbar -->
  <nav class="navbar">
    <div class="nav-container">
      <a href="index.html" class="nav-logo">Artvision.</a>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="skills.html">Skills</a></li>
        <li><a href="projects.html">Projects</a></li>
        <li><a href="contact.html">Contact</a></li>
        ${authNavItem}
      </ul>
      <div class="nav-hamburger" id="hamburger">
        <span></span><span></span><span></span>
      </div>
    </div>
  </nav>
  `;

  const footerHTML = `
  <footer class="footer">
    <div class="footer-logo">Artvision.</div>
    <p class="footer-text">
      Crafted with passion &amp; pixels. &copy; ${new Date().getFullYear()} Artvision Portfolio.
      Built by <a href="about.html">Alex Rivera</a>.
    </p>
  </footer>
  `;

  /*
   * BUG 1 FIX (layout.js side) — wrap all page-specific content in <main>
   * so the body flex column layout correctly identifies the growable region.
   * Without this wrapper, the flex children are a mix of sections/divs and
   * the footer ends up not being the last flex item correctly.
   *
   * Strategy: inject nav at top, footer at bottom, and let the body's own
   * flex layout handle vertical distribution (handled in styles.css).
   */
  document.body.insertAdjacentHTML('afterbegin', navHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);

  /* ── Hamburger wiring ── */
  const ham  = document.getElementById('hamburger');
  const menu = document.querySelector('.nav-links');
  if (ham && menu) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      menu.classList.toggle('open');
    });
  }

  /* ── BUG 4 FIX: User menu dropdown toggle ── */
  const userBtn      = document.getElementById('nav-user-btn');
  const userDropdown = document.getElementById('nav-user-dropdown');

  if (userBtn && userDropdown) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = userBtn.getAttribute('aria-expanded') === 'true';
      userBtn.setAttribute('aria-expanded', String(!isOpen));
      userDropdown.classList.toggle('open', !isOpen);
    });

    /* Close on outside click */
    document.addEventListener('click', () => {
      userBtn.setAttribute('aria-expanded', 'false');
      userDropdown.classList.remove('open');
    });

    /* Close on Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        userBtn.setAttribute('aria-expanded', 'false');
        userDropdown.classList.remove('open');
      }
    });
  }

  /* ── BUG 4 FIX: Logout handler ── */
  document.getElementById('nav-logout')?.addEventListener('click', () => {
    sessionStorage.removeItem('av_user');
    window.location.href = 'login.html';
  });

})();