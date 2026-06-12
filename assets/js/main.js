// ===== Scroll animations =====
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  document.querySelectorAll(".fade-in").forEach((el) => {
    observer.observe(el);
  });
} else {
  document.querySelectorAll(".fade-in").forEach((el) => {
    el.classList.add("visible");
  });
}

// ===== Theme Switcher =====
const themeToggle = document.getElementById("themeToggle");
const themeDropdown = document.getElementById("themeDropdown");
const themeOptions = document.querySelectorAll(".theme-option");
const html = document.documentElement;

const savedTheme = localStorage.getItem("theme") || "dark-blue";
html.setAttribute("data-theme", savedTheme);
themeOptions.forEach((opt) => {
  opt.classList.toggle("active", opt.dataset.theme === savedTheme);
});

themeToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = themeDropdown.classList.toggle("open");
  themeToggle.classList.toggle("open");
  themeToggle.setAttribute("aria-expanded", isOpen);
});

themeOptions.forEach((opt) => {
  opt.addEventListener("click", () => {
    const theme = opt.dataset.theme;
    html.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    themeOptions.forEach((b) => b.classList.remove("active"));
    opt.classList.add("active");

    themeDropdown.classList.remove("open");
    themeToggle.classList.remove("open");
    themeToggle.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("click", () => {
  themeDropdown.classList.remove("open");
  themeToggle.classList.remove("open");
  themeToggle.setAttribute("aria-expanded", "false");
});

// ===== Consolidated scroll handler =====
const sections = document.querySelectorAll("section");
const navDots = document.querySelectorAll(".nav-dot");
const backToTopBtn = document.querySelector(".back-to-top");
const themeSwitcher = document.getElementById("themeSwitcher");
let lastScrollY = 0;
const THEME_HIDE_THRESHOLD = 80;

function onScroll() {
  const currentY = window.scrollY;

  // Nav dots active state
  let current = "";
  sections.forEach((section) => {
    if (currentY >= section.offsetTop - 200) {
      current = section.getAttribute("id");
    }
  });
  navDots.forEach((dot) => {
    dot.classList.toggle("active", dot.getAttribute("href") === "#" + current);
  });

  // Back to top button
  if (backToTopBtn) {
    backToTopBtn.classList.toggle("visible", currentY > 400);
  }

  // Theme switcher hide on scroll
  if (themeSwitcher) {
    if (themeDropdown && themeDropdown.classList.contains("open")) {
      themeDropdown.classList.remove("open");
      themeToggle.classList.remove("open");
    }
    if (currentY > THEME_HIDE_THRESHOLD && currentY > lastScrollY) {
      themeSwitcher.classList.add("hidden");
    } else if (currentY < lastScrollY || currentY <= THEME_HIDE_THRESHOLD) {
      themeSwitcher.classList.remove("hidden");
    }
  }

  lastScrollY = currentY;
}

window.addEventListener("scroll", onScroll, { passive: true });

// ===== Smooth scroll for navigation =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// ===== Portfolio Filter =====
const filterBtns = document.querySelectorAll(".filter-btn");
const portfolioCards = document.querySelectorAll(".portfolio-card");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;

    portfolioCards.forEach((card) => {
      if (filter === "all" || card.dataset.category === filter) {
        card.classList.remove("hidden");
        card.classList.add("visible");
      } else {
        card.classList.add("hidden");
      }
    });
  });
});

// ===== Animated counters for stats =====
function animateCounters() {
  const statNumbers = document.querySelectorAll(".stat-number");
  statNumbers.forEach((stat) => {
    const text = stat.textContent;
    const match = text.match(/(\d+)/);
    if (match) {
      const target = parseInt(match[1]);
      const suffix = text.replace(/\d+/, "");
      let current = 0;
      const increment = target / 40;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        stat.textContent = Math.floor(current) + suffix;
      }, 30);
    }
  });
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 },
);

