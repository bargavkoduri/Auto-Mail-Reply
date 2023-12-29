const { google } = require('googleapis')
const {OAuth2} = google.auth
const express = require('express')
const app = express()
const path = require("path");
const RespondToMails = require("./email")
const {CLIENT_ID,PORT,CLIENT_SECRET,REDIRECT_URI} = require("./constants")

app.use(express.static(path.join(__dirname,'public')))

app.get("/",(req,res) => {
    res.sendFile(path.join(__dirname,'public','index.html'))
})

app.get("/authenticate/google/callback",async (req,res) => {
    const {code} = req.query
    const Client = new OAuth2({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        redirectUri: REDIRECT_URI
    })
    const { tokens } = await Client.getToken(code)
    Client.setCredentials({access_token: tokens.access_token,refresh_token: tokens.refresh_token})
    RespondToMails(Client)
    res.send("App will be monitoring your gmail for new mails for 3 days")
});

app.listen(PORT,() => {
    console.log("App running on PORT ",PORT)
})