require('dotenv').config();
const express = require('express');
const { Client } = require('@xmtp/xmtp-js');
const { ethers } = require('ethers');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const wallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY);

let xmtpClient;

(async () => {
    xmtpClient = await Client.create(wallet);
    console.log("XMTP Client Initialized");
})();

// Endpoint to send a message
app.post('/send_message', async (req, res) => {
    const { recipient, message } = req.body;

    try {
        const conversation = await xmtpClient.conversations.newConversation(recipient);
        await conversation.send(message);
        res.status(200).json({ success: true, message: "Message sent successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to send message." });
    }
});

// Endpoint to fetch message history
app.get('/messages/:recipient', async (req, res) => {
    const recipient = req.params.recipient;

    try {
        const conversation = await xmtpClient.conversations.newConversation(recipient);
        const messages = await conversation.messages();

        const messageData = messages.map(msg => ({
            content: msg.content,
            sent: msg.sent.toISOString(),
            contentType: msg.contentType,
        }))
        res.status(200).json(messageData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch messages." });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

