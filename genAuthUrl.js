const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const {CLIENT_ID,CLIENT_SECRET,REDIRECT_URI} = require("./constants")

const client = new OAuth2({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI
})

const authUrl = client.generateAuthUrl({
  access_type: "offline",
  scope: [
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/gmail.modify",
  ],
  response_type: "code",
});

// Url for google authentication after which google redirects back to call back uri mentioned
console.log(authUrl);