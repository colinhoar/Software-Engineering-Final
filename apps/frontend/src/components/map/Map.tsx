import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import { useState, useEffect } from "react";
import MapOverlay from "./MapOverlay";
import { useLocalStorage } from '@uidotdev/usehooks';

interface Props {
    gMapsApiStatus: boolean;
    mapDirections: google.maps.DirectionsResult | undefined;
    setMapDirections: (directions: google.maps.DirectionsResult | undefined) => void;
}

const containerStyle = {
    width: 'calc(100% - 280px)',
    height: 'calc(100vh - 100px)', // Return to fixed pixel value for consistent spacing
    minHeight: '500px', // Add minimum height to prevent collapsing
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    right:0,
};

const Map = ({gMapsApiStatus, mapDirections, setMapDirections}: Props) => {
    const [startingLocation] = useLocalStorage('selectedLocation', 'chestnut_hill')
    const mapId:string = import.meta.env.VITE_GOOGLE_MAP_ID!;

    // useState for Props showing
    const chestnutCoords = {lat: 42.326132045118726, lng: - 71.14952315933986};
    const patriotCoords = {lat: 42.0928712664694, lng: -71.26605021416376};
    const faulknerCoords = {lat: 42.30251435221591, lng: -71.12874784581331};
    const mainHospitalCoords = {lat: 42.3356457, lng: -71.10603757577401}
    const [originalCenter, setOriginalCenter] = useState<{
        lat: number,
        lng: number
    }>();

    {/*Checks what location user has selected and sets the svg accordingly*/}
    useEffect(() => {
        if(startingLocation === "patriot_place"){
            setOriginalCenter(patriotCoords);
        }
        else if (startingLocation === "chestnut_hill"){
            setOriginalCenter(chestnutCoords);
        }
        else if (startingLocation === "faulkner-belkin"){
            setOriginalCenter(faulknerCoords);
        }
        else{
            setOriginalCenter(mainHospitalCoords);
        }
    }, [sessionStorage.getItem("hasSeenPopup"), gMapsApiStatus]);

    return (
        <>
            {gMapsApiStatus
                ? <GoogleMap mapContainerStyle={containerStyle} center={originalCenter} zoom={8} options = {{
                    mapId: mapId,
                    heading: 0,
                    disableDefaultUI: true
                }}>
                    <MapOverlay gMapsApiStatus={gMapsApiStatus} setMapDirections={setMapDirections}/>
                    {mapDirections
                        ? <DirectionsRenderer directions={mapDirections} />
                        : null
                    }
                </GoogleMap>
                : <div style={{ height: '18.75em' }} />
            }
        </>
    );
}

export default Map;
