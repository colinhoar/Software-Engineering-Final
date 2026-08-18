import {
    Skeleton,
    Grid,
    FormLabel,
    Box,
    Select,
    MenuItem,
    FormControl,
    SelectChangeEvent,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';

interface Props {
    gMapsApiStatus: boolean;
    setAddress(place: google.maps.places.PlaceResult): void;
    label: string;
}

const AddressSelect = ({ gMapsApiStatus, setAddress, label }: Props) => {
    const [destinations, setDestinations] = useState<google.maps.places.PlaceResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [startingLocation] = useLocalStorage('selectedLocation', 'chestnut_hill');

    //Set address options based on preset locations
    useEffect(() => {
        if (
            gMapsApiStatus &&
            typeof google !== 'undefined' &&
            startingLocation === 'chestnut_hill'
        ) {
            setDestinations([
                {
                    name: 'Parking Lot A',
                    geometry: {
                        location: new google.maps.LatLng(42.32632728585428, -71.1499226901055),
                    },
                    formatted_address: '850 Boylston St, Chestnut Hill, MA 02467',
                },

                {
                    name: 'Parking Lot B',
                    geometry: {
                        location: new google.maps.LatLng(42.32598588660029, -71.14907170969714),
                    },
                    formatted_address: '850 Boylston St, Chestnut Hill, MA 02467',
                },
                {
                    name: 'Parking Lot C',
                    geometry: {
                        location: new google.maps.LatLng(42.325668871348356, -71.15012059252605),
                    },
                    formatted_address: '850 Boylston St, Chestnut Hill, MA 02467',
                },
            ]);
        }
    }, [sessionStorage.getItem('hasSeenPopup'), gMapsApiStatus]);

    useEffect(() => {
        if (
            gMapsApiStatus &&
            typeof google !== 'undefined' &&
            startingLocation === 'faulkner-belkin'
        ) {
            setDestinations([
                {
                    name: 'Parking Entrance 2004',
                    geometry: {
                        location: new google.maps.LatLng(42.30189922351536, -71.12741847581694),
                    },
                    formatted_address: '1153 Centre St, Jamaica Plain, MA 02130',
                },
                {
                    name: 'Parking Entrance 1975',
                    geometry: {
                        location: new google.maps.LatLng(42.30251435221591, -71.12874784581331),
                    },
                    formatted_address: '1153 Centre St, Jamaica Plain, MA 02130',
                },
            ]);
        }
    }, [sessionStorage.getItem('hasSeenPopup'), gMapsApiStatus]);

    useEffect(() => {
        if (
            gMapsApiStatus &&
            typeof google !== 'undefined' &&
            startingLocation === 'patriot_place'
        ) {
            setDestinations([
                {
                    name: 'Parking Lot 22C',
                    geometry: {
                        location: new google.maps.LatLng(42.09164730494772, -71.26631019637854),
                    },
                    formatted_address:
                        'Mass General Brigham Urgent Care, 20 Patriot Pl, Foxborough, MA 02035',
                },
                {
                    name: 'Parking Lot 23B',
                    geometry: {
                        location: new google.maps.LatLng(42.09301927896345, -71.268303350774),
                    },
                    formatted_address:
                        'Mass General Brigham Urgent Care, 22 Patriot Pl, Foxborough, MA 02035',
                },
            ]);
        }
    }, [sessionStorage.getItem('hasSeenPopup'), gMapsApiStatus]);

    useEffect(() => {
        if (gMapsApiStatus && typeof google !== 'undefined' && startingLocation === 'main_campus') {
            setDestinations([
                {
                    name: '45 Francis Parking Lot',
                    geometry: { location: new google.maps.LatLng(42.3356457, -71.10603757577401) },
                    formatted_address: '75 Francis St, Boston, MA 02115',
                },
            ]);
        }
    }, [sessionStorage.getItem('hasSeenPopup'), gMapsApiStatus]);

    //Sets selected destination
    const onSelect = (event: SelectChangeEvent) => {
        const index = +event.target.value;
        // Makes an item in session storage as destination and gives it a value matching where they're entering
        if (startingLocation === 'chestnut_hill') {
            switch (index) {
                case 0:
                    window.sessionStorage.setItem('destination', 'Lot A1');
                    break;
                case 1:
                    window.sessionStorage.setItem('destination', 'Lot B1');
                    break;
                case 2:
                    window.sessionStorage.setItem('destination', 'Lot C1');
                    break;
            }
        } else if (startingLocation === 'patriot_place') {
            switch (index) {
                case 0:
                    window.sessionStorage.setItem('destination', 'Patriot Lot 22C');
                    break;
                case 1:
                    window.sessionStorage.setItem('destination', 'Patriot Lot 23B');
                    break;
            }
        } else if (startingLocation === 'faulkner-belkin') {
            switch (index) {
                case 0:
                    window.sessionStorage.setItem('destination', '2004 Parking Entrance');
                    break;
                case 1:
                    window.sessionStorage.setItem('destination', '1975 Parking Entrance');
                    break;
            }
        } else {
            switch (index) {
                case 0:
                    window.sessionStorage.setItem('destination', 'MC Garage Entrance');
            }
        }

        setAddress(destinations[index]);
        setSelectedIndex(index);
    };

    return (
        <Grid item xs={12} className="mb-2">
            <Box sx={{ width: '100%', textAlign: 'left', marginTop: '0.3125em' }}>
                <FormLabel
                    sx={{
                        fontFamily: 'Newsreader Variable, serif',
                        color: '#385DA6',
                        fontWeight: 'bold',
                    }}
                >
                    {label}
                </FormLabel>
            </Box>
            {gMapsApiStatus && destinations.length > 0 ? (
                <FormControl fullWidth>
                    <Select
                        value={'' + selectedIndex}
                        onChange={onSelect}
                        displayEmpty
                        inputProps={{
                            'aria-label': 'Select destination',
                            className: 'rounded-md text-sm font-medium py-2 px-3',
                        }}
                        //Styling for dropdown UI using MUI system + Tailwind
                        sx={{
                            height: '3.5em', // Using em units for height
                            backgroundColor: '#fff',
                            borderRadius: '0.625em',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#111827',
                            '& .MuiSelect-select': {
                                padding: '0.625em 0.75em',
                                borderRadius: '0.625em',
                                display: 'flex',
                                alignItems: 'center',
                            },
                            '& fieldset': {
                                borderColor: '#d1d5db',
                            },
                            '&:hover fieldset': {
                                borderColor: '#3b82f6',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#2563eb',
                            },
                        }}
                        renderValue={(selected) =>
                            +selected === -1
                                ? 'Select a Destination'
                                : `${destinations[+selected].name}`
                        }
                    >
                        <MenuItem value={0} disabled className="text-sm text-gray-500">
                            Select a Destination
                        </MenuItem>
                        {destinations.map((destination, index) => (
                            <MenuItem
                                key={index}
                                value={index}
                                className={`text-sm rounded-md px-2 py-1 ${index === selectedIndex ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-100'}`}
                            >
                                {destination.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : (
                <Skeleton sx={{ height: '3.5em', borderRadius: '0.625em' }} />
            )}
        </Grid>
    );
};

export default AddressSelect;
