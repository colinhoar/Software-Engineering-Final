import React, { useEffect, useState } from 'react';
import { ViewEditProps, NodeViewEditDatatype } from '../typeDefinition/jsonTypes.ts';
import { editingState } from '../typeDefinition/stateTypes.ts';
import { mapSizes } from './mapSizes.ts';

// Import map images
import chestnutParking from '/assets/chestnut_maps/chestnut-parking.png';
import chestnutHospital from '/assets/chestnut_maps/chestnut-floorone.png';
import patriotParking from '/assets/patriot_maps/patriot-parking.webp';
import patriot20FloorOne from '/assets/patriot_maps/patriot-20-floorone.png';
import patriot22FloorOne from '/assets/patriot_maps/patriot-22-floorone.png';
import patriot22FloorThree from '/assets/patriot_maps/patriot-22-floorthree.png';
import patriot22FloorFour from '/assets/patriot_maps/patriot-22-floorfour.png';
import faulknerBelkin from '/assets/faulkner_belkin_map/faulkner-belkin.png';
import mainCampus from '/assets/main_campus_map/BWHMainCampus_Edit.png';

// Map color constants
const pathColor = '#475B5D';
const nodeColor = '#F2CD88';
const selectedEdgeColor = '#DB9071'
const selectedNodeColor = '#C45259';
const deselectedNodeColor = '#B5BDBE'

