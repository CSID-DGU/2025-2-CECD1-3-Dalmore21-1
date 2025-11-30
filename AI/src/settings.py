"""애플리케이션 설정."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """애플리케이션 설정."""
    
    # API 설정
    api_title: str = "Simulation Chatbot API"
    api_version: str = "1.0.0"
    api_description: str = "CPU Architecture & Semiconductor Fab Simulation Chatbot"
    
    # 서버 설정
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    
    # LLM 설정 (향후 확장용)
    llm_provider: Optional[str] = None
    llm_api_key: Optional[str] = None
    llm_model: Optional[str] = None
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()

