# Simulation Chatbot API

CPU 아키텍처 및 캐시 시뮬레이터, 반도체 파브 및 수율 시뮬레이터를 위한 챗봇 API입니다.

## 기능

- **CPU Architecture & Cache Simulator**: CPU 아키텍처 및 캐시 성능 시뮬레이션
- **Advanced Semiconductor Fab & Yield Simulator**: 반도체 파브 공정 및 수율 시뮬레이션
- 자연어 기반 파라미터 추출 및 시뮬레이션 실행

## 설치

```bash
pip install -r requirements.txt
```

## 실행

```bash
# 개발 모드
python -m src.main

# 또는 uvicorn 직접 실행
uvicorn src.main:app --reload
```

서버는 기본적으로 `http://localhost:8000`에서 실행됩니다.

## API 엔드포인트

### 시뮬레이션 실행

```bash
POST /api/v1/simulate/
```

**요청 예시:**
```json
{
  "simulator_type": "cpu_architecture",
  "user_message": "4코어 CPU, 3.2GHz 클럭, L1 캐시 32KB로 시뮬레이션 해줘"
}
```

**응답 예시:**
```json
{
  "simulator_type": "cpu_architecture",
  "message": "## CPU 아키텍처 시뮬레이션 결과\n...",
  "cpu_output": {
    "ipc": 2.5,
    "total_execution_time": 125.0,
    ...
  },
  "extracted_params": {...}
}
```

### 시뮬레이터 타입 조회

```bash
GET /api/v1/simulate/types
```

## 프로젝트 구조

```
src/
├── main.py              # FastAPI 애플리케이션 진입점
├── settings.py           # 애플리케이션 설정
└── prompters/
    ├── __init__.py
    ├── enums.py          # Enum 정의
    ├── schemas.py        # Pydantic 스키마
    ├── abstract.py       # 추상 기본 클래스
    ├── outline.py        # 프롬프트 템플릿
    ├── evaluation.py     # 시뮬레이터 실행 엔진
    ├── feedback.py       # 결과 피드백 생성
    └── routes.py         # API 라우터
```

## 환경 변수

`.env` 파일을 생성하여 다음 변수를 설정할 수 있습니다:

```env
HOST=0.0.0.0
PORT=8000
DEBUG=false
LLM_PROVIDER=openai
LLM_API_KEY=your_api_key
LLM_MODEL=gpt-4
```

## API 문서

서버 실행 후 다음 URL에서 자동 생성된 API 문서를 확인할 수 있습니다:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