const statsRow = document.querySelector(".stats-row");
if (statsRow) {
  statsObserver.observe(statsRow);
}

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== Visitor Tracking (Azure Function API) =====
(function trackVisitor() {
  var API_URL = 'https://communication-fn.azurewebsites.net/api/visitors?code=SFX8VCrbCZSKzGtBLYsM4KIPWEeyqyDkqF0xItiWF63-AzFumJqcJw==';

  // ===== sello_vid: stable anonymous visitor id =====
  function getOrCreateVisitorId() {
    var vid = localStorage.getItem('sello_vid');
    if (vid) return vid;
    vid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0;
        var v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
    localStorage.setItem('sello_vid', vid);
    return vid;
  }

  var visitorId = getOrCreateVisitorId();
  var ua = navigator.userAgent;

  function parseBrowser(u) {
    if (u.indexOf('Edg/') > -1) return 'Edge';
    if (u.indexOf('OPR/') > -1) return 'Opera';
    if (u.indexOf('Firefox/') > -1) return 'Firefox';
    if (u.indexOf('Chrome/') > -1 && u.indexOf('Safari/') > -1)
      return 'Chrome';
    if (u.indexOf('Safari/') > -1) return 'Safari';
    return 'Other';
  }

  function parseOS(u) {
    if (u.indexOf('Win') > -1) return 'Windows';
    if (u.indexOf('Mac') > -1) return 'macOS';
    if (u.indexOf('Linux') > -1) return 'Linux';
    if (u.indexOf('Android') > -1) return 'Android';
    if (u.indexOf('iPhone') > -1 || u.indexOf('iPad') > -1) return 'iOS';
    return 'Unknown';
  }

  function parseDevice(u) {
    if (u.indexOf('Mobile') > -1 || u.indexOf('Android') > -1)
      return 'Mobile';
    if (u.indexOf('iPad') > -1 || u.indexOf('Tablet') > -1)
      return 'Tablet';
    return 'Desktop';
  }

  function buildEntry() {
    return {
      sello_vid: visitorId,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      url: window.location.href,
      referrer: document.referrer || 'direct',
      userAgent: ua,
      browser: parseBrowser(ua),
      os: parseOS(ua),
      deviceType: parseDevice(ua),
      language: navigator.language,
      screen: screen.width + 'x' + screen.height,
    };
  }

  // ===== Main: POST visit to Azure Function =====
  var entry = buildEntry();
  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  }).catch(function () {});
})();

// ===== Typing effect for hero subtitle =====
const heroSubtitle = document.querySelector(".hero-subtitle");
if (heroSubtitle && !prefersReducedMotion) {
  const roles = [
    "Staff Engineer | Full-Stack Developer | AI Practitioner",
    "Azure Cloud Expert | .NET Core Specialist",
    "15+ Years Enterprise Experience",
    "AI/ML & LLM Integration Specialist",
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  // aria-live region for screen reader announcements
  const ariaLive = document.createElement("div");
  ariaLive.setAttribute("role", "status");
  ariaLive.setAttribute("aria-live", "polite");
  ariaLive.setAttribute("aria-atomic", "true");
  ariaLive.classList.add("sr-only");
  heroSubtitle.parentNode.insertBefore(ariaLive, heroSubtitle.nextSibling);
  let announcedRoles = new Set();

  function typeRole() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      heroSubtitle.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      heroSubtitle.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    // Announce to screen reader only when a full role is typed
    if (!isDeleting && charIndex === currentRole.length && !announcedRoles.has(roleIndex)) {
      ariaLive.textContent = currentRole;
      announcedRoles.add(roleIndex);
      if (announcedRoles.size === roles.length) announcedRoles.clear();
    }

    let typeSpeed = isDeleting ? 30 : 60;

    if (!isDeleting && charIndex === currentRole.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 500;
    }

    setTimeout(typeRole, typeSpeed);
  }

  setTimeout(typeRole, 2000);
}