const getPath = async (mapLocation: string, floorLocation: number): Promise<NodeViewEditDatatype> => {
  const body = { map: mapLocation, floor: floorLocation };

  const response = await fetch('/api/allnodedata', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return await response.json();
}

function convertMapLocation(props: ViewEditProps): string {
  if (props.mapLocation === "chestnut_hill") {
    return (props.floor === 0) ? 'Chestnut Hill Parking Lot' : 'Chestnut Hill Hospital';
  }
  else if (props.mapLocation === "patriot_place") {
    switch (props.floor) {
      case 0:
        return 'Patriot Place Parking Lot';
      case 1: case 2: case 3: case 4:
        return 'Patriot Place Hospital';
      default:
        return '';
    }
  }
  else if (props.mapLocation === "faulkner-belkin") {
    return 'Faulkner-Belkin Hospital Map';
  }
  else {
    return 'Main Campus';
  }
}

export default function ViewEdit_Maps(props: ViewEditProps) {
  const [loadingJSON, setLoadingJSON] = useState<boolean>(true);
  const [mapJSON, setMapJSON] = useState<NodeViewEditDatatype>();

  const [scale, setScale] = useState<number>(1);

  const [startPoint, setStartPoint] = useState<number[]>([0,0]);
  const [endPoint, setEndPoint] = useState<number[]>([0,0]);

  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isOutOfBounds, setOutOfBounds] = useState<boolean>(false);

  useEffect(() => {
    setScale(props.zoom);
  }, [props.zoom]);

  function drawAllNodeEdges(props: ViewEditProps, selectedJSON: NodeViewEditDatatype) {
    let map;
    let imgHeight: number = 0;
    let imgWidth: number = 0;
    let stroke: number, radius: number;
    let bg_color: string = "#ffffff";
    if (props.mapLocation === "chestnut_hill") {
      switch (props.floor) {
        case 0:
          map = chestnutParking;
          imgWidth = mapSizes.chestnutParkingImgWidth;
          imgHeight = mapSizes.chestnutParkingImgHeight;
          stroke = 2; radius = 6;
          break;
        case 1:
          map = chestnutHospital;
          imgWidth = mapSizes.chestnutHospitalImgWidth;
          imgHeight = mapSizes.chestnutHospitalImgHeight;
          stroke = 2; radius = 6;
          break;
      }
    }
    else if (props.mapLocation === "patriot_place") {
      switch (props.floor) {
        case 0:
          map = patriotParking;
          imgWidth = mapSizes.patriotParkingImgWidth;
          imgHeight = mapSizes.patriotParkingImgHeight;
          stroke = 2; radius = 6;
          break;
        case 1:
          map = patriot20FloorOne;
          imgWidth = mapSizes.patriot20FloorOneImgWidth;
          imgHeight = mapSizes.patriot20FloorOneImgHeight;
          stroke = 2; radius = 6;
          break;
        case 2:
          map = patriot22FloorOne;
          imgWidth = mapSizes.patriot22FloorOneImgWidth;
          imgHeight = mapSizes.patriot22FloorOneImgHeight;
          stroke = 2; radius = 6;
          break;
        case 3:
          map = patriot22FloorThree;
          imgWidth = mapSizes.patriot22FloorThreeImgWidth;
          imgHeight = mapSizes.patriot22FloorThreeImgHeight;
          stroke = 2; radius = 6;
          break;
        case 4:
          map = patriot22FloorFour;
          imgWidth = mapSizes.patriot22FloorFourImgWidth;
          imgHeight = mapSizes.patriot22FloorFourImgHeight;
          stroke = 2; radius = 6;
          break;
      }
    }
    else if (props.mapLocation === 'faulkner-belkin') {
      map = faulknerBelkin;
      imgWidth = mapSizes.faulknerBelkinImgWidth;
      imgHeight = mapSizes.faulknerBelkinImgHeight;
      stroke = 2; radius = 5;
    }
    else {
      map = mainCampus;
      imgWidth = mapSizes.mainCampusImgWidth;
      imgHeight = mapSizes.mainCampusImgHeight;
      stroke = 2; radius = 3;
    }

    return (
      <>
        <div className={`flex relative`}>
          <div id="boundingBox" className={`overscroll-contain w-full h-full`} style = {{boxShadow: 'inset 0 0 20px rgb(0 0 0 / 0.05)'}}
               onMouseDown={(e) => onDownPan(e)}
               onMouseUp={(e) => {handleNodeMouseRelease(e); onUpPan(e);}}
               onMouseMove ={(e) => {handleNodeMouseDrag(e, props, selectedJSON); onMovePan(e);}}
               onMouseLeave={(e) => onLeavePan(e)}
               // onWheel={(e) => {onScroll(e, props, imgWidth)}}
          >
            <svg className={`top-0 ${props.editState === editingState.addNode && !isOutOfBounds ? 'cursor-crosshair' : props.editState === editingState.editNode && isDragging ? 'cursor-grabbing' : 'cursor-move'}`}
                 id="floor1"
                 viewBox={`${props.viewBox[0]} ${props.viewBox[1]} ${props.viewBox[2]} ${props.viewBox[3]}`}
                 xmlns="http://www.w3.org/2000/svg"
                 onMouseDown={(e) => handleNodeMouseSelect(e, props, selectedJSON, imgWidth, imgHeight)}
                 onMouseMove={(e) => checkOOB(e, imgWidth, imgHeight)}
                 href={props.mapLocation}
            >
              <image width={imgWidth} height={imgHeight} href={map} />
              <g id="edges"> {[...Array(selectedJSON.edges.length).keys()].map((idx) => <polyline id={''+idx} key={'p'+idx} points={'' + selectedJSON.edges[idx][0] + ',' + selectedJSON.edges[idx][1] + ' ' + selectedJSON.edges[idx][2] + ',' + selectedJSON.edges[idx][3]} style={{fill: 'none', stroke: pathColor, strokeWidth: '1.5', strokeDasharray: (changeEdge(idx) ? '3' : '')}}/>)} </g>
              <g id="tempEdges"> {[...props.edgeIDXs].map((idx) => (hasEdge(idx) ? null : <polyline id={''+idx} key={'pTemp'+idx} points={'' + mapJSON!.xCoords[idx] + ',' + mapJSON!.yCoords[idx] + ' ' + mapJSON!.xCoords[props.selectedIDX] + ',' + mapJSON!.yCoords[props.selectedIDX]} style={{fill: 'none', stroke: pathColor, strokeWidth: '1.5', strokeDasharray: '6'}}/>))} </g>
              <g id="nodes" className={`${props.editState === editingState.editNode ? 'cursor-grab' : props.editState === editingState.addNode ? '' : 'cursor-pointer'}`}> {[...Array(selectedJSON.nodes.length).keys()].map((idx) => selectedJSON.xCoords[idx] !== -1 ? <circle id={''+selectedJSON.indexes[idx]} key={'c'+idx} cx={selectedJSON.xCoords[idx]} cy={selectedJSON.yCoords[idx]} r={props.edgeIDXs.indexOf(selectedJSON.indexes[idx]) !== -1 || props.selectedIDX === idx ? radius+1 : radius} filter={"drop-shadow(2px 2px 2px rgba(0, 0, 0, .5))"} stroke={"#475b5d"} strokeWidth={stroke} strokeOpacity={"0.7"} fill={props.selectedIDX === selectedJSON.indexes[idx] ? selectedNodeColor : (props.edgeIDXs.indexOf(selectedJSON.indexes[idx]) !== -1 &&!hasEdge(selectedJSON.indexes[idx])) ? selectedEdgeColor : props.edgeIDXs.indexOf(selectedJSON.indexes[idx]) !== -1 ? selectedEdgeColor : (props.removedEdgeIDXs.indexOf(selectedJSON.indexes[idx]) !== -1 && hasEdge(selectedJSON.indexes[idx])) ? deselectedNodeColor : nodeColor}/> : null)} </g>
            </svg>
          </div>
        </div>
      </>
    );
  }

  // Edit Event Listeners
  const handleNodeMouseSelect = (e: React.MouseEvent, props: ViewEditProps, selectedJSON: NodeViewEditDatatype, imgWidth: number, imgHeight: number) => {
    e.preventDefault();
    const clickedTarget = e.target as HTMLInputElement;
    const parentSVG = e.currentTarget as SVGSVGElement;
    const pt = parentSVG.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursor = pt.matrixTransform(parentSVG.getScreenCTM()!.inverse());

    if (props.editState === editingState.addNode) {
      if (Math.round(cursor.x) >= 0 && Math.round(cursor.y) >= 0 && Math.round(cursor.x) <= imgWidth && Math.round(cursor.y) <= imgHeight) {
        props.updateCoord(-1, "New Node", Math.round(cursor.x), Math.round(cursor.y));
      }
    }
    else if (clickedTarget.tagName === 'circle') {
      const actualIndex: number = +clickedTarget.getAttribute("id")!;
      const circleIndex: number = selectedJSON.indexes.indexOf(actualIndex);

      if (props.editState === editingState.editNode) {
        setIsDragging(true);
        setIsPanning(false);
      }

      props.updateProtected(selectedJSON.protectedNodes.indexOf(actualIndex) !== -1);
      if (props.editState === editingState.addEdges) {
        props.updateEdges(actualIndex, selectedJSON.nodes[circleIndex])
      }
      else {
        props.updateCoord(actualIndex, selectedJSON.nodes[circleIndex], +clickedTarget.getAttribute("cx")!, +clickedTarget.getAttribute("cy")!);
      }
    }
  }

  const handleNodeMouseDrag = (e: React.MouseEvent, props: ViewEditProps, selectedJSON: NodeViewEditDatatype) => {
    e.preventDefault();
    const parentSVG = e.currentTarget.firstChild as SVGSVGElement;
    const pt = parentSVG.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursor = pt.matrixTransform(parentSVG.getScreenCTM()!.inverse());

    if (isDragging && !isOutOfBounds) {
      setIsPanning(false);

      props.updateCoord(props.selectedIDX, selectedJSON.nodes[selectedJSON.indexes.indexOf(props.selectedIDX)], Math.round(cursor.x), Math.round(cursor.y));
    }
  }

  const handleNodeMouseRelease = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }

  // Panning Event Listeners
  function onMovement(e: React.MouseEvent) {
    setEndPoint([e.movementX, e.movementY]);

    const dx = (startPoint[0] - endPoint[0]) / scale;
    const dy = (startPoint[1] - endPoint[1]) / scale;

    const newViewX = props.viewBox[0] + dx;
    const newViewY = props.viewBox[1] + dy;

    props.setViewBox([newViewX, newViewY, props.viewBox[2], props.viewBox[3]]);
  }

  function onDownPan(e: React.MouseEvent) {
    e.preventDefault();
    if (!isDragging) {
      setIsPanning(true);
    }
    setStartPoint([e.movementX, e.movementY]);
  }

  function onUpPan(e: React.MouseEvent) {
    e.preventDefault();
    if (isPanning) {
      onMovement(e);
      setIsPanning(false);
    }
  }

  function onMovePan(e: React.MouseEvent) {
    e.preventDefault();
    if (isPanning) {
      onMovement(e);
    }
  }

  function onLeavePan(e: React.MouseEvent) {
      e.preventDefault();
      setIsPanning(false);
      setIsDragging(false);
  }

  // General Event Listeners
  function onScroll(e: React.WheelEvent, props: ViewEditProps, imgWidth: number) {
    if (Math.sign(e.deltaY) > 0 ? (scale <= 4) : (scale >= 1)) {
      const w = props.viewBox[2];
      const h = props.viewBox[3];
      const dw = w * Math.sign(e.deltaY) * 0.1;
      const dh = h * Math.sign(e.deltaY) * 0.1;
      props.setViewBox([props.viewBox[0], props.viewBox[1], props.viewBox[2] - dw, props.viewBox[3] - dh]);
      setScale(imgWidth / (props.viewBox[2] - dw));
    }
  }

  function checkOOB(e: React.MouseEvent, imgWidth: number, imgHeight: number) {
    e.preventDefault();
    const parentSVG = e.currentTarget as SVGSVGElement;
    const pt = parentSVG.createSVGPoint()
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursor = pt.matrixTransform(parentSVG.getScreenCTM()!.inverse());

    if ((props.editState === editingState.addNode || props.editState === editingState.editNode) && (Math.round(cursor.x) >= 0 && Math.round(cursor.y) >= 0 && Math.round(cursor.x) <= imgWidth && Math.round(cursor.y) <= imgHeight)) {
      setOutOfBounds(false);
    }
    else {
      setOutOfBounds(true);
    }
  }
  
  // Draw Functions
  function changeEdge(index: number): boolean {
    for (let i = 0; i < mapJSON!.indexes.length; i++) {
      if ((mapJSON!.xCoords[i] === mapJSON!.edges[index][0] && mapJSON!.yCoords[i] === mapJSON!.edges[index][1] && mapJSON!.xCoords[props.selectedIDX] === mapJSON!.edges[index][2] && mapJSON!.yCoords[props.selectedIDX] === mapJSON!.edges[index][3]
      || mapJSON!.xCoords[i] === mapJSON!.edges[index][2] && mapJSON!.yCoords[i] === mapJSON!.edges[index][3] && mapJSON!.xCoords[props.selectedIDX] === mapJSON!.edges[index][0] && mapJSON!.yCoords[props.selectedIDX] === mapJSON!.edges[index][1])
      && props.removedEdgeIDXs.indexOf(i) !== -1) { return true; }
    }

    return false;
  }

  function hasEdge(index: number): boolean {
    for (let i = 0; i < mapJSON!.edges.length; i++) {
      if (mapJSON!.xCoords[index] === mapJSON!.edges[i][0] && mapJSON!.yCoords[index] === mapJSON!.edges[i][1] && mapJSON!.xCoords[props.selectedIDX] === mapJSON!.edges[i][2] && mapJSON!.yCoords[props.selectedIDX] === mapJSON!.edges[i][3]
          || mapJSON!.xCoords[index] === mapJSON!.edges[i][2] && mapJSON!.yCoords[index] === mapJSON!.edges[i][3] && mapJSON!.xCoords[props.selectedIDX] === mapJSON!.edges[i][0] && mapJSON!.yCoords[props.selectedIDX] === mapJSON!.edges[i][1]) {
        return true;
      }
    }

    return false;
  }

  useEffect(() => {
     setLoadingJSON(true);
    getPath(convertMapLocation(props), props.floor)
      .then((json) => {
        setMapJSON(json);
        setLoadingJSON(false);
      })
  }, [props.floor, props.editState]);

  // Adds all connected edges
  useEffect(() => {
    if (mapJSON !== undefined && props.editState === editingState.addEdges) {
      for (const edge of mapJSON.edges) {
        if (edge[0] === mapJSON.xCoords[props.selectedIDX] && edge[1] === mapJSON.yCoords[props.selectedIDX]) {
          const edgeIDX = mapJSON.indexes.filter((_, i) => edge[2] === mapJSON.xCoords[i] && edge[3] === mapJSON.yCoords[i])[0];
          props.updateEdges(edgeIDX, mapJSON.nodes[edgeIDX])
        }
        else if (edge[2] === mapJSON.xCoords[props.selectedIDX] && edge[3] === mapJSON.yCoords[props.selectedIDX]) {
          const edgeIDX = mapJSON.indexes.filter((_, i) => edge[0] === mapJSON.xCoords[i] && edge[1] === mapJSON.yCoords[i])[0]
          props.updateEdges(edgeIDX, mapJSON.nodes[edgeIDX])
        }
      }
    }

    // Snap back on add or edit mode

  }, [props.editState]);

  // Add preview node when adding or editing a node
  useEffect(() => {
    if (mapJSON !== undefined && props.tempNode.xCoord !== -1 && props.tempNode.yCoord !== -1 && (props.editState === editingState.addNode || props.editState === editingState.editNode)) {
      const cloneJSON: NodeViewEditDatatype = JSON.parse(JSON.stringify(mapJSON));

      if (mapJSON.indexes.indexOf(props.tempNode.index) !== -1) { // Node Editing
        const editingIDX: number = mapJSON!.indexes.indexOf(props.tempNode.index)
        cloneJSON.edges = cloneJSON.edges.map((edge: number[]) =>
          (edge[0] === cloneJSON.xCoords[editingIDX] && edge[1] === cloneJSON.yCoords[editingIDX])
          ? [props.tempNode.xCoord, props.tempNode.yCoord, edge[2], edge[3]]
          : (edge[2] === cloneJSON.xCoords[editingIDX] && edge[3] === cloneJSON.yCoords[editingIDX])
            ? [edge[0], edge[1], props.tempNode.xCoord, props.tempNode.yCoord]
            : edge
        )
        cloneJSON.xCoords[editingIDX] = props.tempNode.xCoord;
        cloneJSON.yCoords[editingIDX] = props.tempNode.yCoord;
      }
      else { // Node Adding
        cloneJSON.nodes = [...cloneJSON.nodes, ''];
        cloneJSON.indexes = [...cloneJSON.indexes, props.tempNode.index];
        cloneJSON.xCoords = [...cloneJSON.xCoords, props.tempNode.xCoord];
        cloneJSON.yCoords = [...cloneJSON.yCoords, props.tempNode.yCoord];
      }
      setMapJSON(cloneJSON);
    }
  }, [props.tempNode]);

  // While waiting on server response, render empty maps
  if (loadingJSON && mapJSON === undefined) {
      let currLocation = 'chestnut_hill';
      const currLocationJSON = localStorage.getItem('selectedLocation')
      if (currLocationJSON){
          currLocation = JSON.parse(currLocationJSON)
      }
    return (
      <>
        <div className={`grow grid grid-cols-1 justify-center pb-5 pt-5`}>
          {currLocation === 'chestnut_hill' ? (
            props.floor === 0 ? ( // Empty maps so swapping is smooth
              <div className="row-start-1 col-start-1">
                <div className={`flex justify-center relative`}>
                  <img
                    className={`ease-in max-h-[${mapSizes.chestnutParkingImgHeight}px] max-w-[${mapSizes.chestnutParkingImgWidth}px]`}
                    src={chestnutParking}
                    alt="chestnutgarage"
                  />
                  <img
                    className={`ease-out top-0 max-h-[800px] max-w-[745px] absolute`}
                    src={chestnutHospital}
                    alt="firstfloor"
                  />
                </div>
              </div>
            ) : (
              <div className="row-start-1 col-start-1">
                <div className={`flex justify-center relative`}>
                  <img
                    className={`ease-out top-0 max-h-[800px] max-w-[745px] absolute`}
                    src={chestnutParking}
                    alt="chestnutgarage"
                  />
                  <img
                    className={`ease-in max-h-[${mapSizes.chestnutHospitalImgHeight}px] max-w-[${mapSizes.chestnutHospitalImgWidth}px]`}
                    src={chestnutHospital}
                    alt="firstfloor"
                  />
                </div>
              </div>
            )
          ) : currLocation === 'patriot_place' ? (
            props.floor === 0 ? (
              <div className="row-start-1 col-start-1">
                <div className={`flex justify-center relative`}>
                  <img
                    className={`max-h-[${mapSizes.patriotParkingImgHeight}px] max-w-[${mapSizes.patriotParkingImgWidth}px]`}
                    src={patriotParking}
                    alt="patriotParking"
                  />
                </div>
              </div>
            ) : props.floor === 1 ? (
              <div className="row-start-1 col-start-1">
                <div className={`flex justify-center relative`}>
                  <img
                    className={`max-h-[${mapSizes.patriot20FloorOneImgHeight}px] max-w-[${mapSizes.patriot20FloorOneImgWidth}px]`}
                    src={patriot20FloorOne}
                    alt="20patriotFloorOne"
                  />
                </div>
              </div>
            ) : props.floor === 2 ? (
              <div className="row-start-1 col-start-1">
                <div className={`flex justify-center relative`}>
                  <img
                    className={`max-h-[${mapSizes.patriot22FloorOneImgHeight}px] max-w-[${mapSizes.patriot22FloorOneImgWidth}px]`}
                    src={patriot22FloorOne}
                    alt="22patriotFloorOne"
                  />
                </div>
              </div>
            ) : props.floor === 3 ? (
              <div className="row-start-1 col-start-1">
                <div className={`flex justify-center relative`}>
                  <img
                    className={`max-h-[${mapSizes.patriot22FloorThreeImgHeight}px] max-w-[${mapSizes.patriot22FloorThreeImgWidth}px]`}
                    src={patriot22FloorThree}
                    alt="22patriotFloorThree"
                  />
                </div>
              </div>
            ) : props.floor === 4 ? (
              <div className="row-start-1 col-start-1">
                <div className={`flex justify-center relative`}>
                  <img
                    className={`max-h-[${mapSizes.patriot22FloorFourImgHeight}px] max-w-[${mapSizes.patriot22FloorFourImgWidth}px]`}
                    src={patriot22FloorFour}
                    alt="22patriotFloorFour"
                  />
                </div>
              </div>
            ) : null
          ) : currLocation === 'faulkner-belkin' ? (
            <div className="row-start-1 col-start-1">
              <div className={`flex justify-center relative`}>
                <img
                  className={`max-h-[${mapSizes.faulknerBelkinImgHeight}px] max-w-[${mapSizes.faulknerBelkinImgWidth}px]`}
                  src={faulknerBelkin}
                  alt="faulknerBelkin"
                />
              </div>
            </div>
          ) : (
            <div className="row-start-1 col-start-1">
              <div className={`flex justify-center relative`}>
                <img
                  className={`max-h-[${mapSizes.mainCampusImgHeight}px] max-w-[${mapSizes.mainCampusImgWidth}px]`}
                  src={mainCampus}
                  alt="mainCampus"
                />
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
      <>
          <div className={`grow grid grid-cols-1 justify-center pb-5 pt-5 flex`}>
              <div className={`relative row-start-1 col-start-1 ml-35`}>
                  { drawAllNodeEdges(props, mapJSON!) }
              </div>
          </div>
      </>
  );
}
