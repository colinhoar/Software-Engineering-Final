import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import NodeEditingHelpPopup from '../components/nodePopUp';

import ViewEdit_Maps from "../components/ViewEdit_Maps.tsx";
import { editingState } from "../typeDefinition/stateTypes.ts";
import { previewNodeType } from '../typeDefinition/nodeTypes.ts';
import { mapSizes } from "../components/mapSizes.ts";
import { useLocalStorage } from '@uidotdev/usehooks';

const NodeEditing = () => {
  // Map and Sidebar Display States
  const [nodeEditingState, setNodeEditingState] = useState<editingState>(editingState.select)
  const [maxX, setMaxX] = useState<number>(-1);
  const [maxY, setMaxY] = useState<number>(-1);

  // Pathfinding States
  const [floorNumber, setFloorNumber] = useState<number>(0);

  // Map Editing States
  const [isProtected, setIsProtected] = useState<boolean>(false);
  const [indexCoord, setIndexCoord] = useState<number>(-1);
  const [nameCoord, setNameCoord] = useState<string>('');
  const [xCoord, setXCoord] = useState<number>(-1);
  const [yCoord, setYCoord] = useState<number>(-1);
  const [connectedEdgeIndexes, setConnectedEdgeIndexes] = useState<number[]>([]);
  const [disconnectedEdgeIndexes, setDisconnectedEdgeIndexes] = useState<number[]>([]);
  const [connectedEdges, setConnectedEdges] = useState<string[]>([]);

  const [infoHover, setInfoHover] = useState(-1)

  // Preview Node State
  const [previewNode, setPreviewNode] = useState<previewNodeType>({index: -1, xCoord: -1, yCoord: -1});

  // Zoom States
  const [changeZoom, setChangeZoom] = useState<number>(1);
  const [viewBox, setViewBox] = useState<number[]>([0, 0, 0, 0]);

  // Pull information from other pages using Local and Session Storage
    const [currLocation] = useLocalStorage('selectedLocation', 'chestnut_hill')
  // Popup
  const [showHelp, setShowHelp] = useState(false);

  // Toggle displayed map
  function toggleMap(): void {
    if (currLocation === "chestnut_hill") {
      switch (floorNumber) {
        case 0:
          setFloorNumber(1);
          break;
        case 1:
          setFloorNumber(0);
          break;
      }
    }
    else if (currLocation === "patriot_place") {
      switch (floorNumber) {
        case 0:
          setFloorNumber(1);
          break;
        case 1:
          setFloorNumber(2);
          break;
        case 2:
          setFloorNumber(3);
          break;
        case 3:
          setFloorNumber(4);
          break;
        case 4:
          setFloorNumber(0);
          break;
      }
    }
    else if (currLocation === "faulkner-belkin") {
        setFloorNumber(0); //faulkner-belkin are all on the same floor, so 0 in this case
    }
    else if (currLocation === "main_campus") {
        setFloorNumber(0);
    }
  }

  function convertMapLocation(mapLocation: string, floor: number): string {
    if (mapLocation === "chestnut_hill") {
      return (floor === 0) ? 'Chestnut Hill Parking Lot' : 'Chestnut Hill Hospital';
    }
    else if (mapLocation === "patriot_place") {
      switch (floor) {
        case 0:
          return 'Patriot Place Parking Lot';
        case 1: case 2: case 3: case 4:
          return 'Patriot Place Hospital';
        default:
          return '';
      }
    }
    else if (mapLocation === "faulkner-belkin") {
      return 'Faulkner-Belkin Hospital Map';
    }
    else {
      return 'Main Campus';
    }
  }

  const handleClearMouseSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    const clickedTarget = e.target as HTMLInputElement;

    if(nodeEditingState !== editingState.addNode && nodeEditingState !== editingState.addEdges && clickedTarget.tagName !== 'circle'){
      updateNodeData(-1, "", -1, -1);
      setIsProtected(false);
    }
  }

  // Passable functions to update selected node data and selected edge data within component
  function updateNodeData(idx: number, id: string, x: number, y: number): void {
    setIndexCoord(idx);
    setNameCoord(id);
    setXCoord(x);
    setYCoord(y);
  }

  function updateEdgeData(idx: number, node: string): void {
    if (connectedEdgeIndexes.indexOf(idx) === -1 && idx !== indexCoord) { // Add node to list
      setConnectedEdges(nodes => [...nodes, node]);
      setConnectedEdgeIndexes(idxes => [...idxes, idx]);
      if (disconnectedEdgeIndexes.indexOf(idx) !== -1) {
        setDisconnectedEdgeIndexes(disconnectedEdgeIndexes.filter(x => x !== idx));
      }
    }
    else if (connectedEdgeIndexes.indexOf(idx) !== -1) { // Remove node from list
      setConnectedEdges(connectedEdges.filter((x, i) => connectedEdgeIndexes[i] !== idx));
      setConnectedEdgeIndexes(connectedEdgeIndexes.filter(x => x !== idx));
      if (disconnectedEdgeIndexes.indexOf(idx) === -1 && idx !== indexCoord) {
        setDisconnectedEdgeIndexes(idxes => [...idxes, idx]);
      }
    }
  }

  function updateProtected(proc: boolean): void {
    setIsProtected(proc);
  }

  // Button functions
  function addButton() {
    return (
      <button key="add" type="button" className="buttonLook flex-1 hover:scale-105 text-center text-1xl bg-(--color-buttonblue) hover:bg-(--color-hfblue) text-white shadow-md rounded-sm p-1" onClick={() => {setNodeEditingState(editingState.addNode); updateNodeData(-1, '', -1, -1);}}>
        Add
      </button>
    )
  }

    function editButton() {
        return (
            <button
                key="edit"
                type="button"
                className="buttonLook mx-2 flex-1 hover:scale-105 text-center text-1xl bg-(--color-buttonblue) hover:bg-(--color-hfblue) text-white shadow-md rounded-sm p-1"
                onClick={() => {
                    setNodeEditingState(editingState.editNode);
                    setChangeZoom(1);
                }}
            >
                Edit
            </button>
        );
    }

    function removeButton() {
        return (
            <button
                key="remove"
                type="button"
                className="buttonLook flex-1 hover:scale-105 text-center text-1xl bg-(--color-buttonblue) hover:bg-(--color-hfblue) text-white shadow-md rounded-sm p-1"
                onClick={() => setNodeEditingState(editingState.deleteNode)}
            >
                Remove
            </button>
        );
    }

    function editEdgesButton() {
        return (
            <button
                key="confirmAdd"
                type="button"
                disabled={xCoord === -1}
                className={`mr-1 flex-1 hover:scale-105 text-center text-1xl text-white shadow-md rounded-sm p-1 ${
                    xCoord === -1 ? 'buttonDisabled' : 'buttonLook'
                }`}
                onClick={() => setNodeEditingState(editingState.addEdges)}
            >
                Edit Edges
            </button>
        );
    }

  function cancelButton() {
    function cancel() {
      setNodeEditingState(editingState.select);
      updateNodeData(-1, '', -1, -1);
      setConnectedEdges([]);
      setConnectedEdgeIndexes([]);
      setDisconnectedEdgeIndexes([]);
      setIsProtected(false);
    }

        return (
            <button
                key="cancel"
                type="button"
                className="buttonLook ml-1 flex-1 hover:scale-105 text-center text-1xl bg-(--color-buttonblue) hover:bg-(--color-hfblue) text-white shadow-md rounded-sm p-1"
                onClick={cancel}
            >
                Cancel
            </button>
        );
    }

    function confirmAddButton() {
        function confirmOnClick() {
            const body = {
                map: convertMapLocation(currLocation, floorNumber),
                displayName: nameCoord,
                floorLocation: floorNumber,
                xCoord: xCoord,
                yCoord: yCoord,
            };

      fetch('/api/ne/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      .then((res) => res.json())
      .then((data) => {setIndexCoord(data)})
      .then(() => setNodeEditingState(editingState.addEdges))
      .then(() => setConnectedEdges([]))
      .then(() => setConnectedEdgeIndexes([]))
      .then(() => setDisconnectedEdgeIndexes([]));
    }

        return (
            <button
                key="confirmAdd"
                type="button"
                disabled={xCoord === -1}
                className={`mr-1 flex-1 hover:scale-105 text-center text-1xl text-white shadow-md rounded-sm p-1 ${
                    xCoord === -1 ? 'buttonDisabled' : 'buttonLook'
                }`}
                onClick={confirmOnClick}
            >
                Confirm Add
            </button>
        );
    }

    function confirmEdgesButton() {
        function confirmOnClick() {
            if (connectedEdgeIndexes.length !== 0) {
                const addBody = {
                    map: convertMapLocation(currLocation, floorNumber),
                    index: indexCoord,
                    edgeIndexes: connectedEdgeIndexes.filter((x) => x !== -1),
                };
                const remBody = {
                    map: convertMapLocation(currLocation, floorNumber),
                    index: indexCoord,
                    edgeIndexes: disconnectedEdgeIndexes.filter((x) => x !== -1),
                };

        fetch('/api/ne/addEdges', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(addBody)
        })
        .then(_=>
          fetch('/api/ne/remEdges', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(remBody)
          })
        )
        .then(() => setNodeEditingState(editingState.select))
        .then(() => updateNodeData(-1, '', -1, -1))
        .then(() => setConnectedEdges([]))
        .then(() => setConnectedEdgeIndexes([]))
        .then(() => setDisconnectedEdgeIndexes([]));
      }
      else {
        setNodeEditingState(editingState.select);
        updateNodeData(-1, '', -1, -1);
        setConnectedEdges([]);
        setConnectedEdgeIndexes([]);
        setDisconnectedEdgeIndexes([])
      }
    }

    return (
            <button
                key="confirmEdges"
                type="button"
                disabled={xCoord === -1}
                className={`mr-1 flex-1 hover:scale-105 text-center text-1xl text-white shadow-md rounded-sm p-1 ${
                    xCoord === -1 ? 'buttonDisabled' : 'buttonLook'
                }`}
                onClick={confirmOnClick}
            >
                Confirm Edges
            </button>
        );
    }

    function confirmEditButton() {
        function confirmOnClick() {
            const body = {
                map: convertMapLocation(currLocation, floorNumber),
                index: indexCoord,
                displayName: nameCoord,
                floorLocation: floorNumber,
                xCoord: xCoord,
                yCoord: yCoord,
            };

      fetch('/api/ne/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      .then(() => setNodeEditingState(editingState.select));
    }

        return (
            <button
                key="confirmEdit"
                type="button"
                disabled={xCoord === -1}
                className={`mr-1 flex-1 hover:scale-105 text-center text-1xl text-white shadow-md rounded-sm p-1 ${
                    xCoord === -1 ? 'buttonDisabled' : 'buttonLook'
                }`}
                onClick={confirmOnClick}
            >
                Confirm Edit
            </button>
        );
    }

    function confirmRemoveButton() {
        function confirmOnClick() {
            if (!isProtected) {
                const body = {
                    map: convertMapLocation(currLocation, floorNumber),
                    index: indexCoord,
                    floorLocation: floorNumber,
                };
                fetch('/api/ne/remove', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                })
                    .then(() => setNodeEditingState(editingState.select))
                    .then(() => updateNodeData(-1, '', -1, -1))
                    .then(() => setConnectedEdges([]))
                    .then(() => setConnectedEdgeIndexes([]))
                    .then(() => setDisconnectedEdgeIndexes([]));
            }
        }

        return (
            <button
                key="confirmRemove"
                type="button"
                disabled={xCoord === -1}
                className={`mr-1 flex-1 hover:scale-105 text-center text-1xl text-white shadow-md rounded-sm p-1 ${
                    xCoord === -1 ? 'buttonDisabled' : 'buttonLook'
                }`}
                onClick={confirmOnClick}
            >
                Confirm Remove
            </button>
        );
    }

    // Zoom handler
    function handleZoom(zoomIn: boolean) {
        if (zoomIn ? changeZoom <= 4 : changeZoom >= 1) {
            const w = viewBox[2];
            const h = viewBox[3];
            const dw = w * (zoomIn ? 1 : -1) * 0.1;
            const dh = h * (zoomIn ? 1 : -1) * 0.1;
            setViewBox([viewBox[0], viewBox[1], viewBox[2] - dw, viewBox[3] - dh]);
            setChangeZoom(maxX / (viewBox[2] - dw));
        }
    }

    // Reset map
    useEffect(() => {
        setChangeZoom(1);
        setViewBox([0, 0, maxX, maxY]);
    }, [maxX, maxY]);

    // Set maximum height and width per map
    useEffect(() => {
        if (currLocation === 'chestnut_hill') {
            switch (floorNumber) {
                case 0:
                    setMaxX(mapSizes.chestnutParkingImgWidth);
                    setMaxY(mapSizes.chestnutParkingImgHeight);
                    break;
                case 1:
                    setMaxX(mapSizes.chestnutHospitalImgWidth);
                    setMaxY(mapSizes.chestnutHospitalImgHeight);
                    break;
            }
        } else if (currLocation === 'patriot_place') {
            switch (floorNumber) {
                case 0:
                    setMaxX(mapSizes.patriotParkingImgWidth);
                    setMaxY(mapSizes.patriotParkingImgHeight);
                    break;
                case 1:
                    setMaxX(mapSizes.patriot20FloorOneImgWidth);
                    setMaxY(mapSizes.patriot20FloorOneImgHeight);
                    break;
                case 2:
                    setMaxX(mapSizes.patriot22FloorOneImgWidth);
                    setMaxY(mapSizes.patriot22FloorOneImgHeight);
                    break;
                case 3:
                    setMaxX(mapSizes.patriot22FloorThreeImgWidth);
                    setMaxY(mapSizes.patriot22FloorThreeImgHeight);
                    break;
                case 4:
                    setMaxX(mapSizes.patriot22FloorFourImgWidth);
                    setMaxY(mapSizes.patriot22FloorFourImgHeight);
                    break;
            }
        } else if (currLocation == 'faulkner-belkin') {
            setMaxX(mapSizes.faulknerBelkinImgWidth);
            setMaxY(mapSizes.faulknerBelkinImgHeight);
        } else if (currLocation == 'main_campus') {
            setMaxX(mapSizes.mainCampusImgWidth);
            setMaxY(mapSizes.mainCampusImgHeight);
            setViewBox([0, 0, mapSizes.mainCampusImgWidth, mapSizes.mainCampusImgHeight]);
        }
    }, [floorNumber]);

    // Set preview node
    useEffect(() => {
        setPreviewNode({ index: indexCoord, xCoord: xCoord, yCoord: yCoord });
    }, [indexCoord, xCoord, yCoord]);

    return (
        <>
            <div className="relative bg-[#D9F0FF] h-full" onMouseDown={handleClearMouseSelect}>
                <Grid
                    container
                    spacing={1}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="flex border justify-center min-w-[23%] max-w-[23%] absolute left-7.5 top-20 p-2 bg-[#DFE9F2] shadow-xl rounded-md z-10"
                    sx={{ width: 'auto', minHeight: 'auto' }}
                    style={{ backgroundColor: '#CFD8E0' }}
                >
                  <div className="w-[90%]">
                      <div className="flex text-2xl justify-center font-semibold titleFont text-[#044ca4]">
                        {nodeEditingState === editingState.select
                          ? "Map Editing"
                          : (nodeEditingState === editingState.addNode
                            ? "Add a Node"
                            : (nodeEditingState === editingState.addEdges
                              ? "Add Edges"
                              : (nodeEditingState === editingState.editNode
                                ? "Edit a Node"
                                : (nodeEditingState === editingState.deleteNode
                                  ? "Delete a Node"
                                  : ""
                                )
                              )
                            )
                          )
                        }
                      </div>

                      <div className="flex flex-col mt-2">
                          <div className="grid grid-col text-1xl shadow-md rounded-sm bg-white p-[4%]">
                              {nodeEditingState === editingState.addEdges
                                  ? <>
                                      <div className="text-left font-semibold">
                                          <span className="font-medium mr-1">Connected Edges:</span><br/>
                                          <span className="font-normal">{connectedEdges.join(', ')}</span>
                                      </div>
                                  </> // Connected nodes box
                                  : <>
                                      <span className="text-left font-semibold overflow-hidden">
                                          <label className="font-medium float-left mr-1 headerFont" htmlFor="name">Name:</label>
                                          <span className="font-normal block overflow-hidden">
                                              {(nodeEditingState === editingState.editNode || nodeEditingState === editingState.addNode) && nameCoord !== null
                                                  ? <input className="pl-0.5 w-full box-border headerFont" type="text" id="name" name="name" minLength={1} defaultValue={nameCoord} onChange={(e) => setNameCoord(e.target.value)} required/>
                                                  : <span className="pl-0.5 headerFont">{nameCoord}</span>
                                              }
                                          </span>
                                      </span>
                                      <span className="text-left font-semibold">
                                          <label className="font-medium mr-1 headerFont" htmlFor="xCoord">X Coord:</label>
                                          <span className="font-normal -indent-[6px]">
                                              {(nodeEditingState === editingState.editNode || nodeEditingState === editingState.addNode) && yCoord !== -1
                                                  ? <input className="pl-0.5 w-[8ch] headerFont" type="number" id="xCoord" name="xCoord" min="0" max={maxX} value={xCoord} defaultValue={xCoord} onChange={(e) => setXCoord(+e.target.value)} required/>
                                                  : <span className="pl-0.5 headerFont">{xCoord === -1 ? '' : xCoord}</span>
                                              }
                                          </span>
                                      </span>
                                      <span className="text-left font-semibold">
                                          <label className="font-medium mr-1 headerFont" htmlFor="yCoord">Y Coord:</label>
                                          <span className="font-normal -indent-[6px]">
                                              {(nodeEditingState === editingState.editNode || nodeEditingState === editingState.addNode) && yCoord !== -1
                                                  ? <input className="pl-0.5 w-[8ch] headerFont" type="number" id="xCoord" name="xCoord" min="0" max={maxY} value={yCoord} defaultValue={yCoord} onChange={(e) => setYCoord(+e.target.value)} required/>
                                                  : <span className="pl-0.5 headerFont">{yCoord === -1 ? '' : yCoord}</span>
                                              }
                                          </span>
                                      </span>
                                  </> // Current selected node data box
                              }
                          </div>

                          {isProtected && nodeEditingState === editingState.deleteNode
                              ? <span className="text-red-500 text-xs text-center mt-2.5 -mb-1.5">This node is protected and cannot be removed.</span>
                              : null
                          }

                          {nodeEditingState === editingState.editNode
                              ? <div className="flex mt-4 -mb-1"> {editEdgesButton()} </div>
                              : null
                          }

                          <div className="flex flex-row mt-4 headerFont">
                              {nodeEditingState === editingState.select
                                  ? [addButton(), editButton(), removeButton()]
                                  : (nodeEditingState === editingState.addNode
                                      ? [confirmAddButton(), cancelButton()]
                                      : (nodeEditingState === editingState.addEdges
                                          ? [confirmEdgesButton(), cancelButton()]
                                          : (nodeEditingState === editingState.editNode
                                              ? [confirmEditButton(), cancelButton()]
                                              : (nodeEditingState === editingState.deleteNode
                                                  ? (isProtected
                                                      ? [cancelButton()]
                                                      : [confirmRemoveButton(), cancelButton()]
                                                  )
                                                  : null
                                              )
                                          )
                                      )
                                  )
                              }
                          </div>

                        {currLocation === "faulkner-belkin" || currLocation === "main_campus"
                            ? <div className="mb-2"></div>
                            : <>
                              <hr className="mt-4.5 mb-2 border-(--color-buttonblue)"/>

                              <div className="flex flex-col space-y-2 mb-2">
                                   <button type="button" className="buttonLook hover:scale-105 text-center text-1xl text-white shadow-md rounded-sm p-1 headerFont mt-2" onClick={() => { toggleMap(); updateNodeData(-1, '', -1, -1); setChangeZoom(1); setViewBox([0,0,maxX,maxY]);}}>
                                          {currLocation === "chestnut_hill"
                                              ? (floorNumber === 0 ? "View Hospital Map" : "View Parking Lot Map")
                                              : (floorNumber === 0 ? "View 20 Floor One Map" : (floorNumber === 1 ? "View 22 Floor One Map" : (floorNumber === 2 ? "View 22 Floor Three Map" : (floorNumber === 3 ? "View 22 Floor Four Map" : "View Parking Lot Map"))))
                                          }
                                      </button>
                                </div>
                            </>
                          }
                        </div>
                  </div>

                  <div className="max-w-xs flex flex-col rounded-lg shadow-2xs -right-7 top-5 absolute">
                      <button type="button" className="w-7 h-7 py-1.5 px-1.5 inline-flex items-center gap-x-2 rounded-tr-md text-sm font-medium focus:z-10 border border-[#385DA6] border-2 bg-[#044CA4] text-gray-800 shadow-2xs hover:bg-[#799BCC] cursor-pointer focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800" onClick={() => handleZoom(true)}>
                          <svg fill="#ffffff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45.40 45.40" stroke="#F2CD88" strokeWidth="0.00045402"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#CCCCCC" strokeWidth="0.272412"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M41.267,18.557H26.832V4.134C26.832,1.851,24.99,0,22.707,0c-2.283,0-4.124,1.851-4.124,4.135v14.432H4.141 c-2.283,0-4.139,1.851-4.138,4.135c-0.001,1.141,0.46,2.187,1.207,2.934c0.748,0.749,1.78,1.222,2.92,1.222h14.453V41.27 c0,1.142,0.453,2.176,1.201,2.922c0.748,0.748,1.777,1.211,2.919,1.211c2.282,0,4.129-1.851,4.129-4.133V26.857h14.435 c2.283,0,4.134-1.867,4.133-4.15C45.399,20.425,43.548,18.557,41.267,18.557z"></path> </g> </g></svg>
                      </button>
                      <button type="button" className="w-7 h-7 py-1.5 px-1.5 inline-flex items-center gap-x-2 text-sm font-medium focus:z-10 border border-[#385DA6] border-2 bg-[#044CA4] text-gray-800 shadow-2xs hover:bg-[#799BCC] cursor-pointer focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800" onClick={() => handleZoom(false)}>
                          <svg fill="#ffffff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52.161 52.161"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M52.161,26.081c0,3.246-2.63,5.875-5.875,5.875H5.875C2.63,31.956,0,29.327,0,26.081l0,0c0-3.245,2.63-5.875,5.875-5.875 h40.411C49.531,20.206,52.161,22.835,52.161,26.081L52.161,26.081z"></path> </g> </g></svg>
                      </button>
                      <button type="button" className="w-7 h-7 py-1.5 px-1.5 inline-flex items-center gap-x-2 rounded-br-md text-sm font-medium focus:z-10 border border-[#385DA6] border-2 bg-[#044CA4] text-gray-800 shadow-2xs hover:bg-[#799BCC] cursor-pointer focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800" onClick={() => {setChangeZoom(1); setViewBox([0,0,maxX,maxY]);}}>
                        <svg viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000" stroke-width="3.1"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="none" fill-rule="evenodd" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" transform="matrix(0 1 1 0 2.5 2.5)"> <path d="m3.98652376 1.07807068c-2.38377179 1.38514556-3.98652376 3.96636605-3.98652376 6.92192932 0 4.418278 3.581722 8 8 8s8-3.581722 8-8-3.581722-8-8-8"></path> <path d="m4 1v4h-4" transform="matrix(1 0 0 -1 0 6)"></path> </g> </g></svg>
                      </button>
                  </div>
              </Grid>

              <div className="pl-[20%] mr-10">
                  <ViewEdit_Maps floor={floorNumber} mapLocation={currLocation!} selectedIDX={indexCoord} edgeIDXs={connectedEdgeIndexes} removedEdgeIDXs={disconnectedEdgeIndexes} tempNode={previewNode} updateCoord={updateNodeData} updateEdges={updateEdgeData} updateProtected={updateProtected} editState={nodeEditingState} zoom={changeZoom} viewBox={viewBox} setViewBox={setViewBox}></ViewEdit_Maps>
              </div>

            <div className="absolute right-0 bg-[#CFD8E0] text-1xl shadow-lg rounded-l-md p-1 w-15 h-15 flex justify-center items-center top-150">
              <img
                  src={infoHover === 0 ? '/assets/info-filled.svg' : '/assets/info.svg'}
                  className="mx-auto h-6 w-6 cursor-pointer right-0 w-auto h-auto"
                  onClick={() => setShowHelp(true)}
                  onMouseEnter={() => setInfoHover(0)}
                  onMouseLeave={() => setInfoHover(-1)}
              />
            </div>
          </div>
          {/* Render the popup*/}
          <NodeEditingHelpPopup open={showHelp} onClose={() => setShowHelp(false)} />
      </>
  );
}

export default NodeEditing;
