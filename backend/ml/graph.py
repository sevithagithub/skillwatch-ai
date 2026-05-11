"""
Skill Graph Engine
Uses NetworkX to model skill relationships, find transition paths,
and recommend related skills.
"""

import networkx as nx
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GRAPH_CSV = os.path.join(BASE_DIR, "..", "datasets", "skill_graph.csv")


def build_graph() -> nx.DiGraph:
    """Build a directed skill graph from the CSV dataset."""
    G = nx.DiGraph()

    if os.path.exists(GRAPH_CSV):
        df = pd.read_csv(GRAPH_CSV)
        for _, row in df.iterrows():
            G.add_edge(
                row["skill"],
                row["related_skill"],
                relationship=row["relationship_type"],
                weight=row["strength"]
            )
    return G


_graph_cache = None


def get_graph() -> nx.DiGraph:
    """Get or build the cached skill graph."""
    global _graph_cache
    if _graph_cache is None:
        _graph_cache = build_graph()
    return _graph_cache


def get_related_skills(skill_name: str, depth: int = 1) -> list:
    """Get skills related to the given skill within N hops."""
    G = get_graph()
    if skill_name not in G:
        return []

    related = set()
    # Get successors (skills this enables)
    for neighbor in G.successors(skill_name):
        related.add(neighbor)
        if depth > 1:
            for n2 in G.successors(neighbor):
                related.add(n2)

    # Get predecessors (skills that enable this)
    for neighbor in G.predecessors(skill_name):
        related.add(neighbor)
        if depth > 1:
            for n2 in G.predecessors(neighbor):
                related.add(n2)

    related.discard(skill_name)
    return list(related)


def get_transition_path(from_skill: str, to_skill: str) -> list:
    """Find the shortest transition path between two skills."""
    G = get_graph()
    undirected = G.to_undirected()

    if from_skill not in undirected or to_skill not in undirected:
        return []

    try:
        path = nx.shortest_path(undirected, from_skill, to_skill)
        return path
    except nx.NetworkXNoPath:
        return []


def get_graph_data() -> dict:
    """Return the full graph as nodes and edges for visualization."""
    G = get_graph()

    nodes = []
    for node in G.nodes():
        nodes.append({
            "id": node,
            "connections": G.degree(node),
        })

    edges = []
    for u, v, data in G.edges(data=True):
        edges.append({
            "source": u,
            "target": v,
            "relationship_type": data.get("relationship", "related"),
            "strength": data.get("weight", 0.5),
        })

    return {"nodes": nodes, "edges": edges}


def get_reskill_suggestions(dying_skills: list) -> dict:
    """
    Given a list of dying/at-risk skills, suggest transition targets.
    Returns {dying_skill: [suggested_skills]}.
    """
    G = get_graph()
    suggestions = {}

    for skill in dying_skills:
        if skill not in G:
            suggestions[skill] = []
            continue

        candidates = []
        for neighbor in G.successors(skill):
            edge_data = G[skill][neighbor]
            rel = edge_data.get("relationship", "")
            if rel in ("progression", "transition", "enables"):
                candidates.append({
                    "skill": neighbor,
                    "relationship": rel,
                    "strength": edge_data.get("weight", 0.5)
                })

        # Also check predecessors for "enables" relationships
        for neighbor in G.predecessors(skill):
            edge_data = G[neighbor][skill]
            rel = edge_data.get("relationship", "")
            if rel == "enables":
                # The predecessor enables this skill, so going to
                # successor of predecessor could be a path
                for next_skill in G.successors(neighbor):
                    if next_skill != skill:
                        candidates.append({
                            "skill": next_skill,
                            "relationship": "via_" + neighbor,
                            "strength": 0.4
                        })

        # Sort by strength descending, deduplicate
        seen = set()
        unique = []
        for c in sorted(candidates, key=lambda x: x["strength"], reverse=True):
            if c["skill"] not in seen:
                seen.add(c["skill"])
                unique.append(c)

        suggestions[skill] = unique[:5]

    return suggestions
