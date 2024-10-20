import os
import json
import time
import asyncio
import websockets
from pathlib import Path
from dotenv import load_dotenv
from eth_account import Account


# Load environment variables from .env file
load_dotenv(Path(__file__).parent.parent / ".env")


def derive_public_address(private_key):
    account = Account.from_key(private_key)
    return account.address


async def subscribe_agent():
    uri = "ws://localhost:8080"
    async with websockets.connect(uri) as websocket:
        agent_pk = os.environ.get("AGENT_PK")
        assert agent_pk is not None
        data = {"type": "subscribe", "privateKey": agent_pk}
        await websocket.send(json.dumps(data))

        agent_address = derive_public_address(agent_pk)
        while True:
            message = await websocket.recv()
            message_data = json.loads(message)
            print(f"Agent received: {message_data}")

            # Echo back the received message to the user
            if 'content' in message_data:
                echo_data = {
                    "type": "send_message",
                    "to": message_data['from'],
                    "from": agent_address,
                    "content": message_data['content'],
                }
                await websocket.send(json.dumps(echo_data))
                print(f"Agent echoed: {message_data['content']}")


async def subscribe_user():
    uri = "ws://localhost:8080"
    async with websockets.connect(uri) as websocket:
        user_pk = os.environ.get("USER_PK")
        assert user_pk is not None

        data = {"type": "subscribe", "privateKey": user_pk}
        await websocket.send(json.dumps(data))

        user_address = derive_public_address(user_pk)

        # Use a background task to send "Hello" every X seconds
        async def send_hello():
            to_address = "0xd102213337C842cdF5Ec39637cC5DbeE609B126c"
            while True:
                message_data = {
                    "type": "send_message",
                    "to": to_address,
                    "from": user_address,
                    "content": "Hello"
                }
                await websocket.send(json.dumps(message_data))
                print("User sent: Hello")
                time.sleep(5)

        # Start the send_hello task
        asyncio.create_task(send_hello())

        while True:
            message = await websocket.recv()
            message_data = json.loads(message)
            print(f"User received: {message_data}")


async def main():
    # Run agent and user processes concurrently
    await asyncio.gather(
        subscribe_agent(),
        subscribe_user()
    )

if __name__ == "__main__":
    asyncio.run(main())
