import { NodeDataType } from "./jsonTypes.ts";

export class pNode {
  // Dijkstra's Algorithm Information
  index: number;
  shortestDistance: number;
  previousNode: pNode | null;
  neighboringNodes: pNode[];

  // Path Drawing Information
  pathName: string;
  displayName: string;
  floor: number;
  coords: number[];

  public constructor(nodeData: any, idx: number, sD: number, pN: pNode | null) {
    this.index = idx;
    this.shortestDistance = sD;
    this.previousNode = pN;
    this.neighboringNodes = [];

    // Get JSON data
    let jsonNodeData: NodeDataType = nodeData[this.index];
    this.pathName = jsonNodeData.pathName;
    this.displayName = jsonNodeData.displayName;
    this.floor = jsonNodeData.floor;
    this.coords = [jsonNodeData.xCoord, jsonNodeData.yCoord];
  }
}
