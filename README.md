# 🌐 gautam958web.in

> Personal portfolio website of **Gautam Kumar** — Staff Engineer, Full-Stack Developer & AI Practitioner based in Hong Kong.

![Website](https://img.shields.io/badge/Website-gautam958web.in-blue?style=for-the-badge&logo=azure&logoColor=white)
![Deployed](https://img.shields.io/badge/Deployed-Azure%20Static%20Web%20Apps-green?style=for-the-badge)

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
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

### 🌓 **Theme Switcher**
- **Dark Blue** (default) — Professional dark theme
- **Light** — Clean, bright interface
- **Red Dark** — Bold, modern aesthetic
- Theme preference saved to localStorage

### 📱 **Navigation**
- Fixed navigation dots for quick section jumping
- Active state tracking based on scroll position
- Smooth scroll to sections

### 🎯 **Sections**
| Section | Description |
|---------|-------------|
| **Hero** | Profile image, name, title, typing animation, and CTA buttons |
| **About** | Professional summary |
| **Skills** | 6 categorized skill groups with hover animations + stats counters |
| **Experience** | Interactive timeline with 5 career positions |
| **Portfolio** | 24 enterprise projects with category filtering |
| **Education** | Degrees and Microsoft certifications |
| **Contact** | Email, LinkedIn, WhatsApp (HK & IN), Phone |

### 📂 **Portfolio Highlights**
- **Azure AI** — Document Intelligence, ChatGPT integration, AI automation
- **Full Stack** — Trading platforms, CRM, client portals, billing systems
- **WMS & Logistics** — Warehouse management for A.S. Watson across 4 countries
- **Enterprise** — SAP integration, supply chain, manufacturing, government portals

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Styling** | CSS Custom Properties, Flexbox, CSS Grid |
| **Fonts** | Google Fonts (Manrope, Playfair Display) |
| **Hosting** | Azure Static Web Apps |
| **CI/CD** | GitHub Actions |
| **Version Control** | Git & GitHub |

---

## Project Structure

```
/
├── index.html                         # Single-page portfolio (HTML + CSS + JS)
├── assets/
│   ├── css/style.css                  # (Styles inline in HTML)
│   ├── js/main.js                     # (Scripts inline in HTML)
│   ├── CurriculumVitaeGautamDetails.docx  # Source CV
│   └── img/
│       ├── *.jpg                      # Profile & team photos
│       ├── *.ico                      # Favicons
│       └── favicon_io/site.webmanifest
├── .github/workflows/
│   └── main_gautam958web.yml          # Azure deployment workflow
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

## Contact

- **Email:** [gautam958@gmail.com](mailto:gautam958@gmail.com)
- **LinkedIn:** [linkedin.com/in/gautam958](https://www.linkedin.com/in/gautam958)
- **WhatsApp (HK):** [+852 5345 1910](https://wa.me/85253451910)
- **WhatsApp (India):** [+91 96509 79813](https://wa.me/919650979813)
- **Phone (HK):** [+852 5345 1910](tel:+85253451910)
- **Website:** [gautam958web.in](https://www.gautam958web.in)

📍 Tung Chung, Hong Kong

---

**Made with ❤️ by [Gautam Kumar](https://www.linkedin.com/in/gautam958)**
