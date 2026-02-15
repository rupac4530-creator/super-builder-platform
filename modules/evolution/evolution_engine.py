"""
Engine Alto — Evolution Engine & Self-Improvement (Phases 18-20)
Genetic algorithms for agent evolution, fitness evaluation, and population management.
"""

from __future__ import annotations
import math
import random
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple


@dataclass
class Genome:
    id: str = field(default_factory=lambda: f"gen-{uuid.uuid4().hex[:8]}")
    genes: Dict[str, float] = field(default_factory=dict)
    fitness: float = 0.0
    generation: int = 0
    parent_ids: List[str] = field(default_factory=list)
    mutations: int = 0
    created_at: float = field(default_factory=time.time)

    def clone(self) -> "Genome":
        return Genome(
            genes=dict(self.genes), fitness=0.0,
            generation=self.generation, parent_ids=[self.id],
        )


class EvolutionEngine:
    """Evolves agent configurations through genetic algorithms."""

    def __init__(self, population_size: int = 50, mutation_rate: float = 0.1,
                 crossover_rate: float = 0.7, elitism: int = 5):
        self.population_size = population_size
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate
        self.elitism = elitism
        self._population: List[Genome] = []
        self._generation = 0
        self._fitness_fn: Optional[Callable] = None
        self._best_ever: Optional[Genome] = None
        self._history: List[Dict[str, Any]] = []

    def set_fitness_function(self, fn: Callable[[Genome], float]) -> None:
        self._fitness_fn = fn

    def initialize(self, gene_template: Dict[str, Tuple[float, float]]) -> None:
        """Create initial population from gene ranges."""
        self._population = []
        for _ in range(self.population_size):
            genes = {}
            for name, (lo, hi) in gene_template.items():
                genes[name] = random.uniform(lo, hi)
            self._population.append(Genome(genes=genes, generation=0))

    def evaluate(self) -> None:
        """Evaluate fitness for all genomes."""
        if not self._fitness_fn:
            raise RuntimeError("No fitness function set")
        for genome in self._population:
            genome.fitness = self._fitness_fn(genome)
        self._population.sort(key=lambda g: g.fitness, reverse=True)
        if not self._best_ever or self._population[0].fitness > self._best_ever.fitness:
            self._best_ever = self._population[0]

    def _select_parent(self) -> Genome:
        """Tournament selection."""
        tournament = random.sample(self._population, min(5, len(self._population)))
        return max(tournament, key=lambda g: g.fitness)

    def _crossover(self, parent_a: Genome, parent_b: Genome) -> Genome:
        """Single-point crossover."""
        child_genes = {}
        keys = list(parent_a.genes.keys())
        crossover_point = random.randint(0, len(keys))
        for i, key in enumerate(keys):
            if i < crossover_point:
                child_genes[key] = parent_a.genes[key]
            else:
                child_genes[key] = parent_b.genes[key]
        return Genome(
            genes=child_genes, generation=self._generation + 1,
            parent_ids=[parent_a.id, parent_b.id],
        )

    def _mutate(self, genome: Genome) -> None:
        """Gaussian mutation."""
        for key in genome.genes:
            if random.random() < self.mutation_rate:
                genome.genes[key] += random.gauss(0, 0.1) * genome.genes[key]
                genome.mutations += 1

    def evolve(self) -> List[Genome]:
        """Run one generation of evolution."""
        self.evaluate()

        # Record history
        fitnesses = [g.fitness for g in self._population]
        self._history.append({
            "generation": self._generation,
            "best_fitness": max(fitnesses),
            "avg_fitness": sum(fitnesses) / len(fitnesses),
            "worst_fitness": min(fitnesses),
        })

        # Elite carry-over
        new_population = [g.clone() for g in self._population[:self.elitism]]

        # Breed new genomes
        while len(new_population) < self.population_size:
            parent_a = self._select_parent()
            if random.random() < self.crossover_rate:
                parent_b = self._select_parent()
                child = self._crossover(parent_a, parent_b)
            else:
                child = parent_a.clone()
            self._mutate(child)
            child.generation = self._generation + 1
            new_population.append(child)

        self._population = new_population[:self.population_size]
        self._generation += 1
        return self._population

    @property
    def best(self) -> Optional[Genome]:
        if self._population:
            return max(self._population, key=lambda g: g.fitness)
        return None

    @property
    def best_ever_genome(self) -> Optional[Genome]:
        return self._best_ever

    def stats(self) -> Dict[str, Any]:
        fitnesses = [g.fitness for g in self._population] if self._population else [0]
        return {
            "generation": self._generation,
            "population_size": len(self._population),
            "best_fitness": max(fitnesses),
            "avg_fitness": sum(fitnesses) / len(fitnesses),
            "best_ever": self._best_ever.fitness if self._best_ever else 0,
            "mutation_rate": self.mutation_rate,
        }
