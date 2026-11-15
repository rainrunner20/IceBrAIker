"""Static demonstration profile; does not invoke scraping or an LLM."""

def sample_profile() -> dict:
    return {
        "source": "synthetic_demo",
        "display_name": "Jordan Parker (fictional)",
        "summary_and_facts": {
            "summary": (
                "Jordan is a fictional product engineer who enjoys designing accessible "
                "interfaces and talking through difficult trade-offs with teammates."
            ),
            "facts": [
                "Has a fictional side project that visualizes city transit data.",
                "Enjoys building small prototypes before committing to a larger feature.",
            ],
        },
        "interests": {"topics_of_interest": ["Accessibility", "City data", "Product engineering"]},
        "ice_breakers": {
            "ice_breakers": [
                "What trade-off was hardest in your latest prototype?",
                "If you could improve one part of the city commute, where would you start?",
            ]
        },
        "picture_url": None,
    }
