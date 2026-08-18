import { NodeDataType } from "./jsonTypes";
import { pNode } from "./pNode";
import { PathfindingStrategy } from "./pathfindingStrategy";

export class DepthFirst implements PathfindingStrategy {
  // Store all nodes in one easily accessible array
  private nodes: pNode[] = [];
  private nodeData: NodeDataType[] = [];
  private graph: number[][] = [];
  private startIndex: number = 0;
  private endIndex: number = 0;
  private visited: boolean[] = [];
  private bestPath: pNode[] = [];
  private bestDistance: number = Number.MAX_SAFE_INTEGER;

  initialize(
    nodeData: NodeDataType[],
    graph: number[][],
    startLocation: string,
  ): void {
    this.nodeData = nodeData;
    this.graph = graph;
    this.startIndex = this.getIndex(startLocation);
    this.initializeNodes();
  }


  private getIndex(location: string): number {
    const node = this.nodeData.find((x) => x.pathName === location);
    return node ? node.index : -1;
  }


  private findNeighbors(mainNodeIdx: number): pNode[] {
    const neighbors: pNode[] = [];

    for (let j = 0; j < this.graph.length; j++) {
      if (this.graph[mainNodeIdx][j] !== 0) {
        neighbors.push(this.nodes[j]);
      }
    }

    return neighbors;
  }

  private initializeNodes(): void {
    // Initialize all nodes
    for (let i = 0; i < this.graph.length; i++) {
      this.nodes[i] = new pNode(
        this.nodeData,
        i,
        i === this.startIndex ? 0 : Number.MAX_SAFE_INTEGER,
        null,
      );
    }

    // Find node neighbors
    for (let i = 0; i < this.graph.length; i++) {
      this.nodes[i].neighboringNodes = this.findNeighbors(i);
    }

    // Initialize visited array
    this.visited = new Array(this.graph.length).fill(false);

    // Reset best path tracking
    this.bestPath = [];
    this.bestDistance = Number.MAX_SAFE_INTEGER;
  }

  private dfsIterative(startIndex: number, endIndex: number): pNode[] {
    // Initialize
    const stack: { nodeIndex: number; path: pNode[]; distance: number }[] = [];
    const visited: boolean[] = new Array(this.graph.length).fill(false);
    let bestPath: pNode[] = [];
    let bestDistance = Number.MAX_SAFE_INTEGER;

    // Add start node to stack
    stack.push({
      nodeIndex: startIndex,
      path: [this.nodes[startIndex]],
      distance: 0,
    });

    // Process stack until empty
    while (stack.length > 0) {
      // Get current state from stack
      const current = stack.pop()!;
      const currentIndex = current.nodeIndex;
      const currentPath = current.path;
      const currentDistance = current.distance;

      // Skip if already visited or if current distance is worse than best found
      if (visited[currentIndex] || currentDistance >= bestDistance) {
        continue;
      }

      // Mark as visited
      visited[currentIndex] = true;

      // If destination reached, update best path if better
      if (currentIndex === endIndex) {
        if (currentDistance < bestDistance) {
          bestDistance = currentDistance;
          bestPath = [...currentPath];
        }
        continue;
      }

      // Add unvisited neighbors to stack (in reverse order to maintain DFS behavior)
      const neighbors = this.nodes[currentIndex].neighboringNodes;
      for (let i = neighbors.length - 1; i >= 0; i--) {
        const neighbor = neighbors[i];

        if (!visited[neighbor.index]) {
          const edgeWeight = this.graph[currentIndex][neighbor.index];
          const newDistance = currentDistance + edgeWeight;

          // Only add to stack if this path isn't already worse than best found
          if (newDistance < bestDistance) {

            const newPath = [...currentPath, neighbor];

            // Update neighbor's pathfinding info (for distance calculation)
            neighbor.shortestDistance = newDistance;
            neighbor.previousNode = this.nodes[currentIndex];

            // Add to stack
            stack.push({
              nodeIndex: neighbor.index,
              path: newPath,
              distance: newDistance,
            });
          }
        }
      }
    }


    this.bestPath = bestPath;
    this.bestDistance = bestDistance;

    return bestPath;
  }

  /**
   * Get all nodes
   */
  getNodes(): pNode[] {
    return this.nodes;
  }

  /**
   * Find the path to the end location
   */
  findPath(endLocation: string): pNode[] {
    // Get end index
    this.endIndex = this.getIndex(endLocation);

    // Return empty path if invalid locations
    if (this.startIndex === -1 || this.endIndex === -1) {
      return [];
    }

    // Perform iterative DFS to find best path
    return this.dfsIterative(this.startIndex, this.endIndex);
  }

  // Measure the total distance of the path
  measurePathDistance(endLocation: string): number {
    const path = this.findPath(endLocation);
    return path.length > 0 ? this.bestDistance : 0;
  }

  // Measure the distances between edges in the path
  measureEdgeDistances(endLocation: string): number[] {
    const path = this.findPath(endLocation);
    const distances: number[] = [];

    for (let i = 1; i < path.length; i++) {
      const current = path[i];
      const previous = path[i - 1];
      distances.push(this.graph[previous.index][current.index]);
    }

    return distances;
  }
}
