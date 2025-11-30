"""API 테스트 스크립트 예시."""

import requests
import json

BASE_URL = "http://localhost:8000"


def test_cpu_simulation():
    """CPU 아키텍처 시뮬레이터 테스트."""
    print("=" * 60)
    print("CPU 아키텍처 시뮬레이터 테스트")
    print("=" * 60)
    
    url = f"{BASE_URL}/api/v1/simulate/"
    payload = {
        "simulator_type": "cpu_architecture",
        "user_message": "4코어 CPU, 3.2GHz 클럭 주파수, L1 캐시 32KB, L2 캐시 256KB로 시뮬레이션 해줘"
    }
    
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print("\n응답:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    print("\n")


def test_fab_simulation():
    """반도체 파브 시뮬레이터 테스트."""
    print("=" * 60)
    print("반도체 파브 시뮬레이터 테스트")
    print("=" * 60)
    
    url = f"{BASE_URL}/api/v1/simulate/"
    payload = {
        "simulator_type": "semiconductor_fab",
        "user_message": "7nm 공정, EUV 노광, 시간당 100개 웨이퍼 처리량으로 수율 시뮬레이션 해줘"
    }
    
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print("\n응답:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    print("\n")


def test_get_simulator_types():
    """시뮬레이터 타입 조회 테스트."""
    print("=" * 60)
    print("시뮬레이터 타입 조회")
    print("=" * 60)
    
    url = f"{BASE_URL}/api/v1/simulate/types"
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print("\n응답:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    print("\n")


def test_health_check():
    """헬스 체크 테스트."""
    print("=" * 60)
    print("헬스 체크")
    print("=" * 60)
    
    url = f"{BASE_URL}/health"
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print(f"응답: {response.json()}")
    print("\n")


if __name__ == "__main__":
    try:
        # 헬스 체크
        test_health_check()
        
        # 시뮬레이터 타입 조회
        test_get_simulator_types()
        
        # CPU 시뮬레이터 테스트
        test_cpu_simulation()
        
        # 파브 시뮬레이터 테스트
        test_fab_simulation()
        
    except requests.exceptions.ConnectionError:
        print("❌ 서버에 연결할 수 없습니다.")
        print("서버가 실행 중인지 확인하세요: python -m src.main")
    except Exception as e:
        print(f"❌ 오류 발생: {e}")

