import React, { useEffect, useState } from 'react';
import { TransitionProps, NodePathfindingDatatype } from '../typeDefinition/jsonTypes';

import { mapSizes } from './mapSizes';
import { API_ROUTES } from 'common/src/constants';
import chestnutParking from '/assets/chestnut_maps/chestnut-parking.png';
import chestnutHospital from '/assets/chestnut_maps/chestnut-floorone.png';
import patriotParking from '/assets/patriot_maps/patriot-parking.webp';
import patriot20FloorOne from '/assets/patriot_maps/patriot-20-floorone.png';
import patriot22FloorOne from '/assets/patriot_maps/patriot-22-floorone.png';
import patriot22FloorThree from '/assets/patriot_maps/patriot-22-floorthree.png';
import patriot22FloorFour from '/assets/patriot_maps/patriot-22-floorfour.png';
import faulknerBelkin from '/assets/faulkner_belkin_map/faulkner-belkin.png';
import mainCampus from '/assets/main_campus_map/BWHMainCampus_Overlay.png';
import { useLocalStorage } from '@uidotdev/usehooks';

const pathColor = '#475b5d';
const specialColor = '#f2cd88';

const getPath = async (mapLocation: string, startLocation: string, endLocation: string, algorithm: string): Promise<NodePathfindingDatatype> => {
    const body = { map: mapLocation, start: startLocation, end: endLocation, algorithm };
    const response = await fetch(API_ROUTES.PATHFINDING, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return await response.json();
};

function convertMapLocation(props: TransitionProps): string {
    if (props.mapLocation === 'chestnut_hill') {
        return props.floor === 0 ? 'Chestnut Hill Parking Lot' : 'Chestnut Hill Hospital';
    } else if (props.mapLocation === 'patriot_place') {
        return props.floor === 0 ? 'Patriot Place Parking Lot' : 'Patriot Place Hospital';
    } else if (props.mapLocation === 'faulkner-belkin'){
        return 'Faulkner-Belkin Hospital Map';
    }
    else {
        return 'Main Campus';
    }
}

function genNodePath(props: TransitionProps, selectedJSON: NodePathfindingDatatype) {
    let map, imgWidth, imgHeight, strokeWidth, startRadius: number, endRadius: number;
    if (props.mapLocation === 'chestnut_hill') {
        switch (props.floor) {
            case 0:
                map = chestnutParking;
                imgWidth = mapSizes.chestnutParkingImgWidth;
                imgHeight = mapSizes.chestnutParkingImgHeight;
                strokeWidth = 3; startRadius = 3.5; endRadius = 2;
                break;
            case 1:
                map = chestnutHospital;
                imgWidth = mapSizes.chestnutHospitalImgWidth;
                imgHeight = mapSizes.chestnutHospitalImgHeight;
                strokeWidth = 4; startRadius = 5.5; endRadius = 5;
                break;
            default:
                map = chestnutParking;
                imgWidth = mapSizes.chestnutParkingImgWidth;
                imgHeight = mapSizes.chestnutParkingImgHeight;
                strokeWidth = 3; startRadius = 4.5; endRadius = 3;
        }
    }
    else if (props.mapLocation === 'patriot_place') {
        switch (props.floor) {
            case 0:
                map = patriotParking;
                imgWidth = mapSizes.patriotParkingImgWidth;
                imgHeight = mapSizes.patriotParkingImgHeight;
                strokeWidth = 3; startRadius = 4.5; endRadius = 3;
                break;
            case 1:
                map = patriot20FloorOne;
                imgWidth = mapSizes.patriot20FloorOneImgWidth;
                imgHeight = mapSizes.patriot20FloorOneImgHeight;
                strokeWidth = 4; startRadius = 5.5; endRadius = 5;
                break;
            case 2:
                map = patriot22FloorOne;
                imgWidth = mapSizes.patriot22FloorOneImgWidth;
                imgHeight = mapSizes.patriot22FloorOneImgHeight;
                strokeWidth = 4; startRadius = 5.5; endRadius = 5;
                break;
            case 3:
                map = patriot22FloorThree;
                imgWidth = mapSizes.patriot22FloorThreeImgWidth;
                imgHeight = mapSizes.patriot22FloorThreeImgHeight;
                strokeWidth = 4; startRadius = 5.5; endRadius = 5;
                break;
            case 4:
                map = patriot22FloorFour;
                imgWidth = mapSizes.patriot22FloorFourImgWidth;
                imgHeight = mapSizes.patriot22FloorFourImgHeight;
                strokeWidth = 4; startRadius = 5.5; endRadius = 5;
                break;
            default:
                map = patriotParking;
                imgWidth = mapSizes.patriotParkingImgWidth;
                imgHeight = mapSizes.patriotParkingImgHeight;
                strokeWidth = 3; startRadius = 5.5; endRadius = 4;
        }
    }  else if (props.mapLocation === 'faulkner-belkin') {
        map = faulknerBelkin;
        imgWidth = mapSizes.faulknerBelkinImgWidth;
        imgHeight = mapSizes.faulknerBelkinImgHeight;
        strokeWidth = 4; startRadius = 5.5; endRadius = 5;
    }
    else {
        map = mainCampus;
        imgWidth = mapSizes.mainCampusImgWidth;
        imgHeight = mapSizes.mainCampusImgHeight;
        strokeWidth = 4; startRadius = 3.5; endRadius = 2;
    }

    return (
        <div className="flex justify-center relative">
            <svg width={imgWidth} height={imgHeight} viewBox={`0 0 ${imgWidth} ${imgHeight}`} xmlns="http://www.w3.org/2000/svg">
                <image width={imgWidth} height={imgHeight} href={map} />
                <polyline
                    points={selectedJSON.coords
                        .map((_, idx) => idx % 2 === 0 && selectedJSON.nodeFloors[idx / 2] === props.floor ? `${selectedJSON.coords[idx]},${selectedJSON.coords[idx + 1]}` : '')
                        .filter(Boolean)
                        .join(' ')}
                    style={{ fill: 'none', stroke: pathColor, strokeWidth, strokeDasharray: '10' }}
                />
                <animate attributeName="stroke-dashoffset" values="100;0" dur="5s" repeatCount="indefinite" />
                {selectedJSON.coords
                    .map((_, idx) => idx % 2 === 0 ? idx / 2 : null)
                    .filter(idx => idx !== null)
                    .map(idx => (idx === selectedJSON.nodeFloors.indexOf(props.floor)
                        ? <circle key={idx} cx={selectedJSON.coords[idx * 2]} cy={selectedJSON.coords[idx * 2 + 1]} r={endRadius} fill={pathColor} />
                        : idx === selectedJSON.nodeFloors.lastIndexOf(props.floor)
                            ? <circle key={idx} cx={selectedJSON.coords[idx * 2]} cy={selectedJSON.coords[idx * 2 + 1]} r={startRadius} filter={"drop-shadow(2px 2px 2px rgba(0, 0, 0, .5))"} stroke={"#475b5d"} strokeWidth={"0.65"} strokeOpacity={"0.7"} fill={specialColor} />
                            : null))}
            </svg>
        </div>
    );
}

export default function Transition_Maps(props: TransitionProps) {
    const [loadingJSON, setLoadingJSON] = useState(true);
    const [mapJSON, setMapJSON] = useState<NodePathfindingDatatype>();

    useEffect(() => {
        setLoadingJSON(true);
        if (props.startLocation && props.endLocation) {
            getPath(
                convertMapLocation(props),
                props.startLocation,
                props.endLocation,
                props.algorithm
            )
                .then(json => {
                    setMapJSON(json);
                    setLoadingJSON(false);
                })
                .catch(() => setLoadingJSON(false));
        }
    }, [props.startLocation, props.endLocation, props.algorithm, props.floor, props.mapLocation]);

    if (loadingJSON) {
        const [currLocation] = useLocalStorage('selectedLocation', 'chestnut_hill')
        return (
            <div className="grow grid grid-cols-1 justify-center pb-10 pt-5">
                {currLocation === 'chestnut_hill'
                    ? props.floor === 0
                        ? <div className="row-start-1 col-start-1"><div className="flex justify-center relative"><img className={`ease-in max-h-[${mapSizes.chestnutParkingImgHeight}px] max-w-[${mapSizes.chestnutParkingImgWidth}px]`} src={chestnutParking} alt="" /><img className="ease-out absolute" src={chestnutHospital} alt="" /></div></div>
                        : <div className="row-start-1 col-start-1"><div className="flex justify-center relative"><img className="ease-out absolute" src={chestnutParking} alt="" /><img className={`ease-in max-h-[${mapSizes.chestnutHospitalImgHeight}px] max-w-[${mapSizes.chestnutHospitalImgWidth}px]`} src={chestnutHospital} alt="" /></div></div>
                    : currLocation === 'patriot_place'
                        ? props.floor === 0
                            ? <div className="row-start-1 col-start-1"><div className="flex justify-center relative"><img className={`max-h-[${mapSizes.patriotParkingImgHeight}px] max-w-[${mapSizes.patriotParkingImgWidth}px]`} src={patriotParking} alt="" /></div></div>
                            : props.floor === 1
                                ? <div className="row-start-1 col-start-1"><div className="flex justify-center relative"><img className={`max-h-[${mapSizes.patriot20FloorOneImgHeight}px] max-w-[${mapSizes.patriot20FloorOneImgWidth}px]`} src={patriot20FloorOne} alt="" /></div></div>
                                : props.floor === 2
                                    ? <div className="row-start-1 col-start-1"><div className="flex justify-center relative"><img className={`max-h-[${mapSizes.patriot22FloorOneImgHeight}px] max-w-[${mapSizes.patriot22FloorOneImgWidth}px]`} src={patriot22FloorOne} alt="" /></div></div>
                                    : props.floor === 3
                                        ? <div className="row-start-1 col-start-1"><div className="flex justify-center relative"><img className={`max-h-[${mapSizes.patriot22FloorThreeImgHeight}px] max-w-[${mapSizes.patriot22FloorThreeImgWidth}px]`} src={patriot22FloorThree} alt="" /></div></div>
                                        : <div className="row-start-1 col-start-1"><div className="flex justify-center relative"><img className={`max-h-[${mapSizes.patriot22FloorFourImgHeight}px] max-w-[${mapSizes.patriot22FloorFourImgWidth}px]`} src={patriot22FloorFour} alt="" /></div></div>
                        : currLocation === 'faulkner-belkin'
                            ? <div className="row-start-1 col-start-1"><div className="flex justify-center relative"><img className={`max-h-[${mapSizes.faulknerBelkinImgHeight}px] max-w-[${mapSizes.faulknerBelkinImgWidth}px]`} src={faulknerBelkin} alt="" /></div></div>
                            : <div className="row-start-1 col-start-1"><div className="flex justify-center relative"><img className={`max-h-[${mapSizes.mainCampusImgHeight}px] max-w-[${mapSizes.mainCampusImgWidth}px]`} src={mainCampus} alt="" /></div></div>
                }
            </div>
        );
    }

    return (
        <div className="grow grid grid-cols-1 justify-center pb-10 pt-5">
            <div className="row-start-1 col-start-1">
                {genNodePath(props, mapJSON!)}
            </div>
        </div>
    );


}
