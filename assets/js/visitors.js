// ===== Theme Switcher =====
(function () {
  var savedTheme = localStorage.getItem("theme") || "dark-blue";
  document.documentElement.setAttribute("data-theme", savedTheme);

  var toggle = document.getElementById("themeToggle");
  var dropdown = document.getElementById("themeDropdown");
  var options = document.querySelectorAll(".theme-option");

  options.forEach(function (opt) {
    opt.classList.toggle("active", opt.dataset.theme === savedTheme);
  });

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("open");
    toggle.classList.toggle("open");
  });

  options.forEach(function (opt) {
    opt.addEventListener("click", function () {
      var theme = opt.dataset.theme;
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
      options.forEach(function (b) { b.classList.remove("active"); });
      opt.classList.add("active");
      dropdown.classList.remove("open");
      toggle.classList.remove("open");
    });
  });

  document.addEventListener("click", function () {
    dropdown.classList.remove("open");
    toggle.classList.remove("open");
  });
})();

// ===== Admin Logic (per-visitor deduplication via sello_vid) =====
(function () {
  var PER_PAGE = 25;
  var currentPage = 1;
  var allRecords = [];
  var visitors = [];
  var sortField = 'lastSeen';
  var sortAsc = false;

  var dashboard = document.getElementById('dashboard');
  var loadingSpinner = document.getElementById('loadingSpinner');
  var emptyState = document.getElementById('emptyState');
  var tableBody = document.getElementById('visitorTableBody');
  var searchInput = document.getElementById('searchInput');

  var countryFlags = {
    'AF':'🇦🇫','AL':'🇦🇱','DZ':'🇩🇿','AR':'🇦🇷','AU':'🇦🇺','AT':'🇦🇹',
    'BD':'🇧🇩','BE':'🇧🇪','BR':'🇧🇷','BG':'🇧🇬','KH':'🇰🇭','CA':'🇨🇦',
    'CL':'🇨🇱','CN':'🇨🇳','CO':'🇨🇴','HR':'🇭🇷','CZ':'🇨🇿','DK':'🇩🇰',
    'EG':'🇪🇬','EE':'🇪🇪','FI':'🇫🇮','FR':'🇫🇷','DE':'🇩🇪','GH':'🇬🇭',
    'GR':'🇬🇷','HK':'🇭🇰','HU':'🇭🇺','IN':'🇮🇳','ID':'🇮🇩','IR':'🇮🇷',
    'IQ':'🇮🇶','IE':'🇮🇪','IL':'🇮🇱','IT':'🇮🇹','JM':'🇯🇲','JP':'🇯🇵',
    'JO':'🇯🇴','KZ':'🇰🇿','KE':'🇰🇪','KR':'🇰🇷','KW':'🇰🇼','LA':'🇱🇦',
    'LV':'🇱🇻','LT':'🇱🇹','MY':'🇲🇾','MX':'🇲🇽','MA':'🇲🇦','MM':'🇲🇲',
    'NP':'🇳🇵','NL':'🇳🇱','NZ':'🇳🇿','NG':'🇳🇬','NO':'🇳🇴','PK':'🇵🇰',
    'PH':'🇵🇭','PL':'🇵🇱','PT':'🇵🇹','QA':'🇶🇦','RO':'🇷🇴','RU':'🇷🇺',
    'SA':'🇸🇦','SG':'🇸🇬','SK':'🇸🇰','SI':'🇸🇮','ZA':'🇿🇦','ES':'🇪🇸',
    'SE':'🇸🇪','CH':'🇨🇭','TW':'🇹🇼','TZ':'🇹🇿','TH':'🇹🇭','TR':'🇹🇷',
    'UG':'🇺🇬','UA':'🇺🇦','AE':'🇦🇪','GB':'🇬🇧','US':'🇺🇸','VN':'🇻🇳',
  };

  function deviceIcon(d) {
    if (d === 'Mobile') return '📱';
    if (d === 'Tablet') return '📋';
    return '💻';
  }

  // ===== Google Sign-In =====
  var loginOverlay = document.getElementById('loginOverlay');
  var loginError = document.getElementById('loginError');
  var accessDenied = document.getElementById('accessDenied');
  var retryBtn = document.getElementById('retryBtn');
  var allowedEmails = typeof ALLOWED_EMAILS !== 'undefined' ? ALLOWED_EMAILS : [];
  var clientId = typeof GOOGLE_CLIENT_ID !== 'undefined' ? GOOGLE_CLIENT_ID : '';

  function showLoginOverlay() {
    loginError.style.display = 'none';
    loginOverlay.style.display = 'flex';
    loginOverlay.classList.remove('hidden');
    var container = document.getElementById('googleSignInBtn');
    container.innerHTML = '';
    initGoogleSignIn();
  }

  function grantAccess() {
    loginOverlay.classList.add('hidden');
    setTimeout(function () { loginOverlay.style.display = 'none'; }, 400);
    dashboard.classList.add('active');
    loadData();
  }

  function showAccessDenied(msg) {
    loginError.textContent = msg || '⚠️ Access Denied — Your Google account is not authorized.';
    loginError.style.display = 'block';
  }

  function decodeJwt(token) {
    try {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')));
    } catch (e) {
      return null;
    }
  }

  function handleCredentialResponse(response) {
    var payload = decodeJwt(response.credential);
    if (!payload || !payload.email) {
      showAccessDenied('⚠️ Could not verify your Google account. Please try again.');
      return;
    }

    var email = payload.email.toLowerCase();
    if (allowedEmails.length === 0) {
      showAccessDenied('⚠️ No authorized emails configured. Update ALLOWED_EMAILS in config.js.');
      return;
    }
    if (allowedEmails.indexOf(email) === -1) {
      showAccessDenied('⚠️ Access Denied — "' + email + '" is not authorized.');
      return;
    }

    grantAccess();
  }

  function initGoogleSignIn() {
    if (!clientId || clientId.indexOf('YOUR_GOOGLE_CLIENT_ID') !== -1) {
      showAccessDenied('⚠️ Google Client ID not configured. Update config.js with your Google OAuth Client ID.');
      return;
    }
    if (typeof google === 'undefined' || !google.accounts) {
      setTimeout(initGoogleSignIn, 200);
      return;
    }
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
    });
    google.accounts.id.renderButton(
      document.getElementById('googleSignInBtn'),
      { theme: 'outline', size: 'large', width: 280, text: 'signin_with' }
    );
  }

  initGoogleSignIn();

  retryBtn.addEventListener('click', function () {
    accessDenied.classList.remove('active');
    showLoginOverlay();
  });

  // Refresh
  document.getElementById('refreshBtn').addEventListener('click', function () {
    loadData();
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', function () {
    dashboard.classList.remove('active');
    showLoginOverlay();
  });

  // Search
  searchInput.addEventListener('input', function () { currentPage = 1; renderTable(); });

  // Filter dropdowns
  ['filterCountry','filterCity','filterBrowser','filterDevice'].forEach(function (id) {
    document.getElementById(id).addEventListener('change', function () { currentPage = 1; renderTable(); });
  });

  // Sort headers
  document.querySelectorAll('.admin-table th[data-sort]').forEach(function (th) {
    th.addEventListener('click', function () {
      var field = th.dataset.sort;
      if (sortField === field) { sortAsc = !sortAsc; }
      else { sortField = field; sortAsc = field === 'visits' ? false : true; }
      document.querySelectorAll('.admin-table th').forEach(function (h) { h.classList.remove('sorted'); });
      th.classList.add('sorted');
      th.querySelector('.sort-icon').textContent = sortAsc ? '▲' : '▼';
      renderTable();
    });
  });

  var API_URL = 'https://communication-fn.azurewebsites.net/api/visitors?code=SFX8VCrbCZSKzGtBLYsM4KIPWEeyqyDkqF0xItiWF63-AzFumJqcJw==';

  // Export JSON
  document.getElementById('exportJsonBtn').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(allRecords, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'visitors.json';
    a.click();
    URL.revokeObjectURL(url);
  });



  // ===== Load raw records from Azure Function API and deduplicate by sello_vid =====
  function loadData() {
    loadingSpinner.style.display = 'block';
    emptyState.style.display = 'none';
    tableBody.innerHTML = '';

    fetch(API_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('API error: ' + r.status);
        return r.json();
      })
      .then(function (data) {
        allRecords = Array.isArray(data) ? data : (Array.isArray(data.record) ? data.record : []);
        allRecords.sort(function (a, b) {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        deduplicateVisitors();
        loadingSpinner.style.display = 'none';
        if (visitors.length === 0) { emptyState.style.display = 'block'; }
        updateStats();
        populateFilters();
        renderTable();
      })
      .catch(function (err) {
        loadingSpinner.style.display = 'none';
        emptyState.innerHTML = '<div class="empty-state-icon">⚠️</div><p>Failed to load data: ' + escHtml(err.message) + '</p><p style="font-size:0.8rem;margin-top:0.5rem;color:var(--text-muted)">Check Azure Function URL.</p>';
        emptyState.style.display = 'block';
      });
  }

  // ===== Deduplicate raw records into per-visitor summaries =====
  function deduplicateVisitors() {
    var visitorMap = {};
    function legacyFingerprint(r) {
      var raw = (r.userAgent || '') + '|' + (r.language || '') + '|' + (r.screen || '');
      var hash = 0;
      for (var i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
      }
      return 'legacy-' + Math.abs(hash).toString(36);
    }

    allRecords.forEach(function (r) {
      var vid = r.sello_vid || r.ipHash || legacyFingerprint(r);
      if (!visitorMap[vid]) {
        visitorMap[vid] = {
          sello_vid: vid,
          firstSeen: r.timestamp,
          lastSeen: r.timestamp,
          visits: 0,
          country: r.country || '',
          city: r.city || '',
          region: r.region || '',
          browser: r.browser || '',
          os: r.os || '',
          deviceType: r.deviceType || '',
          referrer: r.referrer || '',
          lastPage: r.page || '',
          language: r.language || '',
          pages: {},
        };
      }
      var v = visitorMap[vid];
      v.visits++;
      if (r.timestamp < v.firstSeen) v.firstSeen = r.timestamp;
      if (r.timestamp > v.lastSeen) {
        v.lastSeen = r.timestamp;
        v.country = r.country || v.country;
        v.city = r.city || v.city;
        v.region = r.region || v.region;
        v.browser = r.browser || v.browser;
        v.os = r.os || v.os;
        v.deviceType = r.deviceType || v.deviceType;
        v.referrer = r.referrer || v.referrer;
        v.lastPage = r.page || v.lastPage;
        v.language = r.language || v.language;
      }
      if (r.page) v.pages[r.page] = (v.pages[r.page] || 0) + 1;
    });
    visitors = Object.keys(visitorMap).map(function (k) { return visitorMap[k]; });
  }

  function populateFilters() {
    var countries = {}, cities = {}, browsers = {}, devices = {};
    visitors.forEach(function (v) {
      if (v.country) countries[v.country] = true;
      if (v.city) cities[v.city] = true;
      if (v.browser) browsers[v.browser] = true;
      if (v.deviceType) devices[v.deviceType] = true;
    });
    function fillSelect(id, obj) {
      var sel = document.getElementById(id);
      var current = sel.value;
      var label = sel.options[0] ? sel.options[0].text : '';
      sel.innerHTML = '<option value="">' + label + '</option>';
      Object.keys(obj).sort().forEach(function (k) {
        var opt = document.createElement('option');
        opt.value = k; opt.textContent = k; sel.appendChild(opt);
      });
      sel.value = current;
    }
    fillSelect('filterCountry', countries);
    fillSelect('filterCity', cities);
    fillSelect('filterBrowser', browsers);
    fillSelect('filterDevice', devices);
  }

  function updateStats() {
    var totalVisitors = visitors.length;
    var countries = {};
    var today = new Date().toISOString().slice(0, 10);
    var thirtyMinAgo = Date.now() - 30 * 60 * 1000;
    var newToday = 0;
    var returning = 0;
    var active = 0;

    visitors.forEach(function (v) {
      if (v.country) countries[v.country] = true;
      if (v.firstSeen && v.firstSeen.slice(0, 10) === today) newToday++;
      if (v.visits > 1) returning++;
      if (v.lastSeen && new Date(v.lastSeen).getTime() > thirtyMinAgo) active++;
    });

    document.getElementById('totalVisitors').textContent = totalVisitors;
    document.getElementById('newToday').textContent = newToday;
    document.getElementById('returningVisitors').textContent = returning;
    document.getElementById('activeVisitors').textContent = active;
    document.getElementById('uniqueCountries').textContent = Object.keys(countries).length;
    document.getElementById('totalPageViews').textContent = allRecords.length;
  }

  function getFilteredVisitors() {
    var query = (searchInput.value || '').toLowerCase();
    var fCountry = document.getElementById('filterCountry').value;
    var fCity = document.getElementById('filterCity').value;
    var fBrowser = document.getElementById('filterBrowser').value;
    var fDevice = document.getElementById('filterDevice').value;

    return visitors.filter(function (v) {
      if (query) {
        var s = ((v.sello_vid||'') + ' ' + (v.country||'') + ' ' + (v.city||'') + ' ' + (v.referrer||'') + ' ' + (v.browser||'') + ' ' + (v.os||'') + ' ' + (v.deviceType||'') + ' ' + (v.lastPage||'')).toLowerCase();
        if (s.indexOf(query) === -1) return false;
      }
      if (fCountry && v.country !== fCountry) return false;
      if (fCity && v.city !== fCity) return false;
      if (fBrowser && v.browser !== fBrowser) return false;
      if (fDevice && v.deviceType !== fDevice) return false;
      return true;
    });
  }

  function renderTable() {
    var filtered = getFilteredVisitors();

    filtered.sort(function (a, b) {
      var va = a[sortField] || '';
      var vb = b[sortField] || '';
      if (sortField === 'visits') { va = a.visits; vb = b.visits; }
      else if (sortField === 'firstSeen' || sortField === 'lastSeen') {
        va = new Date(va).getTime() || 0;
        vb = new Date(vb).getTime() || 0;
      }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

    var totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    var start = (currentPage - 1) * PER_PAGE;
    var pageRecords = filtered.slice(start, start + PER_PAGE);

    tableBody.innerHTML = '';
    pageRecords.forEach(function (v) {
      var tr = document.createElement('tr');
      var flag = countryFlags[v.country] || '🌍';
      var devIcon = deviceIcon(v.deviceType);
      var shortVid = v.sello_vid ? v.sello_vid.slice(0, 8) + '…' : '—';
      var firstSeenFmt = formatDateTime(v.firstSeen);
      var lastSeenFmt = formatDateTime(v.lastSeen);

      tr.innerHTML =
        '<td title="' + escHtml(v.sello_vid || '') + '"><span class="page-badge">' + escHtml(shortVid) + '</span></td>' +
        '<td title="' + escHtml(v.firstSeen || '') + '">' + escHtml(firstSeenFmt) + '</td>' +
        '<td title="' + escHtml(v.lastSeen || '') + '">' + escHtml(lastSeenFmt) + '</td>' +
        '<td><strong>' + v.visits + '</strong></td>' +
        '<td><span class="location-badge"><span class="country-flag">' + flag + '</span>' + escHtml(v.country || '—') + '</span></td>' +
        '<td title="' + escHtml(v.city || '') + '">' + escHtml(truncate(v.city || '—', 20)) + '</td>' +
        '<td><span class="device-badge"><span class="device-icon">' + devIcon + '</span>' + escHtml(v.deviceType || '—') + '</span></td>' +
        '<td>' + escHtml(v.browser || '—') + '</td>' +
        '<td>' + escHtml(v.os || '—') + '</td>' +
        '<td title="' + escHtml(v.referrer || '') + '">' + escHtml(truncate(v.referrer || 'direct', 25)) + '</td>' +
        '<td><span class="page-badge">' + escHtml(v.lastPage || '—') + '</span></td>';
      tableBody.appendChild(tr);
    });

    if (filtered.length === 0 && visitors.length > 0) {
      tableBody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:2rem;color:var(--text-muted);">No results match your filters.</td></tr>';
    } else if (filtered.length === 0) {
      emptyState.style.display = 'block';
      loadingSpinner.style.display = 'none';
    }

    renderPagination(totalPages, filtered.length);
  }

  function formatDateTime(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    } catch (e) { return iso; }
  }

  function renderPagination(totalPages, totalFiltered) {
    var pag = document.getElementById('pagination');
    pag.innerHTML = '';
    if (totalPages <= 1) return;

    var prev = document.createElement('button');
    prev.textContent = '← Prev';
    prev.disabled = currentPage === 1;
    prev.addEventListener('click', function () { currentPage--; renderTable(); });
    pag.appendChild(prev);

    for (var i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && Math.abs(i - currentPage) > 2 && i !== 1 && i !== totalPages) {
        if (i === currentPage - 3 || i === currentPage + 3) {
          var dots = document.createElement('span');
          dots.textContent = '…';
          dots.className = 'pagination-info';
          pag.appendChild(dots);
        }
        continue;
      }
      var btn = document.createElement('button');
      btn.textContent = i;
      if (i === currentPage) btn.className = 'active';
      (function (page) {
        btn.addEventListener('click', function () { currentPage = page; renderTable(); });
      })(i);
      pag.appendChild(btn);
    }

    var info = document.createElement('span');
    info.className = 'pagination-info';
    info.textContent = ' ' + totalFiltered + ' visitors ';
    pag.appendChild(info);

    var next = document.createElement('button');
    next.textContent = 'Next →';
    next.disabled = currentPage === totalPages;
    next.addEventListener('click', function () { currentPage++; renderTable(); });
    pag.appendChild(next);
  }

  function truncate(str, len) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '…' : str;
  }

  function escHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
