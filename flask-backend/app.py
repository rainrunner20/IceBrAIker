"""HTTP boundary for profile summaries. External providers load only on a request."""

import os
from collections.abc import Callable

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import RequestEntityTooLarge

from validation import normalize_profile_name
from demo import sample_profile


def _generate_profile(name: str):
    # Keep provider imports out of app startup so health checks and tests are offline.
    from ice_breaker import ice_break_with

    return ice_break_with(name=name)


def create_app(processor: Callable | None = None) -> Flask:
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024

    allowed_origins = [
        origin.strip()
        for origin in os.getenv("ICEBRAIKER_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]
    CORS(app, resources={r"/(process|demo)": {"origins": allowed_origins}})
    generate = processor if processor is not None else _generate_profile

    @app.get("/health")
    def health():
        # A liveness check; provider credentials and availability are checked elsewhere.
        return jsonify(status="ok")

    @app.errorhandler(RequestEntityTooLarge)
    def body_too_large(_error):
        return jsonify(error="Request body is too large"), 413

    @app.get("/demo")
    def demo():
        # The demo deliberately describes a fictional person, never the supplied name.
        return jsonify(sample_profile())

    @app.post("/process")
    def process():
        if not request.is_json:
            return jsonify(error="Content-Type must be application/json"), 415

        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return jsonify(error="Request body must be a JSON object"), 400

        try:
            name = normalize_profile_name(payload.get("name"))
        except ValueError as exc:
            return jsonify(error=str(exc)), 400

        try:
            summary, interests, ice_breakers, picture_url = generate(name)
            return jsonify(
                summary_and_facts=summary.to_dict(),
                interests=interests.to_dict(),
                ice_breakers=ice_breakers.to_dict(),
                picture_url=picture_url,
            )
        except Exception:
            # Avoid exposing provider failures, API keys, or personal profile data.
            app.logger.exception("Profile generation failed")
            return jsonify(error="Profile generation is temporarily unavailable"), 502

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
