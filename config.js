/**
 * Google Sign-In Configuration for Visitors Dashboard
 *
 * Setup instructions:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create or select a project
 * 3. Go to APIs & Services > Credentials
 * 4. Create Credentials > OAuth client ID (Web application)
 * 5. Add https://gautam958web.in to Authorized JavaScript origins
 * 6. Add https://gautam958web.in/visitors.html to Authorized redirect URIs
 * 7. Copy the Client ID below
 *
 * Then add your allowed Google account emails to ALLOWED_EMAILS below.
 */
var GOOGLE_CLIENT_ID =
  "529204997074-5upkbf81uq05ueef0ai1ik606vpmeg6p.apps.googleusercontent.com";

/**
 * List of Google account emails allowed to access the visitor dashboard.
 * Only these emails can log in. All others are denied.
 */
var ALLOWED_EMAILS = [
  "gautam958@gmail.com",
  "rupsa958@gmail.com",
  // Add more allowed emails as needed
];
