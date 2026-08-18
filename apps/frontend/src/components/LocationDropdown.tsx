import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {useLocalStorage} from '@uidotdev/usehooks';

interface LocationOption {
    name: string;
    value: string;
    imgSrc: string;
}

const LOCATIONS: LocationOption[] = [
    { name: 'Faulkner/Belkin', value: 'faulkner-belkin', imgSrc: '/assets/faulkner.png' },
    { name: 'Patriot Place', value: 'patriot_place', imgSrc: '/assets/patriot_place.jpg' },
    { name: 'Chestnut Hill', value: 'chestnut_hill', imgSrc: '/assets/chestnut-hill.jpg' },
    {name: 'Main Campus', value: 'main_campus', imgSrc: '/assets/main_campus.jpg' },
];

export default function LocationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
    const [storedSelectedLocation, setStoredSelectedLocation] = useLocalStorage('selectedLocation', 'chestnut_hill')
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        if (storedSelectedLocation) {
            const found = LOCATIONS.find(loc => loc.value === storedSelectedLocation);
            if (found) {
                setSelectedLocation(found);
            }
        }
    }, [storedSelectedLocation]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (location: LocationOption) => {
        setStoredSelectedLocation(location.value)
        setSelectedLocation(location);
        setIsOpen(false);
    };

    const availableLocations = LOCATIONS.filter(loc => loc.value !== selectedLocation?.value);

    return (
        <div className="relative h-full flex items-center" ref={dropdownRef}>
            <motion.button
                onClick={() => setIsOpen(prev => !prev)}
                whileTap={{ scale: 0.96 }}
                className="flex items-center space-x-2 text-white transition duration-200 hover:text-[#F2CD88] focus:outline-none"
                style={{ backgroundColor: 'transparent', border: 'none' }}
            >
                <div className="flex items-center space-x-2">
                    <img
                        src={selectedLocation?.imgSrc || '/assets/faulkner.png'}
                        alt="Selected Location"
                        className="w-6 h-6 rounded-full object-cover border border-white mb-[4px]"
                    />
                    <span className="headerFont text-lg select-none"> {/*do NOT remove font normal it looks super bad wihout it*/} {/*I got rid of font normal - Colin*/}
                        {selectedLocation?.name || 'Location'}
                    </span>
                    <motion.svg
                        className="w-4 h-4 mb-[4px]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </motion.svg>
                </div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute top-full mt-1 right-0 w-56 bg-gradient-to-tr from-[#002E8A] via-[#0050D4] to-[#007BFF] backdrop-blur-md rounded-xl shadow-lg z-50 border border-white/20"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ul className="py-2">
                            {availableLocations.map(location => (
                                <motion.li
                                    key={location.value}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <button
                                        onClick={() => {handleSelect(location); window.location.reload(); sessionStorage.removeItem('destination')}}
                                        className="flex items-center w-full px-4 py-2 text-white hover:bg-blue-600 transition"
                                    >
                                        <img
                                            src={location.imgSrc}
                                            alt={location.name}
                                            className="w-5 h-5 rounded-full mr-3 object-cover"
                                        />
                                        <span className="titleFont text-sm font-bold tracking-wide">
                                            {location.name}
                                        </span>
                                    </button>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
