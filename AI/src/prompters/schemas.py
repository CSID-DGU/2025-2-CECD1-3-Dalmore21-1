"""Pydantic schemas for simulation parameters."""

from typing import Optional
from pydantic import BaseModel, Field
from .enums import (
    SimulatorType,
    PrefetcherType,
    CoherenceProtocol,
    TechnologyNode,
    LithographySource,
)


# ==================== CPU Architecture & Cache Simulator ====================


class CacheConfig(BaseModel):
    """캐시 설정 기본 구조."""
    size: str = Field(..., description="캐시 크기 (예: '32KB', '256KB')")
    associativity: int = Field(..., description="연관도 (way 수)")
    block_size: int = Field(default=64, description="블록 크기 (Bytes)")
    latency: int = Field(..., description="지연 시간 (Cycles)")


class L1CacheConfig(CacheConfig):
    """L1 캐시 설정."""
    cache_type: str = Field(default="split", description="타입: split (Instruction/Data 분리)")


class L2CacheConfig(CacheConfig):
    """L2 캐시 설정."""
    cache_type: str = Field(default="unified", description="타입: unified (통합)")


class L3CacheConfig(CacheConfig):
    """L3 캐시 설정."""
    pass


class CPUArchitectureInput(BaseModel):
    """CPU 아키텍처 시뮬레이터 입력 파라미터."""
    # Core Architecture
    clock_frequency: float = Field(..., description="클럭 주파수 (GHz)", ge=0.1, le=10.0)
    number_of_cores: int = Field(..., description="코어 개수", ge=1)
    pipeline_depth: int = Field(..., description="파이프라인 깊이", ge=5, le=20)
    issue_width: int = Field(..., description="동시 발행 폭", ge=1, le=8)
    rob_size: int = Field(..., description="Re-Order Buffer 크기", ge=32, le=512)
    branch_prediction_accuracy: float = Field(
        ..., description="분기 예측 정확도 (%)", ge=90.0, le=99.9
    )
    
    # Memory Hierarchy
    l1_cache_config: L1CacheConfig = Field(..., description="L1 캐시 설정")
    l2_cache_config: L2CacheConfig = Field(..., description="L2 캐시 설정")
    l3_cache_config: Optional[L3CacheConfig] = Field(None, description="L3 캐시 설정")
    main_memory_latency: int = Field(..., description="RAM 지연 시간 (Cycles)", ge=50, le=500)
    prefetcher_type: PrefetcherType = Field(..., description="프리패치 알고리즘")
    
    # Interconnect & Coherence
    coherence_protocol: CoherenceProtocol = Field(..., description="일관성 프로토콜")
    bus_bandwidth: float = Field(..., description="버스 대역폭 (GB/s)", ge=1.0, le=1000.0)
    
    # Workload
    trace_file: Optional[str] = Field(None, description="메모리 접근 기록 파일")


class CPUArchitectureOutput(BaseModel):
    """CPU 아키텍처 시뮬레이터 출력 파라미터."""
    # Performance
    ipc: float = Field(..., description="Instructions Per Cycle")
    total_execution_time: float = Field(..., description="총 실행 시간 (Seconds)")
    stall_rate: float = Field(..., description="정지 비율 (%)")
    
    # Memory Analysis
    l1_hit_rate: float = Field(..., description="L1 적중률 (%)")
    l2_hit_rate: float = Field(..., description="L2 적중률 (%)")
    l3_hit_rate: Optional[float] = Field(None, description="L3 적중률 (%)")
    amat: float = Field(..., description="Average Memory Access Time (Cycles)")
    mpi: float = Field(..., description="Misses Per Kilo-Instructions")
    
    # Multicore & Traffic
    coherence_misses: int = Field(..., description="일관성 미스 횟수")
    bus_congestion: float = Field(..., description="버스 혼잡도 (%)")
    
    # Energy
    total_energy: float = Field(..., description="총 에너지 (Joules)")
    edp: float = Field(..., description="Energy-Delay Product")


# ==================== Semiconductor Fab & Yield Simulator ====================


class SemiconductorFabInput(BaseModel):
    """반도체 파브 시뮬레이터 입력 파라미터."""
    # Tech Node & Lithography
    technology_node: TechnologyNode = Field(..., description="테크 노드")
    lithography_source: LithographySource = Field(..., description="노광 광원")
    mask_layer_count: int = Field(..., description="마스크 레이어 수", ge=30, le=100)
    
    # Process Control & Variability
    cpk_target: float = Field(..., description="공정 능력 지수 목표", ge=1.0, le=2.0)
    cd_uniformity: float = Field(..., description="임계 치수 균일도 (%)", ge=80.0, le=100.0)
    overlay_accuracy: float = Field(..., description="오버레이 정렬 오차 (nm)", ge=0.1, le=10.0)
    
    # Equipment Efficiency
    throughput_wph: int = Field(..., description="시간당 웨이퍼 처리량 (WPH)", ge=1, le=1000)
    mtbf: float = Field(..., description="평균 고장 간격 (Hours)", ge=100.0, le=10000.0)
    mttr: float = Field(..., description="평균 수리 시간 (Hours)", ge=0.1, le=100.0)
    
    # Yield Model Parameters
    defect_clustering_factor: float = Field(
        ..., description="결함 클러스터링 팩터 (Alpha)", ge=0.0, le=5.0
    )
    killer_defect_ratio: float = Field(
        ..., description="치명적 결함 비율 (%)", ge=0.0, le=100.0
    )


class BinningDistribution(BaseModel):
    """등급 분포."""
    grade_a: float = Field(..., description="최고 등급 비율 (%)")
    grade_b: float = Field(..., description="중간 등급 비율 (%)")
    grade_c: float = Field(..., description="하위 등급 비율 (%)")


class SemiconductorFabOutput(BaseModel):
    """반도체 파브 시뮬레이터 출력 파라미터."""
    # Advanced Yield Analysis
    parametric_yield: float = Field(..., description="파라메트릭 수율 (%)")
    functional_yield: float = Field(..., description="기능적 수율 (%)")
    binning_distribution: BinningDistribution = Field(..., description="등급 분포")
    
    # Operational Metrics
    oee: float = Field(..., description="Overall Equipment Effectiveness (%)")
    wip_level: int = Field(..., description="재공 재고량")
    bottleneck_station_id: Optional[str] = Field(None, description="병목 공정 식별")
    
    # Economics & Strategy
    mask_amortization_cost: float = Field(..., description="마스크 상각비 (Currency)")
    line_balance_efficiency: float = Field(..., description="라인 밸런싱 효율 (%)")


# ==================== Request/Response Schemas ====================


class SimulationRequest(BaseModel):
    """시뮬레이션 요청."""
    simulator_type: SimulatorType = Field(..., description="시뮬레이터 타입")
    user_message: str = Field(..., description="사용자 자연어 메시지")
    cpu_input: Optional[CPUArchitectureInput] = Field(None, description="CPU 시뮬레이터 입력 (타입이 cpu_architecture일 때)")
    fab_input: Optional[SemiconductorFabInput] = Field(None, description="파브 시뮬레이터 입력 (타입이 semiconductor_fab일 때)")


class SimulationResponse(BaseModel):
    """시뮬레이션 응답."""
    simulator_type: SimulatorType
    message: str = Field(..., description="응답 메시지")
    cpu_output: Optional[CPUArchitectureOutput] = None
    fab_output: Optional[SemiconductorFabOutput] = None
    extracted_params: dict = Field(default_factory=dict, description="추출된 파라미터")

