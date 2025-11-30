# AI-WEBSIM Frontend

React 기반의 AI 시뮬레이션 플랫폼 프론트엔드입니다.

## 설치 방법

```bash
npm install
```

## 실행 방법

개발 서버 실행:
```bash
npm run dev
```

프로덕션 빌드:
```bash
npm run build
```

빌드 미리보기:
```bash
npm run preview
```

## 프로젝트 구조

```
src/
├── components/      # 공통 컴포넌트
│   └── Layout.jsx  # 메인 레이아웃 (사이드바 포함)
├── pages/          # 페이지 컴포넌트
│   ├── Modeling.jsx   # AI 모델링 어시스턴트
│   ├── FabSim.jsx     # 반도체 Fab 공정 시뮬레이션
│   └── HWSim.jsx      # 하드웨어 아키텍처 분석
├── styles/         # 스타일 파일
│   └── modeling.css
├── App.jsx        # 메인 앱 컴포넌트 (라우팅)
├── main.jsx       # 엔트리 포인트
└── index.css      # 전역 스타일
```

## 주요 기능

- **AI Modeling**: 자연어로 시뮬레이션 요구사항을 입력하고 모델을 생성
- **Fab Simulation**: 반도체 웨이퍼 공정 시뮬레이션 및 최적화
- **HW Architecture**: 하드웨어 아키텍처 성능 분석 및 트레이드오프 분석

## 기술 스택

- React 18
- React Router 6
- Vite
- Tailwind CSS
- Chart.js
- Font Awesome

