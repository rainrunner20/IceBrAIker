"""API contract tests. Provider calls are replaced by a deterministic local stub."""

import unittest

from app import create_app
from validation import normalize_profile_name


class FakeResult:
    def __init__(self, data):
        self.data = data

    def to_dict(self):
        return self.data


def profile_stub(name):
    return (
        FakeResult({"summary": f"Profile for {name}", "facts": ["Works in software"]}),
        FakeResult({"topics_of_interest": ["Engineering"]}),
        FakeResult({"ice_breakers": ["What are you building?"]}),
        None,
    )


class ValidationTests(unittest.TestCase):
    def test_normalizes_whitespace(self):
        self.assertEqual(normalize_profile_name("  Ada   Lovelace  "), "Ada Lovelace")

    def test_rejects_invalid_names(self):
        for value in (None, 42, "", "A", "a" * 101):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    normalize_profile_name(value)


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app(processor=profile_stub)
        self.client = self.app.test_client()

    def test_health_does_not_call_ai_provider(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"status": "ok"})

    def test_returns_existing_frontend_response_contract(self):
        response = self.client.post("/process", json={"name": "  Ada  Lovelace  "})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {
            "summary_and_facts": {"summary": "Profile for Ada Lovelace", "facts": ["Works in software"]},
            "interests": {"topics_of_interest": ["Engineering"]},
            "ice_breakers": {"ice_breakers": ["What are you building?"]},
            "picture_url": None,
        })

    def test_rejects_invalid_json_and_missing_name(self):
        cases = [
            self.client.post("/process", data="{", content_type="application/json"),
            self.client.post("/process", json=[]),
            self.client.post("/process", json={}),
            self.client.post("/process", json={"name": " "}),
        ]
        for response in cases:
            with self.subTest(body=response.json):
                self.assertEqual(response.status_code, 400)
                self.assertIn("error", response.json)

    def test_enforces_json_content_type(self):
        response = self.client.post("/process", data="name=Ada", content_type="application/x-www-form-urlencoded")
        self.assertEqual(response.status_code, 415)

    def test_limits_request_size(self):
        response = self.client.post("/process", data="x" * (16 * 1024 + 1), content_type="application/json")
        self.assertEqual(response.status_code, 413)

    def test_limits_cross_origin_access(self):
        trusted = self.client.post(
            "/process", json={"name": "Ada"}, headers={"Origin": "http://localhost:3000"}
        )
        untrusted = self.client.post(
            "/process", json={"name": "Ada"}, headers={"Origin": "https://untrusted.example"}
        )
        self.assertEqual(trusted.headers.get("Access-Control-Allow-Origin"), "http://localhost:3000")
        self.assertIsNone(untrusted.headers.get("Access-Control-Allow-Origin"))

    def test_provider_failure_uses_generic_error_message(self):
        def fail(_name):
            raise RuntimeError("internal provider secret")

        failing_app = create_app(processor=fail)
        failing_app.logger.disabled = True
        response = failing_app.test_client().post("/process", json={"name": "Ada Lovelace"})
        self.assertEqual(response.status_code, 502)
        self.assertNotIn("secret", response.get_data(as_text=True))


if __name__ == "__main__":
    unittest.main()
