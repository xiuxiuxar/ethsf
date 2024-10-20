# Conversation Station

**Conversation Station** is a platform that facilitates communication between users and autonomous economic agents via an XMTP server, enabling secure and efficient interactions. The application provides users the ability to inquire about the agent's functionalities, configurations, and to request updates to its settings.

## Features

- **Secure Communication**: Utilizes XMTP (Extensible Messaging and Presence Protocol) for secure messaging between users and agents.
- **Inquiries about Functionality**: Users can ask the agent about its capabilities, roles, and the tasks it can perform.
- **Configuration Management**: Users can request updates to the agent’s configuration, allowing for dynamic adjustments based on user needs.
- **Agent Subscriptions**: Automatically subscribe users to agents for real-time updates and interactions.



## Table of Contents

- [Conversation Station](#conversation-station)
  - [Features](#features)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Installation and Setup for Development](#installation-and-setup-for-development)
  - [Running the agent](#running-the-agent)
  - [License](#license)

## Getting Started

### Installation and Setup for Development

If you're looking to contribute or develop with `conversation_station`, get the source code and set up the environment:

```shell
git clone https://github.com/xiuxiuxar/conversation_station --recurse-submodules
cd conversation_station
make install
```

## Running the agent


```bash
./scripts/run_single_agent.sh xiuxiuxar/chit_chat
```

## License

This project is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)

