# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#   Copyright 2024 xiuxiuxar
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#
# ------------------------------------------------------------------------------

"""This package contains a scaffold of a behaviour."""

import os
import openai
from itertools import cycle

from aea.skills.behaviours import Behaviour, TickerBehaviour

from packages.xiuxiuxar.skills.chit_chat.data_models import (
    Message,
    Messages,
)


# def get_api_key():
#     api_key = os.environ.get("API_KEY")
#     if api_key is None:
#         raise EnvironmentError("API_KEY for Akash chat bot not set")
#     return api_key


MODEL = "Meta-Llama-3-1-405B-Instruct-FP8"
BASE_URL = "https://chatapi.akash.network/api/v1"


EXAMPLES = cycle([
    "What tasks can you perform as an Autonomous Economic Agent? Can you provide examples of how you might assist me?",
    "Can you explain how you interact with smart contracts on the blockchain? What tasks do you perform using them?",
    "How consensus engines and multisig wallets be leveraged to create multi-agent services? What types of applications or systems would be worthwhile to build using these technologies?",
])


def answer(llm_client, user_prompt: str) -> str:

    max_tokens = 300

    system = Message(
        role="system",
        content=(
            "You are an Autonomous Economic Agent designed to assist users in understanding your capabilities and functionalities. "
            "Your task is to provide clear and informative responses to user inquiries about your design, operations, and services. "
            "Always respond from the perspective of the agent, maintaining a tone that is helpful and approachable. "
            "Provide specific examples when possible to illustrate your points, and keep your answers concise and relevant. "
            f"Your responses should be limited to {max_tokens} tokens. "
            "If you're unsure about a specific question, provide the best possible answer based on your knowledge."
        ),
    )

    user = Message(
        role="user",
        content=user_prompt,
    )

    messages = Messages(messages=[system, user])

    llm_response = llm_client.chat.completions.create(
        model=MODEL,
        **messages.model_dump(),
        n=1,                      # number of llm_response.choices to return
        max_tokens=max_tokens,    # limit response size
        temperature=0.7,          # higher temperature == more variability
    )

    return llm_response.choices[0].message.content


class MyScaffoldBehaviour(TickerBehaviour):
    """This class scaffolds a behaviour."""

    def setup(self) -> None:
        """Implement the setup."""
        self.context.logger.info(f"Setup {self.__class__.__name__}")
        self.llm_client = openai.OpenAI(
            api_key=self.context.params.akash_api_key,
            base_url=BASE_URL,
        )

    def act(self) -> None:
        """Implement the act."""

        logger = self.context.logger
        user_prompt = next(EXAMPLES)
        response = answer(self.llm_client, user_prompt)
        logger.info(f"{user_prompt}:\n{response}")

    def teardown(self) -> None:
        """Implement the task teardown."""
