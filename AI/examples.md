# API 사용 예시

## 1. CPU 아키텍처 시뮬레이터 요청

### cURL 예시

```bash
curl -X POST "http://localhost:8000/api/v1/simulate/" \
  -H "Content-Type: application/json" \
  -d '{
    "simulator_type": "cpu_architecture",
    "user_message": "4코어 CPU, 3.2GHz 클럭 주파수, L1 캐시 32KB, L2 캐시 256KB로 시뮬레이션 해줘"
  }'
```

### Python 예시

```python
import requests

url = "http://localhost:8000/api/v1/simulate/"
payload = {
    "simulator_type": "cpu_architecture",
    "user_message": "4코어 CPU, 3.2GHz 클럭 주파수, L1 캐시 32KB, L2 캐시 256KB로 시뮬레이션 해줘"
}

response = requests.post(url, json=payload)
print(response.json())
```

### 상세 파라미터를 포함한 요청

```json
{
  "simulator_type": "cpu_architecture",
  "user_message": "고성능 멀티코어 CPU 시뮬레이션",
  "cpu_input": {
    "clock_frequency": 3.5,
    "number_of_cores": 8,
    "pipeline_depth": 12,
    "issue_width": 4,
    "rob_size": 256,
    "branch_prediction_accuracy": 97.5,
    "l1_cache_config": {
      "size": "64KB",
      "associativity": 8,
      "block_size": 64,
      "latency": 2,
      "cache_type": "split"
    },
    "l2_cache_config": {
      "size": "512KB",
      "associativity": 16,
      "block_size": 64,
      "latency": 12,
      "cache_type": "unified"
    },
    "l3_cache_config": {
      "size": "16MB",
      "associativity": 16,
      "block_size": 64,
      "latency": 40
    },
    "main_memory_latency": 200,
    "prefetcher_type": "stride",
    "coherence_protocol": "mesi",
    "bus_bandwidth": 100.0,
    "trace_file": "matrix_mul.trace"
  }
}
```

## 2. 반도체 파브 시뮬레이터 요청

### cURL 예시

```bash
curl -X POST "http://localhost:8000/api/v1/simulate/" \
  -H "Content-Type: application/json" \
  -d '{
    "simulator_type": "semiconductor_fab",
    "user_message": "7nm 공정, EUV 노광, 시간당 100개 웨이퍼 처리량으로 수율 시뮬레이션 해줘"
  }'
```

### Python 예시

```python
import requests

url = "http://localhost:8000/api/v1/simulate/"
payload = {
    "simulator_type": "semiconductor_fab",
    "user_message": "7nm 공정, EUV 노광, 시간당 100개 웨이퍼 처리량으로 수율 시뮬레이션 해줘"
}

response = requests.post(url, json=payload)
print(response.json())
```

### 상세 파라미터를 포함한 요청

```json
{
  "simulator_type": "semiconductor_fab",
  "user_message": "최신 공정 라인 시뮬레이션",
  "fab_input": {
    "technology_node": "7nm",
    "lithography_source": "euv",
    "mask_layer_count": 60,
    "cpk_target": 1.67,
    "cd_uniformity": 95.5,
    "overlay_accuracy": 2.5,
    "throughput_wph": 120,
    "mtbf": 1500.0,
    "mttr": 4.0,
    "defect_clustering_factor": 1.5,
    "killer_defect_ratio": 25.0
  }
}
```

## 3. 응답 예시

### CPU 아키텍처 시뮬레이터 응답

```json
{
  "simulator_type": "cpu_architecture",
  "message": "## CPU 아키텍처 시뮬레이션 결과\n\n### 성능 지표\n- **IPC (Instructions Per Cycle)**: 2.56\n- **총 실행 시간**: 125.50 초\n- **정지 비율**: 36.00%\n\n### 메모리 분석\n- **L1 적중률**: 91.00%\n- **L2 적중률**: 73.00%\n- **L3 적중률**: 70.00%\n- **평균 메모리 접근 시간 (AMAT)**: 45.23 Cycles\n- **명령어 1,000개당 미스 횟수 (MPI)**: 0.90\n\n### 멀티코어 및 트래픽\n- **일관성 미스**: 40회\n- **버스 혼잡도**: 20.00%\n\n### 전력 소비\n- **총 에너지**: 112.00 Joules\n- **에너지-지연 곱 (EDP)**: 14056.00",
  "cpu_output": {
    "ipc": 2.56,
    "total_execution_time": 125.5,
    "stall_rate": 36.0,
    "l1_hit_rate": 91.0,
    "l2_hit_rate": 73.0,
    "l3_hit_rate": 70.0,
    "amat": 45.23,
    "mpi": 0.9,
    "coherence_misses": 40,
    "bus_congestion": 20.0,
    "total_energy": 112.0,
    "edp": 14056.0
  },
  "extracted_params": {
    "clock_frequency": 3.2,
    "number_of_cores": 4
  }
}
```

### 반도체 파브 시뮬레이터 응답

```json
{
  "simulator_type": "semiconductor_fab",
  "message": "## 반도체 파브 시뮬레이션 결과\n\n### 수율 분석\n- **파라메트릭 수율**: 80.75%\n- **기능적 수율**: 85.00%\n- **등급 분포**:\n  - 최고 등급 (Grade A): 16.15%\n  - 중간 등급 (Grade B): 40.38%\n  - 하위 등급 (Grade C): 24.23%\n\n### 운영 효율 지표\n- **OEE (Overall Equipment Effectiveness)**: 78.50%\n- **재공 재고량 (WIP)**: 240개\n- **병목 공정**: Lithography_Scanner_02\n\n### 재무 및 전략\n- **마스크 상각비**: 6944444.44\n- **라인 밸런싱 효율**: 86.35%",
  "fab_output": {
    "parametric_yield": 80.75,
    "functional_yield": 85.0,
    "binning_distribution": {
      "grade_a": 16.15,
      "grade_b": 40.38,
      "grade_c": 24.23
    },
    "oee": 78.5,
    "wip_level": 240,
    "bottleneck_station_id": "Lithography_Scanner_02",
    "mask_amortization_cost": 6944444.44,
    "line_balance_efficiency": 86.35
  },
  "extracted_params": {
    "technology_node": "7nm",
    "lithography_source": "euv"
  }
}
```

## 4. 시뮬레이터 타입 조회

```bash
curl -X GET "http://localhost:8000/api/v1/simulate/types"
```

응답:
```json
{
  "simulator_types": [
    {
      "type": "cpu_architecture",
      "name": "CPU Architecture & Cache Simulator",
      "description": "CPU 아키텍처 및 캐시 시뮬레이터"
    },
    {
      "type": "semiconductor_fab",
      "name": "Advanced Semiconductor Fab & Yield Simulator",
      "description": "반도체 파브 및 수율 시뮬레이터"
    }
  ]
}
```

## 5. 다양한 자연어 요청 예시

### CPU 시뮬레이터
- "8코어 CPU, 4GHz 클럭으로 시뮬레이션"
- "고성능 멀티코어 프로세서, L1 64KB, L2 1MB 캐시 설정"
- "분기 예측 정확도 98%, 파이프라인 깊이 15단계"
- "MESI 프로토콜, 버스 대역폭 200GB/s"

### 파브 시뮬레이터
- "3nm 공정, EUV 노광으로 수율 계산"
- "7nm 공정, 시간당 150개 웨이퍼 처리"
- "Cpk 1.67 목표, 결함 클러스터링 팩터 2.0"
- "마스크 레이어 70개, 오버레이 정확도 1.5nm"

