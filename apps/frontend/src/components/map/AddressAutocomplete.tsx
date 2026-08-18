import {
    Skeleton,
    Grid,
    FormLabel,
    Box,
    InputAdornment,
    TextField,
    Paper,
    MenuItem,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapPin } from '@fortawesome/free-solid-svg-icons';

interface Props {
    gMapsApiStatus: boolean;

    setAddress(place: google.maps.places.PlaceResult): void;

    label: string;
    style?: { backgroundColor: string };
}

const AddressAutocomplete = ({ gMapsApiStatus, setAddress, label, style }: Props) => {
    const [suppressFetch, setSuppressFetch] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [service, setService] = useState<google.maps.places.AutocompleteService | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    //Initialize AutocompleteService
    useEffect(() => {
        if (gMapsApiStatus && typeof google !== 'undefined') {
            setService(new google.maps.places.AutocompleteService());
        }
    }, [gMapsApiStatus]);

    //Fetch predictions when input changes
    useEffect(() => {
        if (suppressFetch) {
            setSuppressFetch(false); // reset flag
            return;
        }
        if (service && inputValue !== '') {
            service.getPlacePredictions(
                {
                    input: inputValue,
                    types: ['address'], // Only show addresses
                    componentRestrictions: { country: 'us' }, // Restrict to US
                },
                (preds) => {
                    if (preds) setPredictions(preds);
                }
            );
        } else {
            setPredictions([]);
        }
    }, [inputValue, service]);

    //Handle clicking on a prediction
    const handleSelect = (prediction: google.maps.places.AutocompletePrediction) => {
        const placesService = new google.maps.places.PlacesService(document.createElement('div'));
        placesService.getDetails(
            {
                placeId: prediction.place_id,
                fields: ['geometry', 'formatted_address', 'name'],
            },
            (place) => {
                if (place) {
                    setSuppressFetch(true);
                    setAddress(place);
                    setInputValue(place.formatted_address || prediction.description);
                    setPredictions([]);
                }
            }
        );
    };

    return (
        <Grid item xs={12} className="mb-2">
            <Box
                sx={{
                    width: '100%',
                    textAlign: 'left',
                    marginTop: '0.3125em',
                }}
            >
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
            {gMapsApiStatus ? (
                <Box className="relative w-full">
                    <TextField
                        inputRef={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter a starting location"
                        sx={{
                            width: '100%',
                            backgroundColor: '#fff',
                            borderRadius: '0.625em',
                            fontSize: '0.875rem',
                            fontFamily: 'Noto Sans Variable, sans-serif',

                            '& .MuiInputBase-root': {
                                borderRadius: '0.625em',
                                fontSize: '0.975rem',
                                fontFamily: 'Noto Sans Variable, sans-serif',
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

                            '& input::placeholder': {
                                fontFamily: 'Noto Sans Variable, sans-serif',
                                fontSize: '0.9rem',
                            },
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <FontAwesomeIcon icon={faMapPin} className="text-gray-500" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Custom dropdown results */}
                    {predictions.length > 0 && (
                        <Paper
                            className="absolute z-20 mt-1 max-h-60 overflow-y-auto rounded-md shadow-lg border border-gray-200"
                            sx={{
                                width: '100%', // Full width instead of fixed pixels
                                maxWidth: '30em', // Max width in em units
                                overflowX: 'auto', // Scroll only if content overflows
                                whiteSpace: 'normal', // Allows wrapping if needed
                                fontFamily: 'Noto Sans Variable, sans-serif',

                                px: 1,
                            }}
                        >
                            {predictions.map((prediction, index) => (
                                <MenuItem
                                    key={index}
                                    onClick={() => handleSelect(prediction)}
                                    className="text-sm hover:bg-gray-100 transition-colors"
                                    sx={{
                                        fontFamily: 'Noto Sans Variable, sans-serif',
                                        // whiteSpace: 'normal',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {prediction.description}
                                </MenuItem>
                            ))}
                        </Paper>
                    )}
                </Box>
            ) : (
                <Skeleton sx={{ height: '3.5em', borderRadius: '0.625em' }} />
            )}
        </Grid>
    );
};

export default AddressAutocomplete;
