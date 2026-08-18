export interface NodeDataType {
  index: number;
  pathName: string;
  displayName: string;
  floor: number;
  xCoord: number;
  yCoord: number;
}

export interface NodePathfindingDatatype {
  mapLocation: string;
  startLocation: string;
  endLocation: string;
  displayNames: string[];
  pathNames: string[];
  nodeFloors: number[];
  totalDistance: number;
  edgeLengths: number[];
  coords: number[];
}
