import {previewNodeType} from './nodeTypes.ts';
import {editingState} from './stateTypes.ts';

export interface TransitionProps {
    floor: number,
    mapLocation: string,
    startLocation: string,
    endLocation: string,
    algorithm: string,
    index: number,
    rotation: boolean,
    zoom?: boolean
}

export interface ViewEditProps {
    floor: number;
    mapLocation: string;
    selectedIDX: number;
    edgeIDXs: number[];
    removedEdgeIDXs: number[];
    tempNode: previewNodeType;
    updateCoord: (idx: number, id: string, x: number, y: number) => void;
    updateEdges: (idx: number, node: string) => void;
    updateProtected: (proc: boolean) => void;
    editState: editingState;
    zoom: number;
    viewBox: number[];
    setViewBox: (viewBox: number[]) => void;
}

export interface NodeViewEditDatatype {
    mapLocation: string;
    nodes: string[];
    indexes: number[];
    xCoords: number[];
    yCoords: number[];
    edges: number[][];
    protectedNodes: number[];
}

export interface NodePathfindingDatatype {
    mapLocation: string;
    startLocation: string;
    endLocation: string;
    displayNames: string[];
    pathNames: string[]
    nodeFloors: number[];
    totalDistance: number;
    edgeLengths: number[];
    coords: number[];
}

