import { ICompare, PriorityQueue } from "@datastructures-js/priority-queue";
import { NodeDataType } from "./jsonTypes";
import { pNode } from "./pNode";
import { PathfindingStrategy } from "./pathfindingStrategy";

export class DijkstraStrategy implements PathfindingStrategy {
  // Store all nodes in one easily accessible array
  private nodes: pNode[] = [];
  private nodeData: NodeDataType[] = [];
  private graph: number[][] = [];

  // Priority Queue
  private compareNodes: ICompare<pNode> = (a: pNode, b: pNode) => {
    if (a.shortestDistance > b.shortestDistance) {
      return 1;
    } else if (a.shortestDistance < b.shortestDistance) {
      return -1;
    } else {
      return 0;
    }
  };

  // Now use compareNodes after it's defined
  private priorityQueue = new PriorityQueue<pNode>(this.compareNodes);

  initialize(
    nodeData: NodeDataType[],
    graph: number[][],
    startLocation: string,
  ): void {
    this.nodeData = nodeData;
    this.graph = graph;
    this.findAllShortestPaths(startLocation);
  }

  private getIndex(location: string): number {
    console.log(location);
    return this.nodeData.find((x) => {
      return x.pathName == location;
    })?.index!;
  }

  private updateQueueNode = (
    pQ: PriorityQueue<pNode>,
    node: pNode,
  ): PriorityQueue<pNode> => {
    let tempPQ: PriorityQueue<pNode> = new PriorityQueue<pNode>(
      this.compareNodes,
    );

    while (!pQ.isEmpty()) {
      let tempNode: pNode = <pNode>pQ.pop();
      // Add original node
      if (tempNode.index !== node.index) {
        tempPQ.push(tempNode);
      }
      // Add edited node containing new values
      else {
        tempPQ.push(node);
      }
    }

    return tempPQ;
  };

  private findNeighbors(mainNodeIdx: number): pNode[] {
    let neighbors: pNode[] = [];

    for (let j = 0; j < this.graph.length; j++) {
      if (this.graph[mainNodeIdx][j] != 0) {
        neighbors.push(this.nodes[j]);
      }
    }

    return neighbors;
  }

  private initializeNodes(startingNode: number): void {
    this.nodes[startingNode] = new pNode(this.nodeData, startingNode, 0, null);

    for (let i = 0; i < this.graph.length; i++) {
      if (i != startingNode) {
        this.nodes[i] = new pNode(
          this.nodeData,
          i,
          Number.MAX_SAFE_INTEGER,
          null,
        );
      }
    }

    // Find node neighbors and add to priorityQueue
    for (let i = 0; i < this.graph.length; i++) {
      this.nodes[i].neighboringNodes = this.findNeighbors(i);
      this.priorityQueue.push(this.nodes[i]);
    }
  }

  private findAllShortestPaths(startLocation: string): void {
    // Create Node objects for all nodes
    let startingNode = this.getIndex(startLocation);
    this.initializeNodes(startingNode);

    while (!this.priorityQueue.isEmpty()) {
      let uNode: pNode = <pNode>this.priorityQueue.pop();
      for (let vNode of uNode.neighboringNodes) {
        let altDistance: number =
          uNode.shortestDistance + this.graph[uNode.index][vNode.index];
        if (altDistance < vNode.shortestDistance) {
          vNode.previousNode = uNode;
          vNode.shortestDistance = altDistance;
          this.priorityQueue = this.updateQueueNode(this.priorityQueue, vNode);
        }
      }
    }
  }

  getNodes(): pNode[] {
    return this.nodes;
  }

  private getPath(node: pNode): pNode[] {
    if (node.previousNode == null) {
      let path: pNode[] = [];
      path.push(node);
      return path;
    } else {
      let path: pNode[] = this.getPath(node.previousNode);
      path.unshift(node);
      return path;
    }
  }


  findPath(endLocation: string): pNode[] {
    return this.getPath(this.nodes[this.getIndex(endLocation)]).reverse();
  }

  measurePathDistance(endLocation: string): number {
    let finalPath = this.findPath(endLocation);
    let totalDistance = 0;

    for (const pN of finalPath) {
      totalDistance += pN.shortestDistance;
    }

    return totalDistance;
  }

  measureEdgeDistances(endLocation: string): number[] {
    let finalPath: pNode[] = this.findPath(endLocation);
    let distances: number[] = [];

    for (let i = 1; i < finalPath.length; i++) {
      distances.push(
        finalPath[i].shortestDistance - finalPath[i - 1].shortestDistance,
      );
    }

    return distances;
  }
}
