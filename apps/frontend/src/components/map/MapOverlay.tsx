import { useEffect, useState } from 'react';
import { Grid, IconButton, Menu, MenuItem } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SVGOverlay from './SVGOverlay';
import InternalTextDirections from './InternalTextDirections';
import { fetchDepartments } from '../../lib/utils.ts';
import { Prisma } from '../../../../../packages/database';
import { useAuth } from '../auth_context';
import { useSessionStorage } from "@uidotdev/usehooks";
import {useLocalStorage} from '@uidotdev/usehooks';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarProvider,
} from '../../../shadcn/ui/sidebar.tsx';
import Form from './Form_Map';
import { IGMapsApiStatus } from './types.tsx';
import { useScript } from './ExternalScriptProvider.tsx';
import {NodePathfindingDatatype} from "../../typeDefinition/jsonTypes.ts";

type Algorithm = 'dijkstra' | 'dfs';

interface Props {
    gMapsApiStatus: boolean;
    setMapDirections: (directions: google.maps.DirectionsResult | undefined) => void;
}

const MapOverlay = ({ gMapsApiStatus, setMapDirections }: Props) => {
    const { isLoggedIn, isAdmin } = useAuth();
    const [showParkingLot, setShowParkingLot] = useState<boolean>(true);
    const [startLocation, setStartLocation] = useState<string>('');
    const [endLocation, setEndLocation] = useState<string>('');
    const [floorNumber, setFloorNumber] = useState<number>(0);
    const [desiredFloor, setDesiredFloor] = useState<number>(0);
    const [pathData, setPathData] = useState<NodePathfindingDatatype>();
    const [selectedDepartment, setSelectedDepartment] = useState<string>();
    const [algorithm, setAlgorithm] = useState<Algorithm>('dijkstra');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [startingIndex, setStartingIndex] = useState<number>(0);
    const [showOverlay, setShowOverlay] = useState(false);
    const [currentMetric, setCurrentMetric] = useState(true);
    const [rotateMap, setRotateMap] = useState(false);
    const apikey = import.meta.env.VITE_GOOGLE_MAP_API_KEY!;
    const GMapsApiStatus: IGMapsApiStatus = useScript(
        `https://maps.googleapis.com/maps/api/js?key=${apikey}&libraries=places&callback=Function.prototype`
    );

    const [departments, setDepartments] = useState<
        Prisma.DepartmentGetPayload<{ include: { building: true } }>[]
    >([
        {
            name: '',
            floor: '0',
            departmentID: 0,
            buildingID: 0,
            location: '',
            phone: '',
            services: '',
            building: {
                name: '',
                id: 0,
            },
        },
    ]);
    const [voiceDepartment, setVoiceDepartment] = useSessionStorage<
    Prisma.DepartmentGetPayload<{ include: { building: true } }>>('voiceDepartment',
        {
            name: '',
            floor: '0',
            departmentID: -1,
            buildingID: 0,
            location: '',
            phone: '',
            services: '',
            building: {
                name: '',
                id: 0,
            },
        })
    // New function to update global algorithm setting
    const updateGlobalAlgorithm = async (newAlgorithm: Algorithm) => {
        try {
            await fetch('/api/pathfinding/algorithm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ algorithm: newAlgorithm }),
            });
        } catch (error) {
            console.error('Failed to update global algorithm:', error);
        }
    };

    // New function to handle algorithm change
    const handleAlgorithmChange = async (newAlgorithm: Algorithm) => {
        setAlgorithm(newAlgorithm);
        if (isAdmin) {
            await updateGlobalAlgorithm(newAlgorithm);
        }
        setAnchorEl(null);
    };

    useEffect(() => {
        if (!sessionStorage.getItem('unit')) {
            sessionStorage.setItem('unit', 'feet');
        }
    }, []);



    console.log(desiredFloor)

    const [currLocation] = useLocalStorage('selectedLocation', 'chestnut_hill')

    const [dropOffLocation, setDropOffLocation] =useState(
        window.sessionStorage.getItem('destination') ??
        (currLocation === 'chestnut_hill'
            ? 'Lot A1'
            : currLocation === 'patriot_place'
                ? 'Patriot Lot 22C'
                : currLocation === 'faulkner-belkin'
                    ? '2004 Parking Entrance'
                    : 'MC Garage Entrance'
        ))

    useEffect(() => {
        setDropOffLocation(window.sessionStorage.getItem('destination')
            ??
            (currLocation === 'chestnut_hill'
                    ? 'Lot A1'
                    : currLocation === 'patriot_place'
                        ? 'Patriot Lot 22C'
                        : currLocation === 'faulkner-belkin'
                            ? '2004 Parking Entrance'
                            : 'MC Garage Entrance'
            ))
    }, [showOverlay]);

    const handleMetric = () => {
        const newMetric = !currentMetric;
        setCurrentMetric(newMetric);
        sessionStorage.setItem('unit', newMetric ? 'feet' : 'meters');
    };

    function updateNode(change: number, max: number): void {
        const newIndex = startingIndex + change;
        if (newIndex >= 0 && newIndex < max) {
            setStartingIndex(newIndex);
        }
    }

    useEffect(() => {
        if (currLocation === 'chestnut_hill') {
            switch (floorNumber) {
                case 0:
                    setShowParkingLot(true)
                    break;
                case 1:
                    setShowParkingLot(false);
                    break;
            }
        } else if (currLocation === 'patriot_place') {
            switch (floorNumber) {
                case 0:
                    setShowParkingLot(true);
                    break;
                default:
                    setShowParkingLot(false);
      break;
            }
        }
    }, [floorNumber]);

    useEffect(() => {
        if (currLocation === 'chestnut_hill') {
            setDesiredFloor(1);
            setStartLocation(showParkingLot ? dropOffLocation! : endLocation);
            setEndLocation(
                showParkingLot
                    ? dropOffLocation === 'Lot A1'
                        ? 'South Entrance'
                        : 'West Entrance'
                    : 'Reception Desk'
            );
        } else if (currLocation === 'patriot_place') {
            setStartLocation(
                showParkingLot // if showing parking lot
                    ? dropOffLocation! // if dropofflocation
                    : floorNumber === 0
                        ? 'Patriot Lot 22C'
                        : floorNumber === 1 // if floor is 1
                            ? 'P20 F1 SW Side Entrance' // if showing parking lot and dropofflocation exists and floor 1, then set startlocation as this
                            : floorNumber === 2
                                ? 'P22 F2 Patriot 22 Entrance West' // if showing parking lot and dropofflocation exists and floor 1, then set startlocation as thi2
                                : floorNumber === 3
                                    ? 'P22 F3 Elevator 2' // if showing parking lot and dropofflocation exists and floor 3, then set startlocation as this
                                    : 'P22 F4 Elevator 2' // if showing parking lot and dropofflocation exists and floor (4), then set startlocation as this
            );
            setEndLocation(
                showParkingLot
                    ? '20 Patriot Place Entrance' // if showing parking lot and dropofflocation is not pl22c (so dropoff is 20 i guess) set end location as this
                    : floorNumber === 1 // if not showing parking lot and floor number is 1
                        ? 'P20 F1 Check-In Reception' // then set end location as p20f1
                        : endLocation // if not showing parking lot and floor number is not 1, then dont touch end location
            );
        } else if (currLocation === 'faulkner-belkin') {
            setStartLocation('2004 Parking Entrance');
            setEndLocation('Faulkner Information Desk');
        } else if (currLocation === 'main_campus'){
            setStartLocation('MC Garage Entrance');
            setEndLocation('MC Reception');
        }
    }, [showParkingLot, dropOffLocation]);

    console.log(desiredFloor)

    console.log(pathData)

    useEffect(() => {
        if (startLocation !== '' && endLocation !== '') {
            let mapReq;
            if (currLocation === 'chestnut_hill') {
                mapReq = showParkingLot ? 'Chestnut Hill Parking Lot' : 'Chestnut Hill Hospital';
            } else if (currLocation === 'patriot_place') {
                mapReq = showParkingLot ? 'Patriot Place Parking Lot' : 'Patriot Place Hospital';
            } else if (currLocation === 'faulkner-belkin') {
                mapReq = 'Faulkner-Belkin Hospital Map';
            }  else if (currLocation === 'main_campus') {
                mapReq = "Main Campus";
            }

            fetch('/api/pathfinding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    map: mapReq,
                    start: startLocation,
                    end: endLocation,
                    algorithm: algorithm,
                }),
            })
                .then((r) => r.json())
                .then((data: NodePathfindingDatatype) => setPathData(data))
                .catch(() => console.log("error pathfinding!"));
        }
    }, [startLocation, algorithm, showOverlay]);

    useEffect(() => {
        if (voiceDepartment.departmentID!==-1 && (!showParkingLot || currLocation === "main_campus" || currLocation === "patriot_place" || currLocation === "faulkner-belkin"))
        setSelectedDepartment(JSON.stringify(voiceDepartment))
        setVoiceDepartment(
        {
            name: '',
                floor: '0',
            departmentID: -1,
            buildingID: 0,
            location: '',
            phone: '',
            services: '',
            building: {
            name: '',
                id: 0,
        }})
    }, [voiceDepartment]);
    useEffect(() => {
        let department: Prisma.DepartmentGetPayload<{ include: { building: true } }> = {
            name: '',
            floor: '0',
            departmentID: 0,
            buildingID: 0,
            location: '',
            phone: '',
            services: '',
            building: {
                name: '',
                id: 0,
            },
        };

        if (selectedDepartment?.includes('{')) {
            department = JSON.parse(selectedDepartment);
            console.log(department.building.name);
            console.log('help me')
            if (!showOverlay && department.departmentID!==-1) {
                setShowOverlay(true)
            }
            if (department.building.name === 'Chestnut Hill Hospital') {
                setDesiredFloor(1);
                setEndLocation(
                    showParkingLot
                        ? startLocation === 'Lot A1'
                            ? 'South Entrance'
                            : 'West Entrance'
                        : 'Reception Desk'
                );
            }
            else if (department.building.name === 'Faulkner Hospital') {
                setEndLocation('Faulkner Information Desk');
            }
            else if (department.building.name === 'Belkin House') {
                setEndLocation('Belkin Lobby');
            }
            else if (department.building.name === '22 Patriot Place') {
                if (floorNumber === 0) { //if parking lot
                    setDesiredFloor(2); //floor 2 == patriot 22 floor 1
                    setEndLocation('22 Patriot Place Entrance'); //set entrance to 22 patriot entrance
                }
                else {
                    if (department.floor === '3') {
                        setDesiredFloor(3);
                        setEndLocation('P22 F3 Check-In Desk');
                    }
                    else if (department.floor === '4') {
                        setDesiredFloor(4);
                        setEndLocation('P22 F4 Check-In Desk');
                    }
                }
            }
            else if (department.building.name === '20 Patriot Place') {
                //console.log(department.building.name)
                if (floorNumber === 0) {
                    setDesiredFloor(1); //floor 1 == patriot 20 floor 1
                    setEndLocation('20 Patriot Place Entrance');
                }
                else if (floorNumber === 1) {
                    setEndLocation('P20 F1 Check-In Reception');
                }
            }
            else if (department.building.name === 'Main Campus') {
                if (floorNumber === 0) {
                    setEndLocation('MC Reception');
                }
            }
        }
        else {
            if (selectedDepartment) {
                setEndLocation(selectedDepartment);
            }
        }
    }, [startLocation ,selectedDepartment, floorNumber, showParkingLot]);

    useEffect(() => {
        fetchDepartments(10, 1000, true, setDepartments).then(() => {
            if (currLocation === "patriot_place"){

                setDesiredFloor(1);
            }
        })
    }, []);

    return (
        <>
            <SidebarProvider>
                <Sidebar>
                    <SidebarContent className="bg-[#DFE9F2] drop-shadow-2xl">
                        <SidebarGroup>
                            {!showOverlay ? (
                                <div className="flex flex-col justify-center items-center h-full">
                                    <div className={'relative top-30'}>
                                        <Form
                                            gMapsApiStatus={gMapsApiStatus}
                                            setMapDirections={setMapDirections}
                                        />
                                    </div>
                                    <hr className="relative top-35 w-full border-(--color-buttonblue)" />
                                    <div className={'relative top-40'}>
                                        <button
                                            type="button"
                                            className="buttonLook cursor-pointer text-center text-1xl text-white shadow-md rounded-sm p-1 mt-2 mb-2  w-25 h-10"
                                            onClick={() => setShowOverlay((prev) => !prev)}
                                        >
                                            {showOverlay ? 'Go Back' : "I've Arrived"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col justify-center items-center h-full">
                                    <Grid
                                        container
                                        spacing={1}
                                        className="relative top-30"
                                        sx={{ width: 'auto', minHeight: 'auto' }}

                                    >
                                        <div>
                                            <div className="justify-between items-center">
                                                {isLoggedIn && isAdmin && (
                                                    <div className="absolute right-0 -top-8">
                                                        <IconButton
                                                            onClick={(e) =>
                                                                setAnchorEl(e.currentTarget)
                                                            }
                                                            sx={{
                                                                color: 'var(--color-buttonblue)',
                                                            }}
                                                        >
                                                            <SettingsIcon />
                                                        </IconButton>
                                                        <Menu
                                                            anchorEl={anchorEl}
                                                            open={Boolean(anchorEl)}
                                                            onClose={() => setAnchorEl(null)}
                                                        >
                                                            <MenuItem
                                                                onClick={() => handleAlgorithmChange('dijkstra')}
                                                                selected={algorithm === 'dijkstra'}
                                                            >
                                                                Dijkstra's Algorithm
                                                            </MenuItem>
                                                            <MenuItem
                                                                onClick={() => handleAlgorithmChange('dfs')}
                                                                selected={algorithm === 'dfs'}
                                                            >
                                                                Depth-First Search
                                                            </MenuItem>
                                                        </Menu>
                                                    </div>
                                                )}
                                                <div className="flex text-2xl justify-center text-center font-semibold whitespace-pre-line titleFont text-[#044ca4]">
                                                    {currLocation === 'chestnut_hill' &&
                                                        (showParkingLot
                                                            ? 'Chestnut Hill\nParking Lot'
                                                            : 'Chestnut Hill\n- First Floor')}
                                                    {currLocation === 'patriot_place' &&
                                                        (floorNumber === 0
                                                            ? 'Patriot Place\nParking Lot'
                                                            : floorNumber === 1
                                                                ? '20 Patriot Place\n- First Floor'
                                                                : floorNumber === 2
                                                                    ? '22 Patriot Place\n- First Floor'
                                                                    : floorNumber === 3
                                                                        ? '22 Patriot Place\n- Third Floor'
                                                                        : '22 Patriot Place\n- Fourth Floor')}
                                                    {currLocation === 'faulkner-belkin' &&
                                                        'Faulkner-Belkin\nHospital Campus'}
                                                    {currLocation === 'main_campus' &&
                                                        'Main Campus Hospital'}
                                                </div>
                                            </div>
                                            <div
                                                className="flex flex-col mt-2"
                                                style={{ width: '14rem' }}
                                            >
                                                <label
                                                    className="text-1xl mx-auto"
                                                    htmlFor="startLocation"
                                                >
                                                    Entrance Location:
                                                </label>
                                                <select
                                                    value={startLocation}
                                                    className=" text-center text-1xl bg-[#044ca4] text-white shadow-md rounded-sm p-1 mt-1 mb-2"
                                                    name="startLocation"
                                                    id="sL"
                                                    onChange={(e) =>
                                                        setStartLocation(e.target.value)
                                                    }
                                                >
                                                    {currLocation === 'chestnut_hill' ? (
                                                        floorNumber === 0 ? (
                                                            <>
                                                                <option value="Lot A1">
                                                                    Parking Lot A
                                                                </option>
                                                                <option value="Lot B1">
                                                                    Parking Lot B
                                                                </option>
                                                                <option value="Lot C1">
                                                                    Parking Lot C
                                                                </option>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <option value="South Entrance">
                                                                    South Entrance
                                                                </option>
                                                                <option value="West Entrance">
                                                                    West Entrance
                                                                </option>
                                                            </>
                                                        )
                                                    ) : currLocation === 'patriot_place' ? (
                                                        floorNumber === 0 ? (
                                                            <>
                                                                <option value="Patriot Lot 22C">
                                                                    Parking Lot 22
                                                                </option>
                                                                <option value="Lot 23B">
                                                                    Parking Lot 23
                                                                </option>
                                                            </>
                                                        ) : floorNumber === 1 ? (
                                                            <>
                                                                <option value="P20 F1 SW Corner Entrance">
                                                                    Main Entrance
                                                                </option>
                                                                <option value="P20 F1 SW Side Entrance">
                                                                    Side Entrance
                                                                </option>
                                                            </>
                                                        ) : floorNumber === 2 ? (
                                                            <>
                                                                <option value="P22 F2 Patriot 22 Entrance West">
                                                                    West Entrance
                                                                </option>
                                                            </>
                                                        ) : floorNumber === 3 ? (
                                                            <>
                                                                <option value="P22 F3 Elevator 2">
                                                                    Elevators
                                                                </option>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <option value="P22 F4 Elevator 2">
                                                                    Elevators
                                                                </option>
                                                            </>
                                                        )
                                                    ) : currLocation === 'faulkner-belkin' ? (
                                                        <>
                                                            <option value="2004 Parking Entrance">
                                                                2004 Parking Entrance
                                                            </option>
                                                            <option value="1975 Parking Entrance">
                                                                1975 Parking Entrance
                                                            </option>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <option value="MC Garage Entrance">
                                                                45 Francis Parking
                                                            </option>
                                                        </>
                                                    )}
                                                </select>
                                                <label
                                                    className="text-1xl mx-auto"
                                                    htmlFor="endLocation"
                                                >
                                                    Destination:
                                                </label>
                                                <select
                                                    value={selectedDepartment}
                                                    className=" text-center text-1xl bg-[#044ca4] text-white shadow-md rounded-sm p-1 mt-1 mb-2"
                                                    name="endLocation"
                                                    id="eL"
                                                    onChange={(e) =>
                                                        setSelectedDepartment(e.target.value)
                                                    }
                                                >
                                                    {currLocation === 'chestnut_hill' ? (
                                                        <>
                                                            <optgroup label={'Departments'}>
                                                                {departments.map((dept) => (
                                                                    <option
                                                                        value={JSON.stringify(
                                                                            dept
                                                                        )}
                                                                    >
                                                                        {dept.name}
                                                                    </option>
                                                                ))}
                                                            </optgroup>
                                                        </>
                                                    ) : currLocation === 'patriot_place' ? (
                                                        floorNumber === 0 ? (
                                                            <>

                                                                <optgroup label={'Departments'}>
                                                                    {departments.map((dept) => (
                                                                        <option
                                                                            value={JSON.stringify(
                                                                                dept
                                                                            )}
                                                                        >
                                                                            {dept.name}
                                                                        </option>
                                                                    ))}
                                                                </optgroup>
                                                            </>
                                                        ) : floorNumber === 1 ? (
                                                            <>

                                                                <optgroup label={'Departments'}>
                                                                    {departments.map((dept) => (
                                                                        <option
                                                                            value={JSON.stringify(
                                                                                dept
                                                                            )}
                                                                        >
                                                                            {dept.name}
                                                                        </option>
                                                                    ))}
                                                                </optgroup>
                                                            </>
                                                        ) : (
                                                            <>

                                                                <optgroup label={'Departments'}>
                                                                    {departments.map((dept) => (
                                                                        <option
                                                                            value={JSON.stringify(
                                                                                dept
                                                                            )}
                                                                        >
                                                                            {dept.name}
                                                                        </option>
                                                                    ))}
                                                                </optgroup>
                                                            </>
                                                        )
                                                    ) : currLocation === 'faulkner-belkin' ? (
                                                        <>
                                                            <optgroup label={'Departments'}>
                                                                {departments.map((dept) => (
                                                                    <option
                                                                        value={JSON.stringify(dept)}
                                                                    >
                                                                        {dept.name}
                                                                    </option>
                                                                ))}
                                                            </optgroup>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <optgroup label={'Departments'}>
                                                                {departments.map((dept) => (
                                                                    <option
                                                                        value={JSON.stringify(dept)}
                                                                    >
                                                                        {dept.name}
                                                                    </option>
                                                                ))}
                                                            </optgroup>
                                                        </>
                                                    )}
                                                </select>
                                                <hr className="mt-1 mb-2 border-(--color-buttonblue)" />
                                                <InternalTextDirections
                                                    pathData={pathData}
                                                    nextPrevFunc={updateNode}
                                                    floorNumber={floorNumber}
                                                    desiredFloor={desiredFloor}
                                                    setFloorNumber={setFloorNumber}
                                                    index={startingIndex}
                                                    setIndex={setStartingIndex}
                                                />
                                            </div>
                                        </div>
                                    </Grid>
                                    <SVGOverlay
                                        floor={floorNumber}
                                        mapLocation={currLocation!}
                                        startLocation={startLocation}
                                        endLocation={endLocation}
                                        algorithm={algorithm}
                                        index={startingIndex}
                                        rotation={rotateMap}
                                        zoom={showOverlay}
                                    />

                                    <hr className="relative top-35 w-full border-(--color-buttonblue)" />

                                    <div className={'relative top-35'}>
                                        <button
                                            type="button"
                                            className="transition-transform duration-200 ease-in-out hover:scale-105 cursor-pointer text-center text-1xl bg-[#003A96] hover:bg-[#044ca4] text-white shadow-md rounded-sm p-1 mt-2 mb-2 headerFont w-50 h-10"
                                            onClick={handleMetric}
                                        >
                                            Current Units: {currentMetric ? 'Feet' : 'Meters'}
                                        </button>
                                    </div>

                                    <div className={'relative top-35'}>
                                        <button
                                            type="button"
                                            className="buttonLook cursor-pointer text-center text-1xl text-white shadow-md rounded-sm p-1 mt-2 mb-2  w-25 h-10"
                                            onClick={() => setShowOverlay((prev) => !prev)}
                                        >
                                            {showOverlay ? 'Go Back' : "I've Arrived"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
            </SidebarProvider>
        </>
    );
};

export default MapOverlay;
