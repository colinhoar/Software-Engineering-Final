import express, { Router, Request, Response } from "express";
import { NodeDataType } from "./jsonTypes.ts";

// Node and Edge import statements
import { pNode } from "./pNode.ts";
import { getGraph, getNodes } from "./pathfindingDBHelpers.ts";
import { getProtectedNodes } from "./protectedPathNames.ts";

class AllNodeData {
  private nodeData: NodeDataType[];
  private graph: number[][];

  private constructor() {
    this.nodeData = [];
    this.graph = [];
  }

  public static createAsync = async (map: string) => {
    const thisNodeEditing = new AllNodeData();
    thisNodeEditing.nodeData = await getNodes(map);
    const graph = await getGraph(map);
    if (graph) {
      thisNodeEditing.graph = graph.matrix as number[][];
    }

    return thisNodeEditing;
  };

  // Store all nodes in one easily accessible array
  public nodes: pNode[] = [];

  // Implement BFS search using Dijkstra's Algorithm
  public findNeighbors(mainNodeIdx: number): pNode[] {
    let neighbors: pNode[] = [];

    for (let j = 0; j < this.graph.length; j++) {
      if (this.graph[mainNodeIdx][j] != 0) {
        neighbors.push(this.nodes[j]);
      }
    }

    return neighbors;
  }

  public initializeNodes(): void {
    // Initialize all other nodes
    for (let i = 0; i < this.graph.length; i++) {
      this.nodes[i] = new pNode(
        this.nodeData,
        i,
        Number.MAX_SAFE_INTEGER,
        null,
      );
    }

    // Find node neighbors and add to priorityQueue
    for (let i = 0; i < this.graph.length; i++) {
      this.nodes[i].neighboringNodes = this.findNeighbors(i);
    }
  }

  public getNodes(floorLocation: number): pNode[] {
    return this.nodes.filter((node) => node.floor === floorLocation);
  }

  private getEdges(node: pNode, floorLocation: number): number[][] {
    return node.neighboringNodes
      .filter((nF) => nF.floor === floorLocation)
      .map((nM) => [...node.coords, ...nM.coords]);
  }

  private uniqueEdge(edges: number[][], nEdge: number[]): boolean {
    for (const edge of edges) {
      if (
        edge[0] === nEdge[0] &&
        edge[1] === nEdge[1] &&
        edge[2] === nEdge[2] &&
        edge[3] === nEdge[3]
      ) {
        return false;
      } else if (
        edge[0] === nEdge[2] &&
        edge[1] === nEdge[3] &&
        edge[2] === nEdge[0] &&
        edge[3] === nEdge[1]
      ) {
        return false;
      }
    }

    return true;
  }

  public getAllEdges(nodes: pNode[], floorLocation: number): number[][] {
    let allEdges: number[][] = [];

    let indvEdges: number[][] = [];
    for (const node of nodes) {
      indvEdges.push(...this.getEdges(node, floorLocation));
      for (const edge of indvEdges) {
        if (this.uniqueEdge(allEdges, edge)) {
          allEdges.push(edge);
        }
      }
    }

    return allEdges;
  }
}

// Web page display
const router: Router = express.Router();
router.post("/", express.json(), async (req: Request, res: Response) => {
  let mapLocation: string = req.body.map;
  let floorLocation: number = req.body.floor;

  // Perform pathfinding
  let nE: AllNodeData = await AllNodeData.createAsync(mapLocation);
  nE.initializeNodes();
  let nodes = nE.getNodes(floorLocation);

  // Send path data back to front end display
  res.json({
    mapLocation: mapLocation,
    nodes: nodes.map((x) => x.displayName),
    indexes: nodes.map((x) => x.index),
    xCoords: nodes.map((x) => x.coords[0]),
    yCoords: nodes.map((x) => x.coords[1]),
    edges: nE.getAllEdges(nodes, floorLocation),
    protectedNodes: nodes
      .map((x) => x.index)
      .filter(
        (x, i) =>
          getProtectedNodes(mapLocation).indexOf(nodes[i].pathName) !== -1,
      ),
  });
});

export default router;
