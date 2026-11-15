"""Input validation for public API requests."""


def normalize_profile_name(value: object) -> str:
    if not isinstance(value, str):
        raise ValueError("name must be a string")

    name = " ".join(value.split())
    if not 2 <= len(name) <= 100:
        raise ValueError("name must contain between 2 and 100 characters")
    if not name.isprintable():
        raise ValueError("name contains unsupported characters")

    return name
