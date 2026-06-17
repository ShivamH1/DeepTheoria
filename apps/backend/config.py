from dotenv import find_dotenv, load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv(find_dotenv())


class Settings(BaseSettings):
    MISTRAL_API_KEY: str
    MISTRAL_MODEL: str
    TAVILY_API_KEY: str

    model_config = SettingsConfigDict(
        env_file=find_dotenv() or ".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
