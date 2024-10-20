<script>
    import { onMount } from "svelte";
    import { ethers } from "ethers";
    import { Client } from "@xmtp/xmtp-js";
    import { provider, signerAddress } from "ethers-svelte";

    let messages = [];
    let xmtpClient;
    let inputMessage = "";
    let conversation;

    // Function to initialize the XMTP client
    async function initXMTP() {
        try {
            // Prompt the user to connect their Ethereum wallet
            if ($signerAddress) {
                const sg = await $provider.getSigner();
                console.log("signer", sg);

                // Initialize XMTP client on Goerli testnet or Mainnet
                xmtpClient = await Client.create(sg, { env: "dev" }); // Use { env: 'dev' } for Goerli testnet, omit for Mainnet
                console.log("xmtpClient", xmtpClient);
                console.log("Client created", xmtpClient.address);

                //gm.xmtp.eth (0x937C0d4a6294cdfa575de17382c7076b579DC176) env:production
                // bot address
                const WALLET_TO = "0xBBb9b79E851e9Df0BbD4e293d8E2b2ccF44111D3";
                const isOnProdNetwork = await xmtpClient.canMessage(WALLET_TO);
                console.log("Can message: " + isOnProdNetwork);

                // Subscribe to a conversation (replace with peer address)
                conversation =
                    await xmtpClient.conversations.newConversation(WALLET_TO);
                console.log("convo:", conversation);

                // Stream messages from the conversation
                streamMessages();
            } else {
                console.error("Please install MetaMask!");
            }
        } catch (error) {
            console.error("Error initializing XMTP:", error);
        }
    }

    // Function to stream messages from the conversation
    async function streamMessages() {
        try {
            for await (const message of await conversation.streamMessages()) {
                messages = [
                    ...messages,
                    { sender: message.senderAddress, content: message.content },
                ];
            }
        } catch (error) {
            console.error("Error streaming messages:", error);
        }
    }

    // Function to send a message (Assumes you have a conversation initialized)
    async function sendMessage() {
        if (conversation && inputMessage) {
            try {
                await conversation.send(inputMessage);
                messages = [
                    ...messages,
                    { sender: "Me", content: inputMessage },
                ];
                inputMessage = ""; // Clear the input field
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
    }
</script>

<!-- Simple UI for sending and receiving messages -->
<div class="chat">
    {#if $signerAddress}
        <div>
            <button class="btn mb-2" on:click={initXMTP}
                >Connect Personal XTMP Inbox</button
            >
        </div>
    {/if}
    <div class="message-list">
        {#each messages as message (message.content)}
            <div>
                <strong>{message.sender}</strong>: {message.content}
            </div>
        {/each}
    </div>
</div>

<style>
    .chat {
        height: 100%;
    }
    .message-list {
        height: 100%;
        max-height: 300px;
        overflow-y: scroll;
        margin-bottom: 10px;
        padding: 10px;
        border: 1px solid #ccc;
    }
    input {
        width: 80%;
        padding: 10px;
        margin-right: 10px;
        background: black;
    }
</style>
