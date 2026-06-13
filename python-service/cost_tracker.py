MODEL_PRICING = {
    "claude-haiku-4-5-20251001": {"input": 0.80, "output": 4.00},
    "claude-sonnet-4-6": {"input": 3.00, "output": 15.00},
    "claude-opus-4-6": {"input": 15.00, "output": 75.00},
}


def calculate_cost(model: str, tokens_input: int, tokens_output: int) -> float:
    pricing = MODEL_PRICING.get(model, MODEL_PRICING["claude-haiku-4-5-20251001"])
    cost = (tokens_input / 1_000_000 * pricing["input"]) + (
        tokens_output / 1_000_000 * pricing["output"]
    )
    return round(cost, 6)
