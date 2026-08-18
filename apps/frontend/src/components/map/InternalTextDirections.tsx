import React, { useEffect, useState, useRef } from 'react';
import { Typography, Button, Collapse, Grid, Switch, FormControlLabel } from '@mui/material';
import {
    ArrowForward,
    TurnLeft,
    TurnRight,
    Straight,
    DirectionsWalk,
    DirectionsBus,
    DirectionsCar,
} from '@mui/icons-material';
import { playTTS } from '../../lib/utils.ts';
import { NodePathfindingDatatype } from '../../typeDefinition/jsonTypes.ts';


interface Props {
    pathData: NodePathfindingDatatype | undefined;
    nextPrevFunc: (change: number, max: number) => void;
    desiredFloor: number;
    floorNumber: number;
    setFloorNumber: (floorNumber: number) => void;
    index: number;
    setIndex: (index: number) => void;
}

function inchesToFeet(inches: number): number {
    return Math.round(inches / 12);
}

function inchesToMeters(inches: number): number {
    return +(inches * 0.0254).toFixed(1); // round to 1 decimal place
}

function computeHeading(fromCoords: number[], toCoords: number[]): number {
    const dx = toCoords[0] - fromCoords[0];
    const dy = toCoords[1] - fromCoords[1];
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return (angle + 360) % 360;
}

// this is NOT  hard coded pls ignore the next function it is a halluciantion of your dreams
function getTurnPhrase(diff: number): string {
    if (diff < 15 || diff > 345) return 'Continue straight';
    if (diff >= 15 && diff < 45) return 'Turn slight right';
    if (diff >= 45 && diff < 135) return 'Turn right';
    if (diff >= 135 && diff < 165) return 'Turn hard right';
    if (diff >= 165 && diff <= 195) return 'Make a U-turn';
    if (diff > 195 && diff <= 225) return 'Turn hard left';
    if (diff > 225 && diff <= 315) return 'Turn left';
    if (diff > 315 && diff <= 345) return 'Turn slight left';
    return 'Turn';
}

function generateTextDirections({
                                    displayNames,
                                    nodeFloors,
                                    coords,
                                    edgeLengths,
                                    unit,
                                }: {
    displayNames: string[];
    nodeFloors: number[];
    coords: number[];
    edgeLengths: number[];
    unit: 'feet' | 'meters';
}): string[] {
    const directions: string[] = [];
    let prevHeading: number | null = null;
    const coordPairs: number[][] = [];
    for (let i = 0; i < coords.length; i += 2) {
        coordPairs.push([coords[i], coords[i + 1]]);
    }
    for (let i = 1; i < displayNames.length; i++) {
        const to = displayNames[i];
        const floorFrom = nodeFloors[i - 1];
        const floorTo = nodeFloors[i];
        const distInches = edgeLengths[i - 1];
        const distanceStr = unit === 'meters'
            ? `${inchesToMeters(distInches)} meters`
            : `${inchesToFeet(distInches)} feet`;
        const heading = computeHeading(coordPairs[i - 1], coordPairs[i]);
        if (floorFrom !== floorTo) {
            directions.push(`Take elevator or stairs to floor ${floorTo}`);
            prevHeading = null;
            continue;
        }
        let instruction = '';
        if (prevHeading === null) {
            instruction = `Start walking toward ${to} (${distanceStr})`;
        } else {
            const diff = (heading - prevHeading + 360) % 360;
            if (diff < 15 || diff > 345) {
                instruction = `Continue straight for ${distanceStr} toward ${to}`;
            } else {
                const turn = getTurnPhrase(diff);
                instruction = `${turn} in ${distanceStr} toward ${to}`;
            }
        }
        directions.push(instruction);
        prevHeading = heading;
    }
    return directions;
}

