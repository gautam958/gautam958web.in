# gautam958web.in

Personal portfolio website of Gautam Kumar.

## Deployment

This is a static website deployed to **Azure Static Web Apps**.

### Setup Instructions for Azure Static Web Apps

1. Create an Azure Static Web App in the Azure Portal
2. Connect it to this GitHub repository
3. Add the following secret to your GitHub repository:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN` - Get this from your Azure Static Web App settings
4. Push to `main` branch to trigger deployment

The GitHub Actions workflow (`.github/workflows/main_gautam958web.yml`) will automatically deploy on every push to `main`.

## Project Structure

```
/
├── index.html      # Main HTML file
├── assets/         # CSS, JS, images, and vendor files
├── favicon.ico     # Site favicon
└── README.md       # This file
```

## Local Development

Simply open `index.html` in a web browser, or use any static file server:

```bash
npx serve .
# or
python -m http.server 8000
```

## Contact

- Email: gautam958@gmail.com
- Phone (India): (91) 9650979813
- Phone (Hong Kong): (852) 53451910 
