"""FastAPI 라우터 정의."""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from .schemas import (
    SimulationRequest,
    SimulationResponse,
    CPUArchitectureInput,
    CPUArchitectureOutput,
    SemiconductorFabInput,
    SemiconductorFabOutput,
)
from .enums import SimulatorType
from .evaluation import SimulatorEngine, extract_parameters_from_llm
from .feedback import generate_feedback
from .outline import CPU_ARCHITECTURE_PROMPT_TEMPLATE, SEMICONDUCTOR_FAB_PROMPT_TEMPLATE

router = APIRouter(prefix="/api/v1/simulate", tags=["simulation"])


@router.post("/", response_model=SimulationResponse)
async def run_simulation(request: SimulationRequest) -> SimulationResponse:
    """
    시뮬레이션을 실행합니다.
    
    사용자의 자연어 메시지에서 파라미터를 추출하고 시뮬레이션을 실행합니다.
    """
    try:
        # 파라미터 추출 (LLM 사용)
        extracted_params = await extract_parameters_from_llm(
            request.user_message, request.simulator_type
        )
        
        # 입력 파라미터 구성
        if request.simulator_type == SimulatorType.CPU_ARCHITECTURE:
            # 사용자가 제공한 입력이 있으면 사용, 없으면 추출된 파라미터로 생성
            if request.cpu_input:
                cpu_input = request.cpu_input
            else:
                # 추출된 파라미터로 기본값과 병합하여 생성
                cpu_input = _build_cpu_input_from_params(extracted_params)
            
            # 시뮬레이션 실행
            output = await SimulatorEngine.run_cpu_simulation(cpu_input)
            
            # 피드백 생성
            feedback_message = generate_feedback(SimulatorType.CPU_ARCHITECTURE, output)
            
            return SimulationResponse(
                simulator_type=SimulatorType.CPU_ARCHITECTURE,
                message=feedback_message,
                cpu_output=output,
                extracted_params=extracted_params,
            )
            
        elif request.simulator_type == SimulatorType.SEMICONDUCTOR_FAB:
            if request.fab_input:
                fab_input = request.fab_input
            else:
                fab_input = _build_fab_input_from_params(extracted_params)
            
            output = await SimulatorEngine.run_fab_simulation(fab_input)
            feedback_message = generate_feedback(SimulatorType.SEMICONDUCTOR_FAB, output)
            
            return SimulationResponse(
                simulator_type=SimulatorType.SEMICONDUCTOR_FAB,
                message=feedback_message,
                fab_output=output,
                extracted_params=extracted_params,
            )
        else:
            raise HTTPException(status_code=400, detail="알 수 없는 시뮬레이터 타입입니다.")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"시뮬레이션 실행 중 오류 발생: {str(e)}")


def _build_cpu_input_from_params(params: Dict[str, Any]) -> CPUArchitectureInput:
    """추출된 파라미터로 CPU 입력 생성 (기본값 포함)."""
    from .enums import PrefetcherType, CoherenceProtocol
    from .schemas import L1CacheConfig, L2CacheConfig, L3CacheConfig
    
    l1_config = L1CacheConfig(
        size=params.get("l1_size", "32KB"),
        associativity=params.get("l1_associativity", 4),
        latency=params.get("l1_latency", 2),
    )
    
    l2_config = L2CacheConfig(
        size=params.get("l2_size", "256KB"),
        associativity=params.get("l2_associativity", 8),
        latency=params.get("l2_latency", 12),
    )
    
    l3_config = None
    if params.get("l3_size"):
        l3_config = L3CacheConfig(
            size=params.get("l3_size", "8MB"),
            associativity=params.get("l3_associativity", 16),
            latency=params.get("l3_latency", 40),
        )
    
    return CPUArchitectureInput(
        clock_frequency=params.get("clock_frequency", 3.2),
        number_of_cores=params.get("number_of_cores", 4),
        pipeline_depth=params.get("pipeline_depth", 10),
        issue_width=params.get("issue_width", 4),
        rob_size=params.get("rob_size", 128),
        branch_prediction_accuracy=params.get("branch_prediction_accuracy", 95.0),
        l1_cache_config=l1_config,
        l2_cache_config=l2_config,
        l3_cache_config=l3_config,
        main_memory_latency=params.get("main_memory_latency", 200),
        prefetcher_type=PrefetcherType(params.get("prefetcher_type", "next_line")),
        coherence_protocol=CoherenceProtocol(params.get("coherence_protocol", "mesi")),
        bus_bandwidth=params.get("bus_bandwidth", 50.0),
        trace_file=params.get("trace_file"),
    )


def _build_fab_input_from_params(params: Dict[str, Any]) -> SemiconductorFabInput:
    """추출된 파라미터로 파브 입력 생성 (기본값 포함)."""
    from .enums import TechnologyNode, LithographySource
    
    return SemiconductorFabInput(
        technology_node=TechnologyNode(params.get("technology_node", "7nm")),
        lithography_source=LithographySource(params.get("lithography_source", "arf_immersion")),
        mask_layer_count=params.get("mask_layer_count", 50),
        cpk_target=params.get("cpk_target", 1.67),
        cd_uniformity=params.get("cd_uniformity", 95.0),
        overlay_accuracy=params.get("overlay_accuracy", 2.0),
        throughput_wph=params.get("throughput_wph", 100),
        mtbf=params.get("mtbf", 1000.0),
        mttr=params.get("mttr", 5.0),
        defect_clustering_factor=params.get("defect_clustering_factor", 1.0),
        killer_defect_ratio=params.get("killer_defect_ratio", 30.0),
    )


@router.get("/types")
async def get_simulator_types() -> Dict[str, Any]:
    """사용 가능한 시뮬레이터 타입 목록을 반환합니다."""
    return {
        "simulator_types": [
            {
                "type": SimulatorType.CPU_ARCHITECTURE.value,
                "name": "CPU Architecture & Cache Simulator",
                "description": "CPU 아키텍처 및 캐시 시뮬레이터",
            },
            {
                "type": SimulatorType.SEMICONDUCTOR_FAB.value,
                "name": "Advanced Semiconductor Fab & Yield Simulator",
                "description": "반도체 파브 및 수율 시뮬레이터",
            },
        ]
    }

