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

        // Other message handling logic can be placed here
    });

    // Handle WebSocket closing
    ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
        // Optionally, clean up the connectedClients object
    });
});

// Listen for incoming XMTP messages and broadcast them to WebSocket clients
async function listenForMessages(agentId) {
    const clientData = connectedClients[agentId];
    if (clientData && clientData.xmtpClient) {
        const { ws, xmtpClient } = clientData;

        try {
            // Listen for all new messages across all conversations
            for await (const message of await xmtpClient.conversations.streamAllMessages()) {
                console.log(`Received message from ${message.senderAddress}: ${message.content}`);

                // Send message over WebSocket to the registered client
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ from: message.senderAddress, content: message.content }));
                }
            }
        } catch (error) {
            console.error('Error listening for messages:', error);
        }
    } else {
        console.error(`No client registered with agentId: ${agentId}`);
    }
}


// Call this function to listen for messages once an agent has subscribed
setInterval(() => {
    Object.keys(connectedClients).forEach(agentId => {
        listenForMessages(agentId);
    });
}, 5000);
