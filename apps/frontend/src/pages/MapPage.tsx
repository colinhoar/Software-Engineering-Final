import { IGMapsApiStatus } from '../components/map/types';
import { useState } from 'react';
import { useScript } from '../components/map/ExternalScriptProvider';
import Map from '../components/map/Map';
import Form from '../components/map/Form_Map';
import { Button } from '@mui/material';


const MapPage = () => {
    const apikey = import.meta.env.VITE_GOOGLE_MAP_API_KEY!;
    const GMapsApiStatus: IGMapsApiStatus = useScript(
        `https://maps.googleapis.com/maps/api/js?key=${apikey}&libraries=places&callback=Function.prototype`
    );

    const [mapDirections, setMapDirections] = useState<google.maps.DirectionsResult | undefined>();

    return (
        <>
            <Map
                gMapsApiStatus={GMapsApiStatus.status === 'ready'}
                mapDirections={mapDirections}
                setMapDirections={setMapDirections}
            />
        </>
    );
};

export default MapPage;
