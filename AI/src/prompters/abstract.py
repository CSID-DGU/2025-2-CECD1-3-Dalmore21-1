"""Abstract base classes for prompters."""

from abc import ABC, abstractmethod
from typing import Dict, Any
from .schemas import SimulationRequest, SimulationResponse


class BasePrompter(ABC):
    """프롬프터 기본 클래스."""
    
    @abstractmethod
    async def extract_parameters(
        self, user_message: str, simulator_type: str
    ) -> Dict[str, Any]:
        """
        사용자 메시지에서 파라미터를 추출합니다.
        
        Args:
            user_message: 사용자 자연어 메시지
            simulator_type: 시뮬레이터 타입
            
        Returns:
            추출된 파라미터 딕셔너리
        """
        pass
    
    @abstractmethod
    async def generate_response(
        self, request: SimulationRequest
    ) -> SimulationResponse:
        """
        시뮬레이션 응답을 생성합니다.
        
        Args:
            request: 시뮬레이션 요청
            
        Returns:
            시뮬레이션 응답
        """
        pass

