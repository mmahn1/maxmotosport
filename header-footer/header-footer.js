let serverUrl;
// Resolve assets relative to where this script is served from (robust for subpaths)
const currentScript = document.currentScript || Array.from(document.scripts).find(s => (s.src || '').includes('header-footer/header-footer.js'));
const scriptUrl = currentScript && currentScript.src ? currentScript.src : new URL('header-footer.js', window.location.href).toString();
const HEADER_FOOTER_BASE = new URL('./', scriptUrl).toString(); // .../header-footer/
const SITE_BASE = new URL('../', HEADER_FOOTER_BASE).toString(); // parent of header-footer/
fetch("/api/config")
  .then((response) => response.json())
  .then((config) => {
    serverUrl = config.SERVER_URL;
  // server url loaded
  })
  .catch((error) => {
    console.error("❌ Error fetching server URL:", error);
  });

document.addEventListener("DOMContentLoaded", function () {
  ensureHeaderAssets();
  window.addEventListener("resize", adjustFooterPosition);
  window.addEventListener("scroll", handleHeaderScroll);
  // Initialize dynamic parts once DOM is ready
  loadHeader();
  loadFooter();
  loadNewsletter();
  // Enforce session-based cart: clear any stale persistent cart from localStorage
  try { localStorage.removeItem("cart"); } catch (e) {}
  adjustFooterPosition();
  updateCartCount();
});

function ensureHeaderAssets() {
  const head = document.head || document.getElementsByTagName("head")[0];
  const version = 'v=20250828';

  // Ensure global media queries stylesheet is present (robust for subpaths)
  let mediaLink = document.querySelector('link[data-global-media-queries]')
                || Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(l => (l.href||'').includes('media_queries.css'));
  if (!mediaLink) {
    mediaLink = document.createElement('link');
    mediaLink.rel = 'stylesheet';
    mediaLink.href = SITE_BASE + 'media_queries.css?' + version;
    mediaLink.setAttribute('data-global-media-queries', 'true');
    head.appendChild(mediaLink);
  } else {
    try { mediaLink.href = SITE_BASE + 'media_queries.css?' + version; } catch (e) {}
    mediaLink.setAttribute('data-global-media-queries', 'true');
  }

  // Ensure header/footer stylesheet is present and loaded LAST for priority
  let headerCss = document.querySelector('link[data-header-footer-css]');
  if (!headerCss) {
    headerCss = document.createElement('link');
    headerCss.rel = 'stylesheet';
    headerCss.setAttribute('data-header-footer-css', 'true');
  }
  headerCss.href = HEADER_FOOTER_BASE + 'header-footer.css?' + version;
  // Move to end of head to maximize cascade priority
  if (headerCss.parentNode !== head) {
    head.appendChild(headerCss);
  } else {
    head.removeChild(headerCss);
    head.appendChild(headerCss);
  }

  // Ensure Font Awesome is present (for all the <i class="fa*"> icons)
  const faSelector = 'link[href*="font-awesome"], link[href*="fontawesome"], link[href*="/css/all.min.css"]';
  if (!document.querySelector(faSelector)) {
    const fa = document.createElement("link");
    fa.rel = "stylesheet";
    fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css";
    fa.crossOrigin = "anonymous";
    head.appendChild(fa);
  }

  // Minimal fallback CSS in case main header CSS fails to load (keeps account on the right)
  if (!document.querySelector('style[data-header-fallback-css]')) {
    const style = document.createElement('style');
    style.setAttribute('data-header-fallback-css', 'true');
    style.textContent = `
      header .desktop-nav { display: flex; justify-content: space-between; align-items: center; }
      header .desktop-nav .main-nav { display: flex; gap: 16px; list-style: none; padding: 0; margin: 0; }
      header .desktop-nav .nav-right { margin-left: auto; display: flex; gap: 16px; list-style: none; padding: 0; margin: 0; }
      header .mobile-header { display: none; }
      @media (max-width:900px){ header .desktop-nav { display:none; } header .mobile-header { display:flex; justify-content: space-between; align-items:center; } }
    `;
    head.appendChild(style);
  }
}

