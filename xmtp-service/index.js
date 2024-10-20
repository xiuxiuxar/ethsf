const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Client } = require('@xmtp/xmtp-js');
const { ethers } = require('ethers');
const WebSocket = require('ws');

// WebSocket Server Setup
const wss = new WebSocket.Server({ port: 8080 });
let connectedClients = {};
const conversationsMap = {};

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
                    // Check if a conversation already exists
                    let conversation;
                    if (conversationsMap[fromAddress] && conversationsMap[fromAddress][toAddress]) {
                        conversation = conversationsMap[fromAddress][toAddress];
                    } else {
                        // Open a new conversation
                        conversation = await senderData.xmtpClient.conversations.newConversation(toAddress);
                        if (!conversationsMap[fromAddress]) {
                            conversationsMap[fromAddress] = {};
                        }
                        conversationsMap[fromAddress][toAddress] = conversation;
                        console.log(`New conversation started between ${fromAddress} and ${conversation.peerAddress}`)
                    }

                    // Send the message through the conversation
                    const message = await conversation.send(content);
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
        const { ws: senderWs, xmtpClient } = clientData;

        try {
            // Listen for all new messages across all conversations
            for await (const message of await xmtpClient.conversations.streamAllMessages()) {
                const sender = message.senderAddress;  // === publicAddress
                const recipient = message.conversation.peerAddress

                if (sender === recipient) {
                    // This message was sent from me
                    continue;
                }

                console.log(`Received message from ${sender} for ${recipient}: ${message.content}`);

                // Guard clause for missing recipient, return to sender
                if (!(recipient in connectedClients)) {
                    console.error(`Error: Recipient ${recipient} not found in connectedClients.`);
                    senderWs.send(JSON.stringify({
                        error: `Recipient ${recipient} is not in connected clients.`,
                    }));
                    return;
                }

                // Forward message to recipient
                const { ws: recipientWs, xmtpClient } = connectedClients[recipient]
                if (recipientWs.readyState === WebSocket.OPEN) {
                    recipientWs.send(JSON.stringify({
                        from: sender,
                        to: recipient,
                        content: message.content,
                    }));
                } else {
                    console.error(`WebSocket not open for recipient: ${recipient}`);
                    senderWs.send(JSON.stringify({
                        error: `Recipient ${recipient} websocket connection not open.`,
                    }));
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
