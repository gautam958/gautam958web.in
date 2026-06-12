# 🌐 gautam958web.in

> Personal portfolio website of **Gautam Kumar** — Staff Engineer, Full-Stack Developer & AI Practitioner based in Hong Kong.

![Website](https://img.shields.io/badge/Website-gautam958web.in-blue?style=for-the-badge&logo=azure&logoColor=white)
![Deployed](https://img.shields.io/badge/Deployed-Azure%20Static%20Web%20Apps-green?style=for-the-badge)

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Visitor Tracking](#visitor-tracking)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Contact](#contact)

---

## About

A modern, single-page portfolio showcasing 15+ years of enterprise software development experience spanning full-stack development, Microsoft Azure cloud solutions, AI/ML, and technical leadership. The site features a dark-themed design with multiple theme options, smooth animations, and a responsive layout.

**Key highlights:**
- 20+ live enterprise projects delivered across Windows, web, and mobile platforms
- Deployments across Hong Kong, China, Thailand, Philippines, and India
- Expertise in Azure AI, LLM/GPT integration, .NET Core, Angular, and enterprise systems

---

## Features

### 🎨 **Design**
- Modern glassmorphism UI with gradient backgrounds
- Fully responsive across all devices
- Smooth scroll animations and entrance effects
- Custom scrollbar styling

### 🌓 **Theme Switcher** (5 Themes)
- **Dark Blue** (default) — Professional dark theme
- **Light** — Clean, bright interface
- **Red Dark** — Bold, modern aesthetic
- **Midnight** — Aurora-themed liquid glass design
- **Indigo** — Sello-inspired purple gradient theme
- Theme preference saved to localStorage

### 📱 **Navigation**
- Fixed navigation dots for quick section jumping
- Active state tracking based on scroll position
- Smooth scroll to sections
- Skip-to-content link for keyboard accessibility

### 🎯 **Sections**
| Section | Description |
|---------|-------------|
| **Hero** | Profile image, name, title, typing animation, and CTA buttons |
| **About** | Professional summary |
| **Skills** | 6 categorized skill groups with hover animations + stats counters |
| **Experience** | Interactive timeline with 5 career positions |
| **Portfolio** | 24 enterprise projects with category filtering |
| **Education** | Degrees and Microsoft certifications |
| **Contact** | Email, LinkedIn, WhatsApp (HK & IN) |

### 📂 **Portfolio Highlights**
- **Azure AI** — Document Intelligence, ChatGPT integration, AI automation
- **Full Stack** — Trading platforms, CRM, client portals, billing systems
- **WMS & Logistics** — Warehouse management for A.S. Watson across 4 countries
- **Enterprise** — SAP integration, supply chain, manufacturing, government portals
- **Marketplace** — [Sello](https://gautam958.github.io/sello/index.html) — Online marketplace for buying and selling items

---

## Visitor Tracking

The site includes a visitor tracking system powered by an **Azure Function API** that records page views and provides an admin dashboard.

### How It Works
- Every page load sends a visitor record to the Azure Function API
- Each visitor gets a unique anonymous ID (`sello_vid`) stored in localStorage
- Records include browser, OS, device type, screen size, language, referrer, and page visited

### Admin Dashboard (`visitors.html`)
- **KPI Cards:** Total Visitors, New Today, Returning, Active (30 min), Countries, Total Page Views
- **Per-visitor deduplication** by anonymous ID
- **Filterable/sortable table** with search, 6 filter dropdowns, and column sorting
- **Export options:** CSV and JSON file download
- **Clear data** button to reset all records
- Protected by an authority key (see `config.js`)

### Access
1. Navigate to `visitors.html`
2. Enter the authority key from `config.js`
3. View visitor analytics and export data

### Azure Function API (`visitors`)

The backend is an **Azure Function** (C# / .NET) that handles visitor data storage. The function URL is:

```
https://communication-fn.azurewebsites.net/api/visitors?code=<FUNCTION_KEY>
```

#### Supported HTTP Methods

| Method | Description |
|--------|-------------|
| **POST** | Adds a new visitor record. Enriches with geolocation (ipinfo.io), country, city, region, timezone, and IP hash. |
| **PUT** | Updates an existing visitor by `sello_vid` or `visitorId`. |
| **GET** | Returns all stored visitor records as a JSON array. |
| **DELETE** | Not currently supported by the API. The "Clear Data" button on the admin dashboard clears the frontend state only — server-side data persists. |

#### CORS

Only requests from `https://gautam958web.in` are allowed. Other origins receive a `403 Forbidden`.

#### Data Storage

Visitor records are stored in `visitors.json` on the Azure Function's temp filesystem (`Path.GetTempPath()`). This means data may be lost if the function app restarts or scales down. For persistent storage, consider migrating to Azure Table Storage or Cosmos DB.

#### Function Source Code (Reference)

```csharp
#r "Newtonsoft.Json"
using System.Net;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.IO;
using System.Net.Http;
using System.Linq;

public static async Task<IActionResult> Run(HttpRequest req, ILogger log)
{
    log.LogInformation($"Visitor API function triggered. Method: {req.Method}");

    string origin = req.Headers["Origin"].FirstOrDefault();
    var allowedOrigins = new[] { "https://gautam958web.in" };

    if (!allowedOrigins.Contains(origin))
    {
        log.LogWarning($"Blocked request from origin: {origin}");
        return new StatusCodeResult(StatusCodes.Status403Forbidden);
    }

    string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
    dynamic data = string.IsNullOrWhiteSpace(requestBody) ? null : JsonConvert.DeserializeObject(requestBody);

    string filePath = Path.Combine(Path.GetTempPath(), "visitors.json");

    if (!File.Exists(filePath))
    {
        File.WriteAllText(filePath, "[]");
    }

    var visitors = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(filePath));

    if (string.Equals(req.Method, "POST", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(req.Method, "PUT", StringComparison.OrdinalIgnoreCase))
    {
        string clientIpRaw = req.Headers["X-Forwarded-For"].FirstOrDefault();
        string clientIp = clientIpRaw?.Split(',')[0].Split(':')[0];
        log.LogInformation($"Visitor IP: {clientIp}");

        dynamic geoData = null;
        using (var httpClient = new HttpClient())
        {
            try
            {
                string url = $"https://ipinfo.io/{clientIp}/json";
                var response = await httpClient.GetStringAsync(url);
                geoData = JsonConvert.DeserializeObject(response);
            }
            catch (Exception ex)
            {
                log.LogWarning($"Geo lookup failed: {ex.Message}");
            }
        }

        if (geoData != null && data != null)
        {
            data.country = geoData?.country ?? "Unknown";
            data.city = geoData?.city ?? "Unknown";
            data.region = geoData?.region ?? "Unknown";
            data.timezone = geoData?.timezone ?? "Unknown";
            data.ipHash = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(clientIp ?? "unknown"));
        }

        if (string.Equals(req.Method, "POST", StringComparison.OrdinalIgnoreCase))
        {
            visitors.Add(data);
            File.WriteAllText(filePath, JsonConvert.SerializeObject(visitors, Formatting.Indented));
            return new OkObjectResult(new { message = "Visitor added", id = data.visitorId ?? data.sello_vid });
        }
        else if (string.Equals(req.Method, "PUT", StringComparison.OrdinalIgnoreCase))
        {
            string visitorId = data?.visitorId ?? data?.sello_vid;
            if (string.IsNullOrEmpty(visitorId))
                return new BadRequestObjectResult("visitorId or sello_vid is required for PUT.");

            var existing = visitors.FirstOrDefault(v => v.visitorId == visitorId || v.sello_vid == visitorId);
            if (existing == null)
                return new NotFoundObjectResult($"Visitor {visitorId} not found.");

            int index = visitors.IndexOf(existing);
            visitors[index] = data;

            File.WriteAllText(filePath, JsonConvert.SerializeObject(visitors, Formatting.Indented));
            return new OkObjectResult(new { message = "Visitor updated", id = visitorId });
        }
    }
    else if (string.Equals(req.Method, "GET", StringComparison.OrdinalIgnoreCase))
    {
        return new OkObjectResult(visitors);
    }

    return new BadRequestObjectResult("Unsupported HTTP method.");
}
```

> **⚠️ Note:** This function uses the Azure Function temp filesystem for storage. Data is ephemeral and will be lost on function restart. For production use, consider Azure Table Storage, Cosmos DB, or Azure Blob Storage for persistent visitor data.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **JS Files** | `main.js` (portfolio), `visitors.js` (admin dashboard) |
| **Styling** | CSS Custom Properties, Flexbox, CSS Grid |
| **Fonts** | Google Fonts (Manrope, Playfair Display) |
| **Backend API** | Azure Functions (Visitor Tracking) |
| **Hosting** | Azure Static Web Apps |
| **CI/CD** | GitHub Actions |
| **Version Control** | Git & GitHub |

---

## Project Structure

```
/
├── index.html                         # Main portfolio (HTML + CSS)
├── visitors.html                      # Admin visitor dashboard (HTML + CSS)
├── config.js                          # Authority key for admin access
├── visitors.json                      # Visitor data export template
├── assets/
│   ├── css/style.css                  # Global styles with theme system
│   ├── js/
│   │   ├── main.js                    # Portfolio JS (animations, theme, tracking, typing)
│   │   └── visitors.js                # Admin dashboard JS (auth, data, filters, export)
│   ├── CurriculumVitaeGautamDetails.docx  # Downloadable CV
│   └── img/
│       ├── *.jpg                      # Profile & team photos
│       ├── *.ico                      # Favicons
│       └── favicon_io/site.webmanifest
├── .github/workflows/
│   └── main_gautam958web.yml          # Azure deployment workflow
├── sitemap.xml
├── robots.txt
├── favicon.ico
└── README.md
```

---

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/gautam958/gautam958web.in.git
   cd gautam958web.in
   ```

2. **Open directly in browser**
   ```bash
   open index.html          # macOS
   xdg-open index.html      # Linux
   start index.html         # Windows
   ```

3. **Or use a local server**
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```

4. **Access admin dashboard**
   - Open `visitors.html` in your browser
   - Enter the authority key defined in `config.js`

---

## Deployment

This site is deployed to **Azure Static Web Apps** with automatic CI/CD via GitHub Actions.

### Setup

1. Create an Azure Static Web App in the [Azure Portal](https://portal.azure.com)
2. Connect it to this GitHub repository
3. Add the secret `AZURE_STATIC_WEB_APPS_API_TOKEN` to your GitHub repository
4. Push to `main` to trigger deployment

The workflow (`.github/workflows/main_gautam958web.yml`) runs on every push to `main` and on manual dispatch.

---

## Accessibility

This project follows WCAG 2.1 guidelines:

- **Skip-to-content link** — Keyboard users can skip navigation and jump to main content
- **ARIA labels** — All interactive elements, sections, and navigation have descriptive labels
- **Focus indicators** — Visible `:focus-visible` outlines on all interactive elements
- **Reduced motion** — Animations disabled for users with `prefers-reduced-motion: reduce`
- **Screen reader support** — Typing effect uses `aria-live` region for announcements
- **Semantic HTML** — `<main>` landmark, `<nav>` with labels, `<section>` with `aria-label`
- **Keyboard navigation** — Focus trap on login overlay, all controls keyboard-accessible

---

## Performance

- **Consolidated scroll handlers** — Single `onScroll` function handles nav dots, back-to-top, and theme visibility
- **Mobile optimization** — `backdrop-filter: blur()` disabled on mobile for GPU performance
- **Hover-only animations** — `will-change` only applied on hover to reduce memory pressure
- **Passive scroll listeners** — `{ passive: true }` for smoother scrolling
- **Font loading** — `display=swap` prevents invisible text during font load
- **Lazy animations** — Fade-in effects skipped when `prefers-reduced-motion` is active

---

## Contact

- **Email:** [gautam958@gmail.com](mailto:gautam958@gmail.com)
- **LinkedIn:** [linkedin.com/in/gautam958](https://www.linkedin.com/in/gautam958)
- **GitHub:** [github.com/gautam958](https://github.com/gautam958)
- **WhatsApp (HK):** [+852 5345 1910](https://wa.me/85253451910)
- **WhatsApp (India):** [+91 96509 79813](https://wa.me/919650979813)
- **Website:** [gautam958web.in](https://www.gautam958web.in)

📍 Tung Chung, Hong Kong

---

**Made with ❤️ by [Gautam Kumar](https://www.linkedin.com/in/gautam958)**
