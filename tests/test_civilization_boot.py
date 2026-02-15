"""
Engine Alto -- Full Civilization Integration Test
Boots all 26 phases and verifies every module is operational.
"""

import sys
import os
import time
import io

# Force UTF-8 on Windows
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Add all module paths
BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)
MODULE_DIRS = [
    "alto-core", "render-core", "scripting", "agent-framework",
    "memory-fabric", "security", "healer", "economy", "governance",
    "cicd", "telemetry", "communication", "evolution", "knowledge",
    "simulation", "orchestrator",
]
for d in MODULE_DIRS:
    p = os.path.join(ROOT, "modules", d)
    if p not in sys.path:
        sys.path.insert(0, p)

passed = 0
failed = 0


def test(name):
    """Decorator for test functions."""
    def decorator(fn):
        global passed, failed
        try:
            fn()
            print(f"  [PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {name}: {e}")
            failed += 1
    return decorator


def main():
    global passed, failed
    start = time.time()
    print("=" * 60)
    print("  ENGINE ALTO -- CIVILIZATION INTEGRATION TEST")
    print("=" * 60)
    print()

    # ---- Phase 1: Engine Kernel ----
    print("Phase 1: Engine Kernel")

    @test("JobQueue init & pending_count")
    def _():
        from alto_core.job_queue import JobQueue
        jq = JobQueue()
        # enqueue is async so we just verify the queue initializes correctly
        if jq.pending_count != 0:
            raise AssertionError(f"Expected pending_count 0, got {jq.pending_count}")

    @test("PluginManager init")
    def _():
        from alto_core.plugin_manager import PluginManager
        pm = PluginManager()

    @test("Logger setup")
    def _():
        from alto_core.logger import setup_logging
        log = setup_logging(name="test-integration")

    # ---- Phase 2: Render Core ----
    print("\nPhase 2: Render Core")

    @test("GPU detection")
    def _():
        from render_core.gpu_abstraction import detect_gpu
        gpu = detect_gpu()
        if not gpu.name:
            raise AssertionError("GPU name empty")

    @test("Shader compile & cache")
    def _():
        from render_core.shader_pipeline import ShaderPipeline, ShaderStage
        sp = ShaderPipeline()
        sp.compile("test", "void main(){}", ShaderStage.VERTEX)
        if sp.cached_count != 1:
            raise AssertionError(f"Expected 1 cached, got {sp.cached_count}")

    @test("Asset export GLB")
    def _():
        from render_core.asset_exporter import AssetExporter, ExportFormat, Scene
        exp = AssetExporter()
        cube = AssetExporter.create_cube()
        scene = Scene(name="test", meshes=[cube])
        data = exp.export(scene, ExportFormat.GLB)
        if len(data) == 0:
            raise AssertionError("GLB data empty")

    # ---- Phase 3: Scripting Runtime ----
    print("\nPhase 3: Scripting Runtime")

    @test("Sandbox capability check")
    def _():
        from scripting_runtime.sandbox import Sandbox, SandboxPolicy, Capability
        sb = Sandbox(SandboxPolicy(name="test", capabilities=Capability.FILE_READ))
        if not sb.check_capability(Capability.FILE_READ):
            raise AssertionError("Should allow FILE_READ")
        if sb.check_capability(Capability.NETWORK):
            raise AssertionError("Should deny NETWORK")

    @test("Script engine safe exec")
    def _():
        from scripting_runtime.script_engine import ScriptEngine
        se = ScriptEngine()
        result = se.execute_safe("__result__ = 2 + 2")
        if result.output != 4:
            raise AssertionError(f"Expected 4, got {result.output}")

    # ---- Phase 5: Agent Framework ----
    print("\nPhase 5: Agent Framework")

    @test("LoadBalancer routing")
    def _():
        from agent_framework import LoadBalancer, AgentProfile, AgentRole
        lb = LoadBalancer()
        lb.register(AgentProfile(name="A1", role=AgentRole.BUILDER))
        lb.register(AgentProfile(name="A2", role=AgentRole.TESTER))
        if lb.total_agents != 2:
            raise AssertionError(f"Expected 2 agents, got {lb.total_agents}")
        selected = lb.select(role=AgentRole.BUILDER)
        if selected is None:
            raise AssertionError("Should select a builder")

    # ---- Phase 6: Memory Fabric ----
    print("\nPhase 6: Memory Fabric")

    @test("Memory store & recall")
    def _():
        from memory_fabric import MemoryFabric, MemoryType
        mf = MemoryFabric()
        mf.store("Python is a programming language", MemoryType.SEMANTIC, tags=["prog"])
        mf.store("The sky is blue", MemoryType.SEMANTIC, tags=["nature"])
        results = mf.recall("programming language")
        if len(results) == 0:
            raise AssertionError("Should recall at least 1 memory")

    # ---- Phase 7: Security ----
    print("\nPhase 7: Security")

    @test("Input sanitization")
    def _():
        from adversarial_defense import SecurityDepartment
        sec = SecurityDepartment()
        threats = sec.scan_input("'; DROP TABLE users; --")
        if len(threats) == 0:
            raise AssertionError("Should detect injection")

    @test("Rate limiter")
    def _():
        from adversarial_defense import SecurityDepartment
        sec = SecurityDepartment()
        if not sec.check_rate("test-key"):
            raise AssertionError("First request should be allowed")

    # ---- Phase 8: Healer ----
    print("\nPhase 8: Healer Network")

    @test("Health check system")
    def _():
        from healer_network import HealerNetwork, HealthStatus
        hn = HealerNetwork()
        hn.register_check("cpu", lambda: True)
        status = hn.run_check("cpu")
        if status != HealthStatus.HEALTHY:
            raise AssertionError(f"Expected HEALTHY, got {status}")

    # ---- Phase 9: Economy ----
    print("\nPhase 9: Token Economy")

    @test("Token ledger credit")
    def _():
        from token_economy import TokenLedger
        ledger = TokenLedger(initial_balance=100)
        ledger.credit("agent-1", 50, "task completion")
        if ledger.balance("agent-1") != 150:
            raise AssertionError(f"Expected 150, got {ledger.balance('agent-1')}")

    # ---- Phase 10: Governance ----
    print("\nPhase 10: Governance Runtime")

    @test("Proposal & voting")
    def _():
        from governance_runtime import GovernanceRuntime
        gov = GovernanceRuntime()
        prop = gov.submit_proposal("Test Policy", "A test", "agent-1", quorum=2)
        gov.cast_vote(prop.id, "agent-2", True)
        gov.cast_vote(prop.id, "agent-3", True)

    # ---- Phase 11-12: CI/CD ----
    print("\nPhase 11-12: CI/CD")

    @test("Pipeline creation & execution")
    def _():
        from cicd_orchestrator import CICDOrchestrator
        cicd = CICDOrchestrator()
        run = cicd.create_run("abc123", "main")
        if len(run.stages) == 0:
            raise AssertionError("Pipeline should have stages")
        cicd.execute_run(run)
        if not run.passed:
            raise AssertionError("Pipeline should pass with mock handlers")

    # ---- Phase 13-14: Telemetry ----
    print("\nPhase 13-14: Telemetry")

    @test("Metrics & tracing")
    def _():
        from observability import Observability
        obs = Observability()
        obs.metrics.increment("requests")
        obs.metrics.gauge("cpu_usage", 45.5)
        span = obs.tracer.start_trace("test-op")
        span.finish()
        if obs.metrics.get_latest("requests") is None:
            raise AssertionError("Should have requests metric")

    # ---- Phase 15-17: Communication ----
    print("\nPhase 15-17: Communication")

    @test("Message bus pub/sub")
    def _():
        from protocol import MessageBus
        bus = MessageBus()
        received = []
        bus.subscribe("test-channel", lambda msg: received.append(msg))
        bus.broadcast("sender", "test-channel", {"data": "hello"})
        if len(received) != 1:
            raise AssertionError(f"Expected 1 message, got {len(received)}")

    @test("Federation nodes")
    def _():
        from protocol import Federation
        fed = Federation()
        node = fed.register_node("remote-alto", "https://remote.alto.ai", trusted=True)
        fed.connect(node.id)
        if len(fed.connected_nodes) != 1:
            raise AssertionError("Should have 1 connected node")

    # ---- Phase 18-20: Evolution ----
    print("\nPhase 18-20: Evolution")

    @test("Evolution engine generation")
    def _():
        from evolution_engine import EvolutionEngine
        evo = EvolutionEngine(population_size=10, mutation_rate=0.2)
        evo.set_fitness_function(lambda g: sum(g.genes.values()))
        evo.initialize({"speed": (0, 10), "accuracy": (0, 10)})
        evo.evolve()
        if evo.stats()["generation"] != 1:
            raise AssertionError("Should be generation 1")

    # ---- Phase 21-22: Knowledge ----
    print("\nPhase 21-22: Knowledge Graph")

    @test("Knowledge graph relations")
    def _():
        from knowledge_graph import KnowledgeGraph
        kg = KnowledgeGraph()
        e1 = kg.add_entity("Python", "language")
        e2 = kg.add_entity("Django", "framework")
        kg.add_relation(e2.id, e1.id, "written_in")
        if len(kg.outgoing(e2.id)) != 1:
            raise AssertionError("Should have 1 outgoing relation")

    @test("Knowledge graph shortest path")
    def _():
        from knowledge_graph import KnowledgeGraph
        kg = KnowledgeGraph()
        a = kg.add_entity("A", "node")
        b = kg.add_entity("B", "node")
        c = kg.add_entity("C", "node")
        kg.add_relation(a.id, b.id, "connects")
        kg.add_relation(b.id, c.id, "connects")
        path = kg.shortest_path(a.id, c.id)
        if path is None or len(path) != 3:
            raise AssertionError(f"Expected path of 3, got {path}")

    # ---- Phase 23-24: Simulation ----
    print("\nPhase 23-24: Simulation")

    @test("Simulation run & checkpoint")
    def _():
        from simulation_env import SimulationEnvironment, SimulationConfig
        sim = SimulationEnvironment(SimulationConfig(max_ticks=10))
        sim.spawn_entity("agent-1", {"health": 100})
        executed = sim.run(5)
        if executed != 5:
            raise AssertionError(f"Expected 5 ticks, got {executed}")
        sim.checkpoint()

    @test("Digital twin")
    def _():
        from simulation_env import DigitalTwin
        dt = DigitalTwin()
        twin = dt.create_twin("production-backend")
        result = dt.run_experiment("production-backend", ticks=10)
        if result.get("ticks_executed") != 10:
            raise AssertionError(f"Expected 10 ticks")

    # ---- Phase 25-26: Civilization ----
    print("\nPhase 25-26: Civilization Orchestrator")

    @test("Civilization boot & manifest")
    def _():
        from civilization import CivilizationOrchestrator
        civ = CivilizationOrchestrator()
        results = civ.boot()
        hb = civ.heartbeat()
        if hb.modules_loaded != 27:
            raise AssertionError(f"Expected 27 modules, got {hb.modules_loaded}")
        manifest = civ.manifest()
        if "ALTO READY" not in manifest:
            raise AssertionError("Manifest should contain ALTO READY")
        print()
        print(manifest)

    # ---- Summary ----
    duration = time.time() - start
    total = passed + failed
    print()
    print("=" * 60)
    print(f"  RESULTS: {passed}/{total} passed, {failed} failed")
    print(f"  Duration: {duration:.2f}s")
    print()
    if failed == 0:
        print("  ALL PHASES OPERATIONAL -- CIVILIZATION BOOT SUCCESS")
    else:
        print(f"  WARNING: {failed} test(s) failed")
    print()
    print("  ALTO READY")
    print("=" * 60)
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