function getDirectionIcon(instruction: string) {
    const lower = instruction.toLowerCase();
    if (lower.includes("left")) return <TurnLeft fontSize="small" sx={{ mr: 0.5 }} />;
    if (lower.includes("right")) return <TurnRight fontSize="small" sx={{ mr: 0.5 }} />;
    if (lower.includes("straight")) return <Straight fontSize="small" sx={{ mr: 0.5 }} />;
    if (lower.includes("walk")) return <DirectionsWalk fontSize="small" sx={{ mr: 0.5 }} />;
    if (lower.includes("bus")) return <DirectionsBus fontSize="small" sx={{ mr: 0.5 }} />;
    if (lower.includes("drive")) return <DirectionsCar fontSize="small" sx={{ mr: 0.5 }} />;
    return <ArrowForward fontSize="small" sx={{ mr: 0.5 }} />;
}

const InternalTextDirections: React.FC<Props> = ({ pathData, nextPrevFunc, desiredFloor, floorNumber, setFloorNumber, index, setIndex}) => {
    const [directions, setDirections] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [showAllSteps, setShowAllSteps] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [atReception, setAtReception] = useState<boolean>(false);
    const [previousFloor, setPreviousFloor] = useState(0);
    const [previousNodeFloorLength, setPreviousNodeFloorLength] = useState(0);

    useEffect(() => {
        if (!pathData) {
            setDirections(['Loading directions...']);
            return;
        }

        const storedUnit = sessionStorage.getItem('unit') as 'feet' | 'meters' | null;

        const textSteps:string[] = generateTextDirections({
            displayNames: pathData.displayNames,
            nodeFloors: pathData.nodeFloors,
            coords: pathData.coords,
            edgeLengths: pathData.edgeLengths,
            unit: storedUnit === 'meters' ? 'meters' : 'feet', // default to feet
        });

        setDirections(textSteps);
        setCurrentStep(0);
        setShowAllSteps(false);
    }, [pathData, sessionStorage.getItem('unit')]);

    useEffect(() => {
        if (voiceEnabled && directions.length > 0 && directions[currentStep] && directions[0] !== 'Loading directions...') {
            playTTS(directions[currentStep], audioRef);
        }
        // chris's code but like mine
    }, [currentStep, voiceEnabled, directions]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    function prevOnClick() {
        setAtReception(false) //the moment you click previous, you're no longer at reception

        //checks if prev set node is first. If either floor 1 or 2, make sure it goes back to parking lot
        if(index === 0 && pathData!.nodeFloors[index] <= 2) {
            setFloorNumber(0); //every other map will go back to parking lot
            setIndex(previousNodeFloorLength);
        }

        //if the following previous will be on a different floor
        else if(pathData!.nodeFloors[index] !== pathData!.nodeFloors[index + 1])
        {
            setFloorNumber(pathData!.nodeFloors[index]) //do not adjust index since it is still the same path
        }

        setCurrentStep((prev:number):number => Math.max(prev - 1, 0));
        nextPrevFunc(-1, pathData!.edgeLengths.length);
    }

    function nextOnClick():void {
        setCurrentStep((prev:number):number => Math.min(prev + 1, directions.length - 1));
        nextPrevFunc(1, pathData!.edgeLengths.length);

        //check if at final node, or if the current node floor is not equal to next node floor
        if(index === (pathData!.edgeLengths.length) - 1 || pathData!.nodeFloors[index] !== pathData!.nodeFloors[index + 1])
        {
            if(pathData!.nodeFloors[index] < 1) {
                if(desiredFloor <= 2) {
                    setPreviousNodeFloorLength(pathData!.nodeFloors.length - 1); //saves previous floor # nodes
                    setPreviousFloor(pathData!.nodeFloors[index]); //saves previous floor number
                    setFloorNumber(desiredFloor);
                }
            }

            if(desiredFloor >= 3) { //if patriot (floor 3 or 4), DO NOT SAVE PREVIOUS NODE FLOOR LENGTH, IT'S THE SAME NODE PATH
                setPreviousFloor(pathData!.nodeFloors[index]); //saves previous floor number
                setFloorNumber(desiredFloor);
            }

            // make sure not to set previousModeFloorLength to get back to parking properly
            if((pathData!.pathNames[pathData!.nodeFloors.length - 1] === "Reception Desk" ||
                pathData!.pathNames[pathData!.nodeFloors.length - 1] === 'Faulkner Information Desk' ||
                pathData!.pathNames[pathData!.nodeFloors.length - 1] === 'Belkin Lobby' ||
                pathData!.pathNames[pathData!.nodeFloors.length - 1] === 'P22 F3 Check-In Desk' ||
                pathData!.pathNames[pathData!.nodeFloors.length - 1] === 'P22 F4 Check-In Desk' ||
                pathData!.pathNames[pathData!.nodeFloors.length - 1] === 'P20 F1 Check-In Reception' ||
                pathData!.pathNames[pathData!.nodeFloors.length - 1] === 'MC Reception'
            )) {
                setAtReception(true); //if at any reception desk, toggle this true.
            }
            else
            {
                setAtReception(false); //if not at reception, set false
                setIndex(0);
            }
        }
    }

    if (!pathData) return <Typography>Loading directions...</Typography>;

    return (
        <div style={{ marginLeft: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={voiceEnabled}
                            onChange={(_, checked) => setVoiceEnabled(checked)}
                            color="primary"
                            size="small"
                        />
                    }
                    label={
                        <Typography
                            sx={{
                                fontFamily: 'Newsreader Variable, serif',
                                fontWeight: 'bold',
                                color: '#385DA6',
                            }}
                        >
                            Voice
                        </Typography>
                    }
                    style={{ marginRight: 12 }}
                />
            </div>
            {directions.length > 0 && directions[currentStep] && (
                <>
                    <Typography variant="body2" className="mb-2 flex items-center">
                        <strong>Current Step:</strong>
                        {getDirectionIcon(directions[currentStep])}
                        {directions[currentStep]}
                    </Typography>
                    <Button
                        onClick={() => setShowAllSteps(!showAllSteps)}
                        variant="text"
                        size="small"
                        className="mb-1 text-xs"
                        sx={{
                            fontFamily: 'Newsreader Variable, serif',
                            fontWeight: 'bold',
                            color: '#385DA6',
                        }}
                    >
                        {showAllSteps ? 'Hide Full Route' : 'Show Full Route'}
                    </Button>
                    <Collapse in={showAllSteps}>
                        <div
                            style={{
                                maxHeight: '150px',
                                overflowY: 'auto',
                                backgroundColor: '#f5f5f5',
                                padding: '8px',
                                borderRadius: '4px',
                            }}
                        >
                            {directions.map((step, i) => (
                                <Typography
                                    key={i}
                                    variant="body2"
                                    className="mb-1 flex items-center"
                                >
                                    {getDirectionIcon(step)}
                                    {step}
                                </Typography>
                            ))}
                        </div>
                    </Collapse>
                    <Grid container spacing={1} sx={{ mt: 0.1 }}>
                        <Grid item xs={6}>
                            <Button
                                onClick={prevOnClick}
                                variant="outlined"
                                fullWidth
                                size="small"
                                disabled={index === 0 && floorNumber === 0}
                                sx={{
                                    fontFamily: 'Newsreader Variable, serif',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    backgroundColor: '#044ca4',

                                    '&.Mui-disabled': {
                                        color: 'white',
                                        backgroundColor: '#799BCC',
                                    },
                                    '&:hover': {
                                        backgroundColor: '#3F74B8',
                                    },

                                    justifyContent: 'center',
                                    paddingTop: '8px',
                                }}
                            >
                                Previous
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                onClick={nextOnClick}
                                variant="outlined"
                                fullWidth
                                size="small"
                                disabled={index === directions.length || atReception}
                                sx={{
                                    fontFamily: 'Newsreader Variable, serif',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    backgroundColor: '#044ca4',

                                    '&.Mui-disabled': {
                                        color: 'white',
                                        backgroundColor: '#799BCC',
                                    },
                                    '&:hover': {
                                        backgroundColor: '#3F74B8',
                                    },

                                    justifyContent: 'center',
                                    paddingTop: '8px',
                                }}
                            >
                                Next
                            </Button>
                        </Grid>
                    </Grid>
                </>
            )}
        </div>
    );
};

export default InternalTextDirections;
