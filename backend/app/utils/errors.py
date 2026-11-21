"""Application-level API exceptions."""


class ApiError(Exception):
    """An expected client error with a safe public message."""

    def __init__(self, message, code="invalid_request", status_code=400):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
