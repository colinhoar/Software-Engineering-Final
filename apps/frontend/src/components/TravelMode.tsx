import { Skeleton, Grid, FormLabel, Box, Select, MenuItem, FormControl, ListItemIcon, ListItemText } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsTransitIcon from "@mui/icons-material/DirectionsTransit";
import { useState, useEffect } from "react";

interface TravelModeOption {
    name: string;
    mode: google.maps.TravelMode;
}

interface Props {
    gMapsApiStatus: boolean;
    setMode(mode: google.maps.TravelMode): void;
    label: string;
}

const TravelMode = ({ gMapsApiStatus, setMode, label }: Props) => {

    const [selectedMode, setSelectedMode] = useState<google.maps.TravelMode | null>(null);
    const [travel, setTravel] = useState<TravelModeOption[]>([]);

    //Set travel options if google maps is loaded
    useEffect(() => {
        if (gMapsApiStatus && typeof google !== 'undefined') {
            setTravel([
                {
                    name: "Driving",
                    mode: google.maps.TravelMode.DRIVING
                },
                {
                    name: "Walking",
                    mode: google.maps.TravelMode.WALKING
                },
                {
                    name: "Public Transit",
                    mode: google.maps.TravelMode.TRANSIT
                },
            ]);
            // make selected travel mode driving by default
            setSelectedMode(google.maps.TravelMode.DRIVING);
            setMode(google.maps.TravelMode.DRIVING);
        }
    }, [gMapsApiStatus]);

    //Set selected travel method and return value
    const onSelectTravel = (modeName: string) => {
        const selectedMode = travel.find(t => t.name === modeName);
        if (selectedMode) {
            setSelectedMode(selectedMode.mode); // Update internal state
            setMode(selectedMode.mode); // Call parent callback
        }
    };

    //Returns icon for the travel mode
    const getModeIcon = (name: string) => {
        if (name === "Driving") return <DirectionsCarIcon fontSize="small" />;
        if (name === "Walking") return <DirectionsWalkIcon fontSize="small" />;
        if (name === "Public Transit") return <DirectionsTransitIcon fontSize="small" />;
        return null;
    };

    return (
        <Grid item xs={12}>
            {gMapsApiStatus && travel.length > 0 ? (
                <div className="flex w-[100%] justify-center border-b border-gray-500 pb-1 gap-8 ">
                    {travel.map((mode, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`btn cursor-pointer  w-[8%] ${selectedMode === mode.mode ? 'bg-gray-300 text-white shadow-md' : 'bg-white hover:bg-gray-200 focus:outline-none focus:ring-0 focus:border-0 border-0'} rounded-full`}


                            onClick={() => onSelectTravel(mode.name)} // Pass the mode name to the function
                        >
                            <ListItemIcon className="min-w-[32px]">
                                {getModeIcon(mode.name)}
                            </ListItemIcon>
                        </button>
                    ))}
                </div>            ) : (
                <Skeleton sx={{ height: "56px", borderRadius: "10px" }} />
            )}
        </Grid>
    );
};

export default TravelMode;
