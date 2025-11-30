"""시뮬레이션 결과 피드백 생성."""

from typing import Dict, Any
from .schemas import CPUArchitectureOutput, SemiconductorFabOutput
from .enums import SimulatorType


def generate_cpu_feedback(output: CPUArchitectureOutput) -> str:
    """CPU 시뮬레이터 결과 피드백 생성."""
    feedback = f"""
## CPU 아키텍처 시뮬레이션 결과

### 성능 지표
- **IPC (Instructions Per Cycle)**: {output.ipc:.2f}
- **총 실행 시간**: {output.total_execution_time:.2f} 초
- **정지 비율**: {output.stall_rate:.2f}%

### 메모리 분석
- **L1 적중률**: {output.l1_hit_rate:.2f}%
- **L2 적중률**: {output.l2_hit_rate:.2f}%
- **L3 적중률**: {output.l3_hit_rate:.2f}% (설정된 경우)
- **평균 메모리 접근 시간 (AMAT)**: {output.amat:.2f} Cycles
- **명령어 1,000개당 미스 횟수 (MPI)**: {output.mpi:.2f}

### 멀티코어 및 트래픽
- **일관성 미스**: {output.coherence_misses}회
- **버스 혼잡도**: {output.bus_congestion:.2f}%

### 전력 소비
- **총 에너지**: {output.total_energy:.2f} Joules
- **에너지-지연 곱 (EDP)**: {output.edp:.2f}
"""
    return feedback.strip()


def generate_fab_feedback(output: SemiconductorFabOutput) -> str:
    """반도체 파브 시뮬레이터 결과 피드백 생성."""
    feedback = f"""
## 반도체 파브 시뮬레이션 결과

### 수율 분석
- **파라메트릭 수율**: {output.parametric_yield:.2f}%
- **기능적 수율**: {output.functional_yield:.2f}%
- **등급 분포**:
  - 최고 등급 (Grade A): {output.binning_distribution.grade_a:.2f}%
  - 중간 등급 (Grade B): {output.binning_distribution.grade_b:.2f}%
  - 하위 등급 (Grade C): {output.binning_distribution.grade_c:.2f}%

### 운영 효율 지표
- **OEE (Overall Equipment Effectiveness)**: {output.oee:.2f}%
- **재공 재고량 (WIP)**: {output.wip_level}개
- **병목 공정**: {output.bottleneck_station_id or '없음'}

### 재무 및 전략
- **마스크 상각비**: {output.mask_amortization_cost:.2f}
- **라인 밸런싱 효율**: {output.line_balance_efficiency:.2f}%
"""
    return feedback.strip()


def generate_feedback(simulator_type: SimulatorType, output: Any) -> str:
    """시뮬레이터 타입에 따라 피드백 생성."""
    if simulator_type == SimulatorType.CPU_ARCHITECTURE:
        return generate_cpu_feedback(output)
    elif simulator_type == SimulatorType.SEMICONDUCTOR_FAB:
        return generate_fab_feedback(output)
    else:
        return "알 수 없는 시뮬레이터 타입입니다."

