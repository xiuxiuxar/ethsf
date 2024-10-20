require('dotenv').config();
const express = require('express');
const http = require('http');
const { Client } = require('@xmtp/xmtp-js');
const { ethers } = require('ethers');
const bodyParser = require('body-parser');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
app.use(bodyParser.json());

app.use((req, res, next) => {
  if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
    return next();
  }
  return next();
});

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
        console.log(`Attempting to send message to ${recipient}`);
        const conversation = await xmtpClient.conversations.newConversation(recipient);
        console.log('Conversation created, sending message...');
        await conversation.send(message);
        console.log('Message sent successfully');
        res.status(200).json({ success: true, message: "Message sent successfully!" });
    } catch (err) {
        console.error('Error sending message:', err);
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

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      console.log('Received:', parsedMessage);
      
      if (parsedMessage.type === 'subscribe') {
        handleSubscription(ws, parsedMessage.data);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

async function handleSubscription(ws, address) {
  console.log(`Client subscribed to messages for ${address}`);
  
  try {
    console.log('Setting up conversation stream...');
    const stream = await xmtpClient.conversations.stream();
    console.log('Conversation stream set up successfully');

    for await (const conversation of stream) {
      console.log(`Received conversation with peer: ${conversation.peerAddress}`);
      
      if (conversation.peerAddress === address) {
        console.log(`Matching conversation found for ${address}`);
        

        console.log('Setting up message stream...');
        const messageStream = await conversation.streamMessages();
        console.log('Message stream set up successfully');

        for await (const message of messageStream) {
          console.log('Received new message:', message);
          const messageData = {
            sender: message.senderAddress,
            recipient: message.recipientAddress,
            content: message.content,
            sent: message.sent.toISOString(),
            contentType: message.contentType,
          };
          console.log('Sending message to WebSocket client:', messageData);
          ws.send(JSON.stringify(messageData));
        }
      }
    }
  } catch (error) {
    console.error('Error in subscription handler:', error);
    ws.send(JSON.stringify({ error: 'Subscription error occurred' }));
  }
}

// Start the server
const PORT = 5557;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

server.on('error', (e) => {
  console.error('Server error:', e);
});

wss.on('error', (e) => {
  console.error('WebSocket server error:', e);
});
