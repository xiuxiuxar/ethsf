const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Client } = require('@xmtp/xmtp-js');
const { ethers } = require('ethers');
const WebSocket = require('ws');

// WebSocket Server Setup
const wss = new WebSocket.Server({ port: 8080 });
let connectedClients = {};

// Connect to XMTP
async function connectToXMTP(privateKey) {
    const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
    const wallet = new ethers.Wallet(privateKey).connect(provider);
    const publicAddress = wallet.address;
    const xmtpClient = await Client.create(wallet);
    console.log('Agent connected to XMTP');
    return { xmtpClient, publicAddress };
}

// Handle WebSocket Connections
wss.on('connection', async (ws) => {
    console.log('Client connected to WebSocket');

    ws.on('message', async (message) => {
        const msgData = JSON.parse(message);

        // Handle Subscription (Register on XMTP)
        if (msgData.type === 'subscribe') {
            const privateKey = msgData.privateKey;

            try {
                const { xmtpClient, publicAddress } = await connectToXMTP(privateKey);
                connectedClients[publicAddress] = { ws, xmtpClient };
                console.log(`Agent ${publicAddress} subscribed.`);
                ws.send(JSON.stringify({ status: 'subscribed', publicAddress }));
            } catch (error) {
                console.error('Error connecting to XMTP:', error);
                ws.send(JSON.stringify({ status: 'error', message: 'Failed to subscribe to XMTP.' }));
            }
        }

        // Handle sending a message
        else if (msgData.type === 'send_message') {
            const toAddress = msgData.to;
            const fromAddress = msgData.from;
            const content = msgData.content;
            const senderData = connectedClients[fromAddress];

            if (senderData && senderData.xmtpClient) {
                try {
                    // Open a conversation with the recipient
                    const conversation = await senderData.xmtpClient.conversations.newConversation(toAddress);
                    const message = await conversation.send(content);
                    // console.dir(message, { depth: 1 });
                    console.log(`Sending message from ${fromAddress} to ${toAddress}: ${message.content}`);
                } catch (error) {
                    console.error('Error sending message:', error);
                    ws.send(JSON.stringify({ status: 'error', message: 'Failed to send message.' }));
                }
            } else {
                ws.send(JSON.stringify({ status: 'error', message: 'Client not registered.' }));
            }
        }

        else {
            console.error('Invalid message type:', msgData);
        }
    });

    // Handle WebSocket closing
    ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
        // Clean up connectedClients object
        for (const [address, clientData] of Object.entries(connectedClients)) {
            if (clientData.ws === ws) {
                delete connectedClients[address];
                console.log(`Removed ${address} from connected clients`);
                break;
            }
        }
    });
});

// Listen for incoming XMTP messages and broadcast them to WebSocket clients
async function listenForMessages(publicAddress) {
    const clientData = connectedClients[publicAddress];
    if (clientData && clientData.xmtpClient) {
        const { ws, xmtpClient } = clientData;

        try {
            // Listen for all new messages across all conversations
            for await (const message of await xmtpClient.conversations.streamAllMessages()) {
                const sender = message.senderAddress;  // === publicAddress
                const recipient = message.conversation.peerAddress

                if (sender === recipient) {
                    // This message was sent from me
                    continue;
                }

                // console.dir(message, { depth: 1 });
                console.log(`Received message from ${sender} for ${recipient}: ${message.content}`);
                const { ws, xmtpClient } = connectedClients[recipient]
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        from: sender,
                        to: recipient,
                        content: message.content,
                    }));
                } else {
                    console.log(`WebSocket not open for recipient: ${recipient}`);
                }
            }
        } catch (error) {
            console.error('Error listening for messages:', error);
        }
    } else {
        console.error(`No client registered with publicAddress: ${publicAddress}`);
    }
}

// Call this function to listen for messages once an agent has subscribed
setInterval(() => {
    Object.keys(connectedClients).forEach(publicAddress => {
        listenForMessages(publicAddress);
    });
}, 5000);