function loadHeader() {
  fetch(HEADER_FOOTER_BASE + "header.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load header");
      }
      return response.text();
    })
    .then((html) => {
      const headerPlaceholder = document.getElementById("header-placeholder");
      if (headerPlaceholder) {
        headerPlaceholder.innerHTML = html;
  // header loaded

        // Wait for DOM elements to be available, then update user display
        setTimeout(() => {
          // Normalize header links to work under any subpath
          try {
            // Rewrite any root-relative links (starting with "/") to the correct site base
            document.querySelectorAll('a[href^="/"]').forEach(a => {
              const rel = a.getAttribute('href').replace(/^\//, '');
              a.href = SITE_BASE + rel;
            });
          } catch (e) { /* ignore */ }

          updateUserDisplay();
          setupBurgerMenu();
          // Ensure the cart count reflects persisted cart after header is in DOM
          updateCartCount();

          // Force check admin status on every page load
          const role = localStorage.getItem("role");
          if (role === "admin") {
            showAdminButton();
          }
        }, 100); // Increased timeout to ensure DOM is ready
      } else {
        console.error("❌ Header placeholder not found in DOM.");
      }
    })
    .catch((error) => {
      console.error("❌ Error loading header:", error);
    });
}

// (Removed duplicate DOMContentLoaded that redundantly called loadHeader)

function loadFooter() {
  fetch(HEADER_FOOTER_BASE + "footer.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load footer");
      }
      return response.text();
    })
    .then((html) => {
      document.getElementById("footer-placeholder").innerHTML = html;
  // footer loaded
    })
    .catch((error) => {
      console.error("❌ Error loading footer:", error);
    });
}

function loadNewsletter() {
  // Try to load newsletter from sibling Newsletter/ folder
  const newsletterBase = SITE_BASE + 'Newsletter/';
  fetch(newsletterBase + "index.html")
    .then((response) => {
      if (!response.ok) {
        console.warn(
          `Newsletter not loaded: ${response.status} ${response.statusText}. This is normal if the page doesn't use the newsletter.`
        );
        return null;
      }
      return response.text();
    })
    .then((html) => {
      if (!html) return; // Skip if the fetch failed

      const newsletterPlaceholder = document.getElementById(
        "newsletter-placeholder"
      );
      if (newsletterPlaceholder) {
        newsletterPlaceholder.innerHTML = html;
  // newsletter loaded
      } else {
        console.warn(
          "⚠️ Note: 'newsletter-placeholder' div not found. This is normal if the current page doesn't use the newsletter."
        );
      }
    })
    .catch((error) => {
      console.warn("⚠️ Newsletter could not be loaded:", error);
    });
}

function updateCartCount() {
  // Only sessionStorage so the count resets on window/tab close
  let raw = null;
  try {
    raw = sessionStorage.getItem("cart");
  } catch (e) {}
  const cart = raw ? JSON.parse(raw) : [];
  const cartCountElement = document.getElementById("cart-count");
  const cartCountMobileElement = document.getElementById("cart-count-mobile");

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cartCountElement) cartCountElement.textContent = totalItems;
  if (cartCountMobileElement) cartCountMobileElement.textContent = totalItems;
}

window.addEventListener("storage", (event) => {
  if (event.key === "cart") {
    updateCartCount();
  }
});

function updateUserDisplay() {
  const userLink = document.getElementById("userLink");
  const userText = document.getElementById("userText");
  const userIcon = document.getElementById("userIcon");

  // Mobile elements
  const userLinkMobile = document.getElementById("userLinkMobile");
  const userTextMobile = document.getElementById("userTextMobile");
  const userIconMobile = document.getElementById("userIconMobile");
  const mobileUserIcon = document.getElementById("mobileUserIcon");

  // Prefer sessionStorage for auth (auto-clears on tab close), fallback to localStorage
  const username = sessionStorage.getItem("username") || localStorage.getItem("username");
  const role = sessionStorage.getItem("role") || localStorage.getItem("role");

  // Update desktop elements
  if (userLink && userText && userIcon) {
    if (username) {
      userText.textContent = username;
      userLink.dataset.role = role;

      if (role === "admin") {
        userIcon.className = "fas fa-crown";
      } else {
        userIcon.className = "fas fa-user-circle";
      }
    } else {
      userText.textContent = "Login / Register";
      userIcon.className = "fas fa-user";
      userLink.dataset.role = "";
    }
  }

  // Update mobile menu elements
  if (userLinkMobile && userTextMobile && userIconMobile) {
    if (username) {
      userTextMobile.textContent = username;
      userLinkMobile.dataset.role = role;

      if (role === "admin") {
        userIconMobile.className = "fas fa-crown";
      } else {
        userIconMobile.className = "fas fa-user-circle";
      }
    } else {
      userTextMobile.textContent = "Login / Register";
      userIconMobile.className = "fas fa-user";
      userLinkMobile.dataset.role = "";
    }
  }

  // Update mobile header user icon
  if (mobileUserIcon) {
    if (username) {
      if (role === "admin") {
        mobileUserIcon.className = "fas fa-crown";
      } else {
        mobileUserIcon.className = "fas fa-user-circle";
      }
    } else {
      mobileUserIcon.className = "fas fa-user";
    }
  }

  // Handle admin dashboard nav for both desktop and mobile
  const adminDashboardNav = document.getElementById("adminDashboardNav");
  const adminDashboardNavMobile = document.getElementById(
    "adminDashboardNavMobile"
  );

  if (role === "admin") {
    if (adminDashboardNav) adminDashboardNav.classList.remove("hidden");
    if (adminDashboardNavMobile)
      adminDashboardNavMobile.classList.remove("hidden");
  } else {
    if (adminDashboardNav) adminDashboardNav.classList.add("hidden");
    if (adminDashboardNavMobile)
      adminDashboardNavMobile.classList.add("hidden");
  }
}

