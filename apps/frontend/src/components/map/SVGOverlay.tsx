import { useEffect, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { TransitionProps, NodePathfindingDatatype } from '../../typeDefinition/jsonTypes.ts';

import { mapSizes } from '../mapSizes.ts';
import CustomMapOverlay from './CustomOverlays';

import chestnutParking from '/assets/chestnut_maps/chestnut-parking-overlay.png';
import chestnutHospital from '/assets/chestnut_maps/chestnut-floorone.png';
import patriotParking from '/assets/patriot_maps/patriot-parking-overlay.webp';
import patriot20FloorOne from '/assets/patriot_maps/patriot-20-floorone.png';
import patriot22FloorOne from '/assets/patriot_maps/patriot-22-floorone.png';
import patriot22FloorThree from '/assets/patriot_maps/patriot-22-floorthree.png';
import patriot22FloorFour from '/assets/patriot_maps/patriot-22-floorfour.png';
import faulknerBelkin from '/assets/faulkner_belkin_map/faulkner-belkin-overlay.png';
import mainCampus from '/assets/main_campus_map/BWHMainCampus_Overlay.png';

const pathColor = '#475b5d';
const specialColor = '#f2cd88';

const faulknerParkingLot = {
    north: 42.303090038222,
    south: 42.30009273055679,
    east: -71.12708500137467,
    west: -71.129990085723338,
};

const rotatedFaulknerParkingLot = {
    north: 42.3000927,
    south: 42.3033,
    east: -71.128,
    west: -71.129,
};

const chestnutParkingLotBounds = {
    north: 42.326900699308612,
    south: 42.32520074962522,
    east: -71.14890043341213,
    west: -71.15023542745505,
};

const rotatedChestnutParkingLotBounds = {
    north: 42.32550074962522,
    south: 42.32650699308612,
    east: -71.15018542745505,
    west: -71.14908843341213,
};

const chestnut1stFloor = {
    north: 42.32629,
    south: 42.32569,
    east: -71.14915,
    west: -71.15015,
};

const rotatedChestnut1stFloor = {
    north: 42.32569,
    south: 42.32629,
    east: -71.15015,
    west: -71.14915,
};

const patriotParkingLotBounds = {
    north: 42.0937899,
    south: 42.08978,
    east: -71.262383,
    west: -71.271853,
};

const rotatedPatriotParkingLotBounds = {
    north: 42.09489,
    south: 42.0899,
    east: -71.2679,
    west: -71.27903,
};

const patriot20FloorBounds = {
    north: 42.093403625109184,
    south: 42.092573453112866,
    east: -71.26489687544454,
    west: -71.26719679408583,
};

const rotatedPatriot20FloorBounds = {
    north: 42.093663453112866,
    south: 42.094483625109184,
    east: -71.2656007544454,
    west: -71.26735679408583,
};

const patriot22FloorBounds = {
    north: 42.09290625109184,
    south: 42.092424453112866,
    east: -71.26598687544454,
    west: -71.26780679408583,
};

const rotatedPatriot22FloorBounds = {
    north: 42.09305,
    south: 42.0928,
    east: -71.2669,
    west: -71.268,
};

const mainCampusBounds = {
    north: 42.33651395560993,
    south: 42.333922346274884,
    east: -71.09400009814672,
    west: -71.11903087102631,
};

const rotatedMainCampusBounds = {
    north: 42.33571395560993,
    south: 42.334822346274884,
    east: -71.10300009814672,
    west: -71.11033087102631,
};

const getPath = async (
    mapLocation: string,
    startLocation: string,
    endLocation: string,
    algorithm: string,
    index: number,
    rotation: boolean
): Promise<NodePathfindingDatatype> => {
    const body = {
        map: mapLocation,
        start: startLocation,
        end: endLocation,
        algorithm: algorithm,
        index: index,
    };

    const response = await fetch('/api/pathfinding', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    return await response.json();
};

function convertMapLocation(props: TransitionProps): string {
    if (props.mapLocation === 'chestnut_hill') {
        return props.floor === 0 ? 'Chestnut Hill Parking Lot' : 'Chestnut Hill Hospital';
    } else if (props.mapLocation === 'patriot_place') {
        return props.floor === 0 ? 'Patriot Place Parking Lot' : 'Patriot Place Hospital';
    } else if (props.mapLocation === 'faulkner-belkin') {
        return 'Faulkner-Belkin Hospital Map';
    } else {
        return 'Main Campus';
    }
}

function genNodePath(
    props: TransitionProps,
    selectedJSON: NodePathfindingDatatype | undefined,
    loadingJSON: boolean
) {
    let map, imgHeight, imgWidth, strokeWidth;
    let startRadius: number, rotation: number, endRadius: number;
    let bounds: { north: number; south: number; east: number; west: number };

    if (props.mapLocation === 'chestnut_hill') {
        switch (props.floor) {
            case 0:
                map = chestnutParking;
                imgWidth = mapSizes.chestnutParkingImgWidth;
                imgHeight = mapSizes.chestnutParkingImgHeight;
                strokeWidth = 3;
                startRadius = 5.5;
                endRadius = 4;
                if (props.rotation) {
                    bounds = rotatedChestnutParkingLotBounds;
                } else {
                    bounds = chestnutParkingLotBounds;
                }
                rotation = 177;
                break;
            case 1:
                map = chestnutHospital;
                imgWidth = mapSizes.chestnutHospitalImgWidth;
                imgHeight = mapSizes.chestnutHospitalImgHeight;
                strokeWidth = 4;
                startRadius = 7.5;
                endRadius = 6;
                if (props.rotation) {
                    bounds = rotatedChestnut1stFloor;
                } else {
                    bounds = chestnut1stFloor;
                }
                rotation = 180;
                break;
        }
    } else if (props.mapLocation === 'patriot_place') {
        switch (props.floor) {
            case 0:
                map = patriotParking;
                imgWidth = mapSizes.patriotParkingImgWidth;
                imgHeight = mapSizes.patriotParkingImgHeight;
                strokeWidth = 3;
                startRadius = 5.5;
                endRadius = 4;
                if (props.rotation) {
                    bounds = rotatedPatriotParkingLotBounds;
                    window.sessionStorage.setItem('mapRotation', 'parkingLot');
                } else {
                    bounds = patriotParkingLotBounds;
                }
                rotation = 298.5;
                break;
            case 1:
                map = patriot20FloorOne;
                imgWidth = mapSizes.patriot20FloorOneImgWidth;
                imgHeight = mapSizes.patriot20FloorOneImgHeight;
                strokeWidth = 4;
                startRadius = 7.5;
                endRadius = 6;
                if (props.rotation) {
                    bounds = rotatedPatriot20FloorBounds;
                    window.sessionStorage.setItem('mapRotation', '20PatriotPlace');
                } else {
                    bounds = patriot20FloorBounds;
                }
                rotation = 339;
                break;
            case 2:
                map = patriot22FloorOne;
                imgWidth = mapSizes.patriot22FloorOneImgWidth;
                imgHeight = mapSizes.patriot22FloorOneImgHeight;
                strokeWidth = 4;
                startRadius = 7.5;
                endRadius = 6;
                if (props.rotation) {
                    bounds = rotatedPatriot22FloorBounds;
                    window.sessionStorage.setItem('mapRotation', '22PatriotPlace');
                } else {
                    bounds = patriot22FloorBounds;
                }
                rotation = 308;
                break;
            case 3:
                map = patriot22FloorThree;
                imgWidth = mapSizes.patriot22FloorThreeImgWidth;
                imgHeight = mapSizes.patriot22FloorThreeImgHeight;
                strokeWidth = 4;
                startRadius = 7.5;
                endRadius = 6;
                if (props.rotation) {
                    bounds = rotatedPatriot22FloorBounds;
                    window.sessionStorage.setItem('mapRotation', '22PatriotPlace');
                } else {
                    bounds = patriot22FloorBounds;
                }
                rotation = 308;
                break;
            case 4:
                map = patriot22FloorFour;
                imgWidth = mapSizes.patriot22FloorFourImgWidth;
                imgHeight = mapSizes.patriot22FloorFourImgHeight;
                strokeWidth = 4;
                startRadius = 7.5;
                endRadius = 6;
                bounds = patriot22FloorBounds;
                if (props.rotation) {
                    bounds = rotatedPatriot22FloorBounds;
                    window.sessionStorage.setItem('mapRotation', '22PatriotPlace');
                } else {
                    bounds = patriot22FloorBounds;
                }
                rotation = 308;
                break;
        }
    } else if (props.mapLocation === 'faulkner-belkin') {
        map = faulknerBelkin;
        imgWidth = mapSizes.faulknerBelkinImgWidth;
        imgHeight = mapSizes.faulknerBelkinImgHeight;
        strokeWidth = 4;
        startRadius = 7.5;
        endRadius = 6;
        if (props.rotation) {
            bounds = rotatedFaulknerParkingLot;
        } else {
            bounds = faulknerParkingLot;
        }
        rotation = 125;
    } else {
        map = mainCampus;
        imgWidth = mapSizes.mainCampusImgWidth;
        imgHeight = mapSizes.mainCampusImgHeight;
        strokeWidth = 2;
        startRadius = 4.5;
        endRadius = 4;
        if (props.rotation) {
            bounds = rotatedMainCampusBounds;
        } else {
            bounds = mainCampusBounds;
        }
        rotation = 40;
    }

    const svg = (
        <svg
            className="top-0"
            id={props.mapLocation}
            width={imgWidth}
            height={imgHeight}
            viewBox={`0 0 ${imgWidth} ${imgHeight}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Apply rotation to all elements inside this group */}
            <image width={imgWidth} height={imgHeight} href={map} />
            {!selectedJSON || loadingJSON ? null : (
                <>
                    <polyline
                        points={[...Array(selectedJSON.displayNames.length).keys()]
                            .map((idx) =>
                                selectedJSON.nodeFloors[idx] === props.floor && idx >= props.index
                                    ? `${selectedJSON.coords[idx * 2]},${selectedJSON.coords[idx * 2 + 1]}`
                                    : ''
                            )
                            .join(' ')}
                        style={{
                            fill: 'none',
                            stroke: pathColor,
                            strokeWidth: strokeWidth,
                            strokeDasharray: '10',
                        }}
                    />
                    <animate
                        attributeName="stroke-dashoffset"
                        values="100;0"
                        dur="5s"
                        calcMode="linear"
                        repeatCount="indefinite"
                    />
                    {[...Array(selectedJSON.displayNames.length).keys()].map((idx) =>
                        idx === props.index ||
                        idx === selectedJSON.nodeFloors.lastIndexOf(props.floor) ? (
                            idx === props.index ? (
                                <circle
                                    key={selectedJSON.displayNames[idx]}
                                    cx={selectedJSON.coords[idx * 2]}
                                    cy={selectedJSON.coords[idx * 2 + 1]}
                                    r={endRadius}
                                    fill={pathColor}
                                />
                            ) : (
                                <circle
                                    key={selectedJSON.displayNames[idx]}
                                    cx={selectedJSON.coords[idx * 2]}
                                    cy={selectedJSON.coords[idx * 2 + 1]}
                                    r={startRadius}
                                    fill={specialColor}
                                    filter={'drop-shadow(2px 2px 2px rgba(0, 0, 0, .5))'}
                                    stroke={'#475b5d'}
                                    strokeWidth={'1'}
                                    strokeOpacity={'0.7'}
                                />
                            )
                        ) : null
                    )}
                </>
            )}
        </svg>
    );

    const svgString: string = renderToString(svg);
    const svgUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgString)}`;

    const overlayBoundsPatriot = new google.maps.LatLngBounds(
        new google.maps.LatLng(patriotParkingLotBounds.south, patriotParkingLotBounds.west),
        new google.maps.LatLng(patriotParkingLotBounds.north, patriotParkingLotBounds.east)
    );

    const overlayBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(bounds!.south, bounds!.west),
        new google.maps.LatLng(bounds!.north, bounds!.east)
    );

    return (
        <>


            <CustomMapOverlay
                bounds={overlayBounds}
                url={map!}
                url2={svgUrl}
                rotation={rotation!}
                zoom={true}
                notLoading={loadingJSON}
            />
        </>
    );
}

export default function SVGOverlay(props: TransitionProps) {
    const [loadingJSON, setLoadingJSON] = useState(true);
    const [mapJSON, setMapJSON] = useState<NodePathfindingDatatype>();
    useEffect(() => {
        setLoadingJSON(true); //use to disable auto zoom
        if (props.startLocation !== '' && props.endLocation !== '') {
            getPath(
                convertMapLocation(props),
                props.startLocation,
                props.endLocation,
                props.algorithm,
                0,
                false
            ).then((json) => {
                setLoadingJSON(false);
                setMapJSON(json);
            });
        }
    }, [props.startLocation, props.endLocation, props.algorithm]);

    return <>{genNodePath(props, mapJSON, loadingJSON)}</>;
}
