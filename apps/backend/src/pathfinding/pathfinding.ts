import express, { Router, Request, Response } from "express";
import { NodeDataType, NodePathfindingDatatype } from "./jsonTypes.ts";
import { PathfindingStrategy } from "./pathfindingStrategy";
import { DijkstraStrategy } from "./dijkstra.ts";
import { DepthFirst } from "./depthFirst.ts";
import {
  getAlgorithm,
  getGraph,
  getNodes,
  setAlgorithm,
} from "./pathfindingDBHelpers.ts";
import { pNode } from "./pNode.ts";

class Pathfinding {
  private nodeData: NodeDataType[];
  private graph: number[][];
  private strategy: PathfindingStrategy;

  private constructor(strategy: PathfindingStrategy) {
    this.nodeData = [];
    this.graph = [];
    this.strategy = strategy;
  }

  public static createAsync = async (map: string) => {
    let strategy: PathfindingStrategy;
    const algorithm = await getAlgorithm();
    // Select the appropriate strategy based on the algorithm parameter
    if (algorithm.toLowerCase() === "dfs") {
      strategy = new DepthFirst();
    } else {
      // Default to Dijkstra
      strategy = new DijkstraStrategy();
    }

    const thisPathfinding = new Pathfinding(strategy);
    thisPathfinding.nodeData = await getNodes(map);
    const graph = await getGraph(map);
    if (graph) {
      thisPathfinding.graph = graph.matrix as number[][];
    }

    return thisPathfinding;
  };


  public setStrategy(strategy: PathfindingStrategy): void {
    this.strategy = strategy;
  }


  public initializeStrategy(startLocation: string): void {
    this.strategy.initialize(this.nodeData, this.graph, startLocation);
  }


  public findPath(endLocation: string): pNode[] {
    return this.strategy.findPath(endLocation);
  }


  public getNodes() {
    return this.strategy.getNodes();
  }


  public measurePathDistance(endLocation: string): number {
    return this.strategy.measurePathDistance(endLocation);
  }


  public measureEdgeDistances(endLocation: string): number[] {
    return this.strategy.measureEdgeDistances(endLocation);
  }
}

// Web page display
const router: Router = express.Router();

router.post("/", express.json(), async (req: Request, res: Response) => {
  let mapLocation: string = req.body.map;
  let startLocation: string = req.body.start;
  let endLocation: string = req.body.end;
  let algorithm: string = req.body.algorithm || "dijkstra"; // Optional algorithm parameter

  // Perform pathfinding
  let pf: Pathfinding = await Pathfinding.createAsync(mapLocation);
  pf.initializeStrategy(startLocation);
  let path = pf.findPath(endLocation);

  // Send path data back to front end display
  res.json(<NodePathfindingDatatype>{
    mapLocation: mapLocation,
    startLocation: startLocation,
    endLocation: endLocation,
    algorithm: algorithm,
    displayNames: path.map((x: pNode) => x.displayName),
    pathNames: path.map((x: pNode) => x.pathName),
    nodeFloors: path.map((x: pNode) => x.floor),
    totalDistance: pf.measurePathDistance(endLocation),
    edgeLengths: pf.measureEdgeDistances(endLocation),
    coords: path.flatMap((x: pNode) => x.coords),
  });
});

// New endpoint
router.post("/algorithm", express.json(), (req, res) => {
  const { algorithm } = req.body;
  if (algorithm !== "dfs" && algorithm !== "dijkstra") {
    res.status(400).json({ error: "Invalid algorithm type" });
  } else {
    setAlgorithm(algorithm)
      .then(() => {
        res.json({ success: true });
      })
      .catch((error) => {
        console.error("Error setting algorithm:", error);
        res.status(500).json({ error: "Failed to set algorithm" });
      });
  }
});

export default router;
