from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    mongo_uri: str = "mongodb://localhost:27017"
    db_name: str = "pastebin_db"
    collection_name: str = "pastes"

    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
