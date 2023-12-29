const { google } = require("googleapis");
const VACCATION_PERIOD = 3*24*60*60*1000

const makeEmail = (sender) => {
    const replyMessage = [
      `To:${sender}`,  
      "Subject: This is an Automated Reply",
      `Content-Type: text/plain; charset="UTF-8"`,
      "",
      " Hey thanks for reaching out, this is an automated reply. I'm on a vaccation will connect with you soon."
    ];
    return Buffer.from(replyMessage.join('\r\n')).toString('base64')
}

const addLabel = async(auth,sentMessage) => {
    const gmail = google.gmail({version: "v1",auth: auth})
    const labelToAdd = "Automated-Reply"
    try{
        const response = await gmail.users.labels.list({
            userId: "me"
        })
        const labels = response.data.labels
        let labelExists = false
        let labelId
        labels.forEach(label => {
            if(label.name === labelToAdd){
                labelExists = true
                labelId = label.id
            }
        })
        // If label doesn't exist create label
        if(!labelExists){
            const newLabel = await gmail.users.labels.create({
              userId: "me",
              resource: {
                addLabelIds: [labelToAdd]
              },
            });
            labelId = newLabel.data.id
        }
        // Adding the label to the replied mail
        await gmail.users.messages.modify({
            userId: "me",
            id: sentMessage.data.id,
            resource: {
                addLabelIds: [labelId]
            }
        })
        console.log("Mail sent and added under the label : ",labelToAdd)
    } catch(error){
        console.log(error)
    }
}

const checkandSendEmail = async (auth) => {
    const gmail = google.gmail({version: "v1",auth: auth})
    try {
        const response = await gmail.users.threads.list({
          userId: "me",
          labelIds: ["UNREAD","INBOX"],
          maxResults: 10
        });
        const threads = response.data.threads

        if(!threads)
            return

        threads.forEach(async(thread) => {
            const threadId = thread.id;
            const messagesResponse = await gmail.users.threads.get({
                userId: 'me',
                id: threadId
            })
            const messages = messagesResponse.data.messages
            const firstMessage = messages[0]
            // Email should be in category personal and not a promotion
            if(!firstMessage.labelIds.includes("CATEGORY_PROMOTIONS") && firstMessage.labelIds.includes("CATEGORY_PERSONAL")){
                let previouslyReplied = false
                let senderEmail = []
                for(let i = 0;i< messages.length;i++){
                    messages[i].payload.headers.forEach(header => {
                        if(header.name === "From")
                            senderEmail.push(header.value)
                    })
                    if(senderEmail.length >= 2 && senderEmail[senderEmail.length-1] !== senderEmail[senderEmail.length-2])
                    {
                        previouslyReplied = true
                        break
                    }
                }
                    // If not replied previously send a mail
                if(!previouslyReplied){
                    const fromAddress = senderEmail[0].trim().match(/<([^>]+)>/)[1];
                    console.log("Detected a mail from ",fromAddress)
                    const reply = {
                        raw: makeEmail(fromAddress),
                        threadId: threadId
                    }
                    const sentMessage = await gmail.users.messages.send({
                        userId: "me",
                        resource: reply
                    })
                    // Continue with adding the label
                    addLabel(auth,sentMessage)
                }
            }
       });
    } catch(error) {
        console.log(error);
    }
};


const respondToEmails = async (auth) => {
  let interval = Math.floor(Math.random() * (120 - 45 + 1)) + 45;
  interval *= 1000;
  checkandSendEmail(auth)
  const intervalId = setInterval(() => {
    checkandSendEmail(auth)
  },interval)
  setTimeout(() => {
    clearInterval(intervalId)
  },VACCATION_PERIOD)
};

module.exports = respondToEmails;