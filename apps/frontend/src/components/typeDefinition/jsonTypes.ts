export interface TransitionProps {
    floor: number;
    mapLocation: string;
    startLocation: string;
    endLocation: string;
    Algorithm: string;
}

export interface ViewEditProps {
    floor: number;
    mapLocation: string;
    updateCoord: (id: string, x: number, y:number) => void;
}

export interface NodeViewEditDatatype {
    mapLocation: string,
    nodes: string[],
    indexes: number[],
    xCoords: number[],
    yCoords: number[],
    edges: number[][],
}

export interface NodePathfindingDatatype {
    mapLocation: string,
    startLocation: string,
    endLocation: string,
    //pathNames: string[],
    displayNames: string[],
    nodeFloors: number[],
    totalDistance: number,
    edgeLengths: number[],
    coords: number[],
}

export interface NodePathfindingDatatype {
    displayNames: string[];
    nodeFloors: number[];
    coords: number[];
}

export interface NodePathfindingDatatype {
    displayNames: string[];
    nodeFloors: number[];
    coords: number[];
}

