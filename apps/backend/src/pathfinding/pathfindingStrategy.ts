import { NodeDataType } from "./jsonTypes";
import { pNode } from "./pNode";

/**
 * Strategy interface for diff pathfinding algorithms
 */
export interface PathfindingStrategy {
  initialize(
    nodeData: NodeDataType[],
    graph: number[][],
    startLocation: string,
  ): void;
  findPath(endLocation: string): pNode[];
  getNodes(): pNode[];
  measurePathDistance(endLocation: string): number;
  measureEdgeDistances(endLocation: string): number[];
}
