export const rfqDataMock = [
    {
        "amount_in": 10.0,
        "ask_token_id": "DAI",
        "bid_token_id": "WBTC",
        "buyer_wallet_address": "0x789...",
        "chain_id": 56,
        "expiration_time": 157
    },
    {
        "amount_in": 1.4,
        "ask_token_id": "USDT",
        "bid_token_id": "WBTC",
        "buyer_wallet_address": "0xabc...",
        "chain_id": 56,
        "expiration_time": 2899
    },
    {
        "amount_in": 5.0,
        "ask_token_id": "DAI",
        "bid_token_id": "WBTC",
        "buyer_wallet_address": "0xabc...",
        "chain_id": 1,
        "expiration_time": 1138
    },
    {
        "amount_in": 2.0,
        "ask_token_id": "WETH",
        "bid_token_id": "DAI",
        "buyer_wallet_address": "0xabc...",
        "chain_id": 1,
        "expiration_time": 2199
    }
]

export const formConfigMock = {
    "form_name": "requestForQuote",
    "endpoint": "rfq",
    "default_expiration_time": 30,
    "fields": [
        {
            "name": "amount_in",
            "label": "Amount In",
            "type": "number",
            "placeholder": "Enter Amount",
            "min": 0.01,
            "max": 1000
        },
        {
            "name": "ask_token_id",
            "label": "Ask",
            "type": "select",
            "options": [
                { "label": "WETH", "value": "WETH" },
                { "label": "WBTC", "value": "WBTC" },
                { "label": "DAI", "value": "DAI" },
                { "label": "USDC", "value": "USDC" }
            ]
        },
        {
            "name": "bid_token_id",
            "label": "Bid",
            "type": "select",
            "options": [
                { "label": "WETH", "value": "WETH" },
                { "label": "WBTC", "value": "WBTC" },
                { "label": "DAI", "value": "DAI" },
                { "label": "USDC", "value": "USDC" }
            ]
        }
    ]
}