import { useEffect, useRef, useState } from 'react';
import { Grid, Typography, Collapse, Button, Switch, FormControlLabel, Fade } from '@mui/material';
import AddressAutocomplete from './AddressAutocomplete';
import AddressSelect from './AddressSelect';
import TravelMode from './TravelMode';
import '/src/styles.css';

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

interface MatrixResponse {
    distance: string;
    duration: string;
}

interface Props {
    gMapsApiStatus: boolean;
    setMapDirections(directions: google.maps.DirectionsResult | undefined): void;
}

const Form = ({ gMapsApiStatus, setMapDirections }: Props) => {
    const [pointOrigin, setPointOrigin] = useState<google.maps.places.PlaceResult>();
    const [pointDestination, setPointDestination] = useState<google.maps.places.PlaceResult>();
    const [matrix, setMatrix] = useState<MatrixResponse | null>(null);
    const [travelMethod, setTravelMethod] = useState<google.maps.TravelMode>();
    const [voiceEnabled, setVoiceEnabled] = useState(false);

    // used to make TTS say map directions correctly
    const expandMapAbbreviations = (str: string) => {
        const abbreviations = {
            st: 'street',
            rd: 'road',
            ave: 'avenue',
            blvd: 'boulevard',
            ln: 'lane',
            dr: 'drive',
            ctr: 'center',
            ct: 'court',
            pkwy: 'parkway',
            sq: 'square',
            s: 'south',
            n: 'north',
            e: 'east',
            w: 'west',
            rte: 'route',
            mi: 'miles',
            cmn: 'common',
        };

        // regex matches abbreviations using word boundaries
        // | joins keys so regex matches any of them
        const pattern = new RegExp(`\\b(${Object.keys(abbreviations).join('|')})\\b`, 'gi');

        // replace each match with its corresponding full name
        return str.replace(pattern, (match: string) => {
            // use lower case for lookup because our mapping keys are lowercase
            return abbreviations[match.toLowerCase()];
        });
    };

    // State to hold step-by-step directions
    const [directions, setDirections] = useState<google.maps.DirectionsStep[]>([]);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [showAllSteps, setShowAllSteps] = useState<boolean>(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Plays voice if enabled after each step
    useEffect(() => {
        const playIfVoiceEnabled = async () => {
            if (voiceEnabled) {
                await playTTS(
                    expandMapAbbreviations(
                        directions[currentStep].instructions
                            .replace(/<div[^>]*>[\s\S]*?<\/div>/gi, '')
                            .replace(/<[^>]*>/g, '')
                    ),
                    audioRef
                );
            }
        };

        playIfVoiceEnabled();
    }, [currentStep, voiceEnabled]);

    // new state: preview before showing full directions
    const [showPreview, setShowPreview] = useState<boolean>(false);

    //Calculates the travel distance
    const calculateMatrix = async (
        points: google.maps.places.PlaceResult[],
        method: google.maps.TravelMode
    ) => {
        const service = new google.maps.DistanceMatrixService();

        const matrixRequest: google.maps.DistanceMatrixRequest = {
            destinations: [
                new google.maps.LatLng(
                    points[1].geometry!.location!.lat(),
                    points[1].geometry!.location!.lng()
                ),
            ],
            origins: [
                new google.maps.LatLng(
                    points[0].geometry!.location!.lat(),
                    points[0].geometry!.location!.lng()
                ),
            ],
            travelMode: method,
            transitOptions: {},
        };

        const matrix = await service.getDistanceMatrix(matrixRequest);

        return {
            distance: (matrix.rows[0].elements[0].distance.value * 0.000621371).toFixed(1),
            duration: matrix.rows[0].elements[0].duration.text,
        };
    };

    //Creates route on the map
    const calculateDirections = async (
        points: google.maps.places.PlaceResult[],
        method: google.maps.TravelMode
    ) => {
        const service = new google.maps.DirectionsService();

        return await service.route({
            origin: new google.maps.LatLng(
                points[0].geometry!.location!.lat(),
                points[0].geometry!.location!.lng()
            )!,
            destination: new google.maps.LatLng(
                points[1].geometry!.location!.lat(),
                points[1].geometry!.location!.lng()
            )!,
            travelMode: method,
        });
    };

    // Gets route, stores matrix + preview mode before full directions
    const onGetDirections = async () => {
        if (pointOrigin && pointDestination && travelMethod) {
            const [result, matrixResult] = await Promise.all([
                calculateDirections([pointOrigin, pointDestination], travelMethod),
                calculateMatrix([pointOrigin, pointDestination], travelMethod),
            ]);

            if (result && matrixResult) {
                setMapDirections(result);
                setMatrix(matrixResult);
                setDirections(result.routes[0].legs[0].steps);
                setCurrentStep(0);
                setShowPreview(true);
            }
        }
    };

    // Goes back to edit the route
    const onEditRoute = () => {
        setDirections([]);
        setCurrentStep(0);
        setShowAllSteps(false);
        setMapDirections(undefined);
        setMatrix(null);
        setShowPreview(false);
    };

    // Chooses icon based on instruction keywords
    const getDirectionIcon = (instruction: string) => {
        const lower = instruction.toLowerCase();
        if (lower.includes('left')) return <TurnLeft fontSize="small" sx={{ mr: 0.5 }} />;
        if (lower.includes('right')) return <TurnRight fontSize="small" sx={{ mr: 0.5 }} />;
        if (lower.includes('straight')) return <Straight fontSize="small" sx={{ mr: 0.5 }} />;
        if (lower.includes('walk')) return <DirectionsWalk fontSize="small" sx={{ mr: 0.5 }} />;
        if (lower.includes('bus')) return <DirectionsBus fontSize="small" sx={{ mr: 0.5 }} />;
        if (lower.includes('drive')) return <DirectionsCar fontSize="small" sx={{ mr: 0.5 }} />;
        return <ArrowForward fontSize="small" sx={{ mr: 0.5 }} />;
    };

    return (
        <form>
            {/* Request input & result modal box */}
            <Grid
                container
                sx={{
                    width: '15rem',
                    minHeight: 'auto',
                    fontFamily: 'newsreader Variable,serif',
                    color: 'white',
                }}
            >
                {/* show input fields only if directions haven't been generated */}
                <Fade in={directions.length === 0 && !showPreview}>
                    <div style={{ width: '100%' }}>
                        {directions.length === 0 && !showPreview && (
                            <>
                                {/* Travel method */}
                                <TravelMode
                                    gMapsApiStatus={gMapsApiStatus}
                                    setMode={setTravelMethod}
                                    label={'Travel Mode'}
                                    className="mb-4 headerFont "
                                    // style={{ fontFamily: 'Newsreader Variable, serif' }}
                                />
                                {/* Origin input */}
                                <AddressAutocomplete
                                    gMapsApiStatus={gMapsApiStatus}
                                    setAddress={setPointOrigin}
                                    label="Start"
                                />

                                {/* Destination input */}
                                <AddressSelect
                                    gMapsApiStatus={gMapsApiStatus}
                                    setAddress={setPointDestination}
                                    label="End"
                                />
                                {/* Get route button */}
                                <button
                                    onClick={onGetDirections}
                                    type="button"
                                    className="w-full transition-transform duration-200 ease-in-out hover:scale-105 cursor-pointer text-center text-1xl
                                    text-white shadow-md rounded-sm p-1 mt-2 mb-2 buttonLook"

                                    // bg-[#003A96] hover:bg-[#044ca4]
                                >
                                    Route on Map
                                </button>
                            </>
                        )}
                    </div>
                </Fade>

                {/* Preview mode before full directions */}
                <Fade in={showPreview}>
                    <div style={{ width: '100%' }}>
                        {showPreview && (
                            <>
                                <Typography
                                    variant="subtitle1"
                                    className="mb-1 font-bold headerFont text-[#385DA6] "
                                    sx={{
                                        fontFamily: 'Newsreader Variable, serif',
                                        fontWeight: 'bold',
                                        fontSize: '1.3rem',
                                    }}
                                >
                                    Route Preview
                                </Typography>
                                {matrix && (
                                    <Typography
                                        variant="body2"
                                        className="mb-2 text-[#385DA6]"
                                        sx={{
                                            fontFamily: 'Newsreader Variable, serif',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        <strong>Est. Distance:</strong> {matrix.distance}
                                        <br />
                                        <strong>Est. Duration:</strong> {matrix.duration}
                                        <br />
                                        <br />
                                    </Typography>
                                )}
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Button
                                            size="small"
                                            fullWidth
                                            onClick={onEditRoute}
                                            // className="buttonLook"
                                            sx={{
                                                textAlign: 'center',
                                                fontFamily: 'Newsreader Variable, serif',
                                                fontWeight: 'bold',
                                                color: 'white',
                                                backgroundColor: '#044ca4',
                                                justifyContent: 'center',
                                                paddingTop: '8px',

                                                '&:hover': {
                                                    backgroundColor: '#3F74B8',
                                                },
                                            }}
                                        >
                                            Go Back
                                        </Button>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Button
                                            style={{}}
                                            // variant="contained"
                                            size="small"
                                            fullWidth
                                            onClick={() => setShowPreview(false)}
                                            className="buttonLook"
                                            sx={{
                                                fontFamily: 'Newsreader Variable, serif',
                                                fontWeight: 'bold',
                                                color: 'white',
                                                backgroundColor: '#044ca4',
                                                '&:hover': {
                                                    backgroundColor: ' #3F74B8',
                                                },

                                                justifyContent: 'center',
                                                paddingTop: '8px',
                                            }}
                                        >
                                            Start
                                        </Button>
                                    </Grid>
                                </Grid>
                            </>
                        )}
                    </div>
                </Fade>

                {/* full step-by-step directions */}
                <Fade in={directions.length > 0 && !showPreview}>
                    <div style={{ width: '100%' }}>
                        {directions.length > 0 && !showPreview && (
                            <>
                                <div className={'flex justify-around'}>
                                    {/* Directions display */}
                                    <Typography
                                        variant="subtitle1"
                                        className="mb-1 font-bold float-left text-[#385DA6] headerFont"
                                        sx={{
                                            fontFamily: 'Newsreader Variable, serif',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        Directions
                                    </Typography>
                                    {/* add space between text and voice switch */}
                                    <div className={'flex-grow '}></div>
                                    {/* switch to toggle voice */}
                                    <FormControlLabel
                                        className={'float-right'}
                                        labelPlacement={'start'}
                                        control={
                                            <Switch
                                                size={'small'}
                                                onChange={(event, checked) =>
                                                    setVoiceEnabled(checked)
                                                }
                                                sx={{
                                                    fontFamily: 'Newsreader Variable, serif',
                                                    color: '#385DA6',
                                                    fontWeight: 'bold',
                                                }}
                                            />
                                        }
                                        sx={{
                                            fontFamily: 'Newsreader Variable, serif',
                                            color: '#385DA6',
                                            fontWeight: 'bold',
                                        }}
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
                                    />
                                </div>
                                <div className="mb-2"></div>

                                {/* current step display */}
                                {directions[currentStep] && (
                                    <Typography
                                        variant="body2"
                                        className="mb-2 flex flex-col text-black w-[270px] h-[100px] overflow-auto"
                                    >
                                        <strong>Current Step:</strong>{' '}
                                        {getDirectionIcon(directions[currentStep].instructions)}
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: directions[currentStep].instructions,
                                            }}
                                        />
                                    </Typography>
                                )}
                                <div className="mb-2"></div>

                                {/* toggle all steps view */}
                                <Button
                                    onClick={() => setShowAllSteps(!showAllSteps)}
                                    variant="text"
                                    size="small"
                                    className="mb-2 text-xs text-[#385DA6]"
                                    sx={{
                                        fontFamily: 'Newsreader Variable, serif',
                                        fontWeight: 'bold',
                                        color: '#385DA6',
                                    }}
                                >
                                    {showAllSteps ? 'Hide Full Route' : 'Show Full Route'}
                                </Button>

                                {/* collapsible full step list */}
                                <Collapse in={showAllSteps}>
                                    <div
                                        className={'mt-0.5'}
                                        style={{
                                            maxHeight: '9.375em',
                                            overflowY: 'auto',
                                            backgroundColor: '#f5f5f5',
                                            padding: '0.5em',
                                            borderRadius: '0.25em',
                                        }}
                                    >
                                        {directions.map((step, index) => (
                                            <Typography
                                                key={index}
                                                variant="body2"
                                                className="mb-1 flex items-center text-black"
                                            >
                                                {getDirectionIcon(step.instructions)}
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: step.instructions,
                                                    }}
                                                />
                                            </Typography>
                                        ))}
                                    </div>
                                </Collapse>

                                {/* navigation buttons to step through instructions */}
                                <Grid container spacing={1} sx={{ mt: 0.1 }}>
                                    <Grid item xs={6}>
                                        <Button
                                            onClick={() =>
                                                setCurrentStep((prev) => Math.max(prev - 1, 0))
                                            }
                                            disabled={currentStep === 0}
                                            fullWidth
                                            size="small"
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
                                            onClick={() =>
                                                setCurrentStep((prev) =>
                                                    Math.min(prev + 1, directions.length - 1)
                                                )
                                            }
                                            // variant="outlined"
                                            fullWidth
                                            size="small"
                                            disabled={currentStep === directions.length - 1}
                                            sx={{
                                                fontFamily: 'Newsreader Variable, serif',
                                                fontWeight: 'bold',
                                                color: 'white',
                                                backgroundColor: '#044ca4',

                                                '&.Mui-disabled': {
                                                    color: 'grey.300',
                                                    backgroundColor: '#799BCC',
                                                },
                                                '&:hover': {
                                                    backgroundColor: ' #3F74B8',
                                                },

                                                justifyContent: 'center',
                                                paddingTop: '8px',
                                            }}
                                        >
                                            Next
                                        </Button>
                                    </Grid>
                                </Grid>

                                {/* edit route button */}
                                <Button
                                    onClick={onEditRoute}
                                    // variant="outlined"
                                    size="small"
                                    fullWidth
                                    // sx={{ mt: 1 }}
                                    sx={{
                                        mt: 2,
                                        fontFamily: 'Newsreader Variable, serif',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        backgroundColor: '#044ca4',
                                        '&:hover': {
                                            backgroundColor: '#3F74B8',
                                        },

                                        justifyContent: 'center',
                                        paddingTop: '8px',
                                    }}
                                >
                                    Cancel Navigation
                                </Button>
                            </>
                        )}
                    </div>
                </Fade>
            </Grid>
        </form>
    );
};

export default Form;