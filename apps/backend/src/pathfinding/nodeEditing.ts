import express, { Router, Request, Response } from "express";
import {
  getGraph,
  addNode,
  editNode,
  deleteNode,
  editGraph,
  getAllPathNames,
  getAllxCoord,
  getAllyCoord,
} from "./pathfindingDBHelpers.ts";

function convertPXtoIN(mapLocation: string, px_len: number): number {
  switch (mapLocation) {
    case "Chestnut Hill Parking Lot":
      return px_len * 5.9;
    case "Chestnut Hill Hospital":
      return px_len * 3.4;
    case "Patriot Place Parking Lot":
      return px_len * 28;
    case "Patriot Place Hospital":
      return px_len * ((3 + 3.7) / 2);
    case "Faulkner-Belkin Hospital Map":
      return px_len * 3;
    case "Main Campus":
      return px_len * 4.2;
    default:
      return 0;
  }
}

const router: Router = express.Router();

router.post("/edit", express.json(), async (req: Request, res: Response) => {
  let mapLocation: string = req.body.map;
  let idx: number = req.body.index;
  let displayName: string = req.body.displayName;
  let floorLocation: number = req.body.floorLocation;
  let xCoord: number = req.body.xCoord;
  let yCoord: number = req.body.yCoord;

  await editNode(mapLocation, idx, displayName, floorLocation, xCoord, yCoord);

  res.sendStatus(200);
});

router.post("/remove", express.json(), async (req: Request, res: Response) => {
  let mapLocation: string = req.body.map;
  let idx: number = req.body.index;
  let floorLocation: number = req.body.floorLocation;

  let realGraph: number[][] = [];
  const graph = await getGraph(mapLocation);
  if (graph) {
    realGraph = graph.matrix as number[][];
  }

  // Remove graph index
  for (let i = 0; i < realGraph.length; i++) {
    realGraph[i].splice(idx, 1);
  }
  realGraph.splice(idx, 1);

  await deleteNode(mapLocation, idx, floorLocation);
  await editGraph(mapLocation, realGraph);

  res.sendStatus(200);
});

router.post("/add", express.json(), async (req: Request, res: Response) => {
  let mapLocation: string = req.body.map;
  let displayName: string = req.body.displayName;
  let floorLocation: number = req.body.floorLocation;
  let xCoord: number = req.body.xCoord;
  let yCoord: number = req.body.yCoord;

  const allPathNames = await getAllPathNames(mapLocation);
  function isUniquePathName(pathName: string) {
    for (const node of allPathNames) {
      if (node === pathName) {
        return false;
      }
    }
    return true;
  }

  let pathName: string = "";
  let counter = 1;
  while (!isUniquePathName(pathName)) {
    pathName = displayName + " " + counter;
    counter++;
  }

  let realGraph: number[][] = [];
  const graph = await getGraph(mapLocation);
  if (graph) {
    realGraph = graph.matrix as number[][];
  }

  // Add graph index
  for (let i = 0; i < realGraph.length; i++) {
    realGraph[i].push(0);
  }
  realGraph.push(Array<number>(realGraph[0].length).fill(0));

  await editGraph(mapLocation, realGraph);
  const newIndex = await addNode(
    mapLocation,
    pathName,
    displayName,
    floorLocation,
    xCoord,
    yCoord,
  );

  console.log(newIndex);

  res.send("" + newIndex);
});

router.post(
  "/addEdges",
  express.json(),
  async (req: Request, res: Response) => {
    let mapLocation: string = req.body.map;
    let index: number = req.body.index;
    let edgeIndexes: number[] = req.body.edgeIndexes;

    // Get adjacency matrix
    let realGraph: number[][] = [];
    const graph = await getGraph(mapLocation);
    if (graph) {
      realGraph = graph.matrix as number[][];
    }

    // Get all relevant x and y coordinates
    const newNodeX: number[] = await getAllxCoord(mapLocation, [index]); // Get X Coord of main node
    const newNodeY: number[] = await getAllyCoord(mapLocation, [index]); // Get Y Coord of main node
    const edgeNodesX: number[] = await getAllxCoord(mapLocation, edgeIndexes); // Get X Coords of connecting nodes
    const edgeNodesY: number[] = await getAllyCoord(mapLocation, edgeIndexes); // Get Y Coords of connecting nodes

    // Add edge distances
    for (let i = 0; i < edgeIndexes.length; i++) {
      // Distance is in pixels and needs to be converted to inches
      const distance: number = Math.sqrt(
        Math.pow(edgeNodesX[i] - newNodeX[0], 2) +
          Math.pow(edgeNodesY[i] - newNodeY[0], 2),
      );
      realGraph[edgeIndexes[i]][index] = convertPXtoIN(mapLocation, distance);
      realGraph[index][edgeIndexes[i]] = convertPXtoIN(mapLocation, distance);
    }

    await editGraph(mapLocation, realGraph);

    res.sendStatus(200);
  },
);

router.post(
  "/remEdges",
  express.json(),
  async (req: Request, res: Response) => {
    let mapLocation: string = req.body.map;
    let index: number = req.body.index;
    let edgeIndexes: number[] = req.body.edgeIndexes;

    // Get adjacency matrix
    let realGraph: number[][] = [];
    const graph = await getGraph(mapLocation);
    if (graph) {
      realGraph = graph.matrix as number[][];
    }

    // Remove edge distances
    for (let i = 0; i < edgeIndexes.length; i++) {
      // Distance is in pixels and needs to be converted to inches
      realGraph[edgeIndexes[i]][index] = 0;
      realGraph[index][edgeIndexes[i]] = 0;
    }

    await editGraph(mapLocation, realGraph);

    res.sendStatus(200);
  },
);

export default router;
