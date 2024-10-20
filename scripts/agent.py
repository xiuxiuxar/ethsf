import os
import json
import asyncio
import websockets

async def listen_for_messages():
    uri = "ws://localhost:8080"
    async with websockets.connect(uri) as websocket:
        agent_pk = os.environ.get("AGENT_PK")
        data = {"type": "subscribe", "privateKey": agent_pk}
        await websocket.send(json.dumps(data))
        while True:
            message = await websocket.recv()
            print(f"Received: {message}")


asyncio.get_event_loop().run_until_complete(listen_for_messages())
