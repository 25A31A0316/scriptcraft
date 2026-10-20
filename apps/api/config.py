import os

class Settings:
    PROJECT_NAME: str = "ScriptCraft API"
    VERSION: str = "0.1.0"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./screenplay.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "scriptcraft-development-secret-key-32chars-min!")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    @property
    def CORS_ORIGINS(self) -> list[str]:
        raw = os.getenv("CORS_ORIGINS", "")
        base = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://25a31a0316.github.io",
        ]
        if raw:
            for item in raw.split(","):
                cleaned = item.strip()
                if cleaned and cleaned not in base:
                    base.append(cleaned)
        return base

settings = Settings()