// Dedicated function to show admin button
function showAdminButton() {
  const adminDashboardNav = document.getElementById("adminDashboardNav");
  const adminDashboardNavMobile = document.getElementById(
    "adminDashboardNavMobile"
  );

  if (adminDashboardNav) {
    adminDashboardNav.classList.remove("hidden");
  adminDashboardNav.style.display = "";
  adminDashboardNav.style.visibility = "";
  adminDashboardNav.style.opacity = "";
  } else {
  // element not found
  }

  if (adminDashboardNavMobile) {
    adminDashboardNavMobile.classList.remove("hidden");
  adminDashboardNavMobile.style.display = "";
  adminDashboardNavMobile.style.visibility = "";
  adminDashboardNavMobile.style.opacity = "";
  } else {
  // element not found
  }
}

function adjustFooterPosition() {
  const body = document.body;
  const html = document.documentElement;
  const footer = document.querySelector(".footer");

  if (footer) {
    const bodyHeight = body.scrollHeight;
    const windowHeight = window.innerHeight;

    if (bodyHeight < windowHeight) {
      footer.style.position = "absolute";
      footer.style.bottom = "0";
      footer.style.width = "100%";
    } else {
      footer.style.position = "relative";
    }
  }
}

function handleHeaderScroll() {
  const header = document.querySelector("header");
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add("header-scrolled");
    } else {
      header.classList.remove("header-scrolled");
    }
  }
}

// (Removed unused: checkAdminStatus, setupSearchBar, setupDropdownMenus)

function setupBurgerMenu() {
  const burgerMenu = document.getElementById("burgerMenu");
  const mobileNavOverlay = document.getElementById("mobileNavOverlay");

  if (burgerMenu && mobileNavOverlay) {
    // Hide burger on desktop, show on mobile
    const updateBurgerVisibility = () => {
      const hasFinePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const isDesktopWidth = window.innerWidth > 900;
      if (hasFinePointer || isDesktopWidth) {
        burgerMenu.style.display = 'none';
        mobileNavOverlay.classList.remove("show");
      } else {
        burgerMenu.style.display = ""; // revert to CSS-controlled value
      }
    };
  updateBurgerVisibility();

    burgerMenu.addEventListener("click", function () {
      mobileNavOverlay.classList.toggle("show");

      // Toggle burger icon
      const icon = burgerMenu.querySelector("i");
      if (icon) {
        if (mobileNavOverlay.classList.contains("show")) {
          icon.className = "fas fa-times";
          // Prevent body scroll when menu is open
          document.body.style.overflow = "hidden";
        } else {
          icon.className = "fas fa-bars";
          document.body.style.overflow = "";
        }
      }
    });

    // Close menu when clicking on overlay background
    mobileNavOverlay.addEventListener("click", function (event) {
      if (event.target === mobileNavOverlay) {
        mobileNavOverlay.classList.remove("show");
        const icon = burgerMenu.querySelector("i");
        if (icon) {
          icon.className = "fas fa-bars";
        }
        document.body.style.overflow = "";
      }
    });

    // Close menu when clicking on a link
    const navLinks = mobileNavOverlay.querySelectorAll("a");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        mobileNavOverlay.classList.remove("show");
        const icon = burgerMenu.querySelector("i");
        if (icon) {
          icon.className = "fas fa-bars";
        }
        document.body.style.overflow = "";
      });
    });

    // Handle window resize - ensure proper display
    window.addEventListener("resize", function () {
  if (window.innerWidth > 900) {
        // Desktop view - close mobile menu if open
        mobileNavOverlay.classList.remove("show");
        const icon = burgerMenu.querySelector("i");
        if (icon) {
          icon.className = "fas fa-bars";
        }
        document.body.style.overflow = "";
      }
  updateBurgerVisibility();
    });
  }
}

// (Removed debug/test helpers and their global exposures)
