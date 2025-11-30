"""Enum definitions for simulation parameters."""

from enum import Enum


class SimulatorType(str, Enum):
    """시뮬레이터 타입."""
    CPU_ARCHITECTURE = "cpu_architecture"
    SEMICONDUCTOR_FAB = "semiconductor_fab"


class PrefetcherType(str, Enum):
    """프리패치 알고리즘 타입."""
    NONE = "none"
    NEXT_LINE = "next_line"
    STRIDE = "stride"


class CoherenceProtocol(str, Enum):
    """캐시 일관성 프로토콜."""
    MSI = "msi"
    MESI = "mesi"
    MOESI = "moesi"


class TechnologyNode(str, Enum):
    """테크 노드."""
    NODE_28NM = "28nm"
    NODE_14NM = "14nm"
    NODE_7NM = "7nm"
    NODE_3NM = "3nm"


class LithographySource(str, Enum):
    """노광 광원."""
    ARF_IMMERSION = "arf_immersion"
    EUV = "euv"

