import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { fetchDepartments } from '../lib/utils.ts';
import { Prisma } from '../../../../packages/database/.prisma/client';
import Fuse from 'fuse.js';
import {useLocation} from 'react-router-dom';

interface DepartmentDropdownProps {
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    isDepartmentsOpen: boolean;
    setIsDepartmentsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DepartmentDropdown({
                                               activeTab,
                                               setActiveTab,
                                               isDepartmentsOpen,
                                               setIsDepartmentsOpen
                                           }: DepartmentDropdownProps) {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open && activeTab === 'departments') {
            setActiveTab(location.pathname);
        }
    }, [open, location.pathname]);

    const [departments, setDepartments] = useState<
        Prisma.DepartmentGetPayload<{ include: { building: true } }>[]
    >([
        {
            departmentID: -1,
            name: 'No departments',
            services: 'Nothing selected',
            location: 'Nothing selected',
            buildingID: -1,
            building: {
                name: '',
                id: 0,
            },
            floor: "-1",
            phone: 'Nothing selected',
        },
    ]);

    const [departmentClicked, setDepartmentClicked] = useState(departments[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        fetchDepartments(10, 1000, false, setDepartments);
    }, []);

    useEffect(() => {
        if (!open) {
            setSearchTerm('');
            setShowSearch(false);
        }
    }, [open]);

    const fuse = new Fuse(departments, {
        keys: ['name', 'services', 'location'],
        threshold: 0.4,
        includeMatches: true,
    });

    const searchResults =
        searchTerm === '' ? departments.map((d) => ({item: d})) : fuse.search(searchTerm);

    const highlightMatch = (name: string, matches: readonly Fuse.RangeTuple[] | undefined) => {
        if (!showSearch || !matches || matches.length === 0) return name;
        const [start, end] = matches[0];
        return (
            <>
                {name.slice(0, start)}
                <span className="bg-blue-200 text-blue-900 rounded-sm px-1">
          {name.slice(start, end + 1)}
        </span>
                {name.slice(end + 1)}
            </>
        );
    };

    const handleClick = (index: number) => {
        setDepartmentClicked(searchResults[index].item);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [open]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => {
                    setOpen(!open);
                    setActiveTab('departments');
                }}
                className="relative group cursor-pointer transition duration-200"
            >
        <span
            className={`after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-white 
          group-hover:after:w-full after:transition-all after:duration-300 
          ${activeTab === 'departments' ? 'text-[#F2CD88]' : ''}`}
        >
          Departments
        </span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="fixed inset-0 top-[95px] z-40"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        onClick={() => setOpen(false)}
                    >
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-md"/>

                        <motion.div
                            className="relative w-full bg-gradient-to-tr from-[#001F4D] via-[#004AAD] to-[#007BFF] shadow-xl px-16 py-12 grid grid-cols-2 gap-20"
                            onClick={(e) => e.stopPropagation()}
                            initial={{y: -20, opacity: 0}}
                            animate={{y: 0, opacity: 1}}
                            exit={{y: -10, opacity: 0}}
                            transition={{duration: 0.2}}
                        >
                            <div className="overflow-y-auto max-h-[60vh] pr-6 direction-rtl custom-scrollbar group">
                                <div className="direction-ltr">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="uppercase tracking-wide text-white text-sm titleFont font-bold">
                                            Departments by Hospital
                                        </p>
                                        <button onClick={() => setShowSearch(!showSearch)}>
                                            <FontAwesomeIcon
                                                icon={faMagnifyingGlass}
                                                className="text-white hover:text-gray-200"
                                            />
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {showSearch && (
                                            <motion.input
                                                key="search-input"
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search departments..."
                                                className="textFont mb-4 w-full px-3 py-2 rounded-md bg-white text-black placeholder-gray-500 focus:outline-none"
                                                initial={{opacity: 0, height: 0}}
                                                animate={{opacity: 1, height: 'auto'}}
                                                exit={{opacity: 0, height: 0}}
                                                transition={{duration: 0.2}}
                                            />
                                        )}
                                    </AnimatePresence>

                                    <ul className="space-y-2">
                                        {searchResults.length === 0 ? (
                                            <li className="text-white px-3 py-2">No matches found</li>
                                        ) : (
                                            searchResults.map(({item, matches}, index) => (
                                                <>
                                                    {/* when not searching, add header above first department of each unique building */}
                                                    {(!matches && (index === 0 || searchResults[index - 1].item.buildingID!==item.buildingID))&&
                                                        <>
                                                            <h2 className={"font-bold headerFont"}>{item.building.name}</h2>
                                                            <hr/>
                                                        </>
                                                        }
                                                    <li key={index}>
                                                        <button
                                                            onClick={() => handleClick(index)}
                                                            className={`w-full text-left px-3 py-2 rounded-lg transition font-medium ${
                                                                departmentClicked.departmentID === item.departmentID
                                                                    ? 'headerFont bg-blue-900/50 text-white border-l-4 border-white'
                                                                    : 'headerFont text-white hover:bg-blue-800 hover:text-white'
                                                            }`}
                                                        >
                                                            {highlightMatch(item.name, matches?.[0]?.indices)}

                                                            {/* add extra info to department display when searching */}
                                                            {matches && <div className={"textFont text-sm opacity-50 -mt-1 -mb-1"}>
                                                                {item.building.name}, floor {item.floor}
                                                            </div>}

                                                            {/* handle duplicate departments on different floors */}
                                                            {!matches && ((index !== 0 && searchResults[index - 1].item.name === item.name && searchResults[index - 1].item.buildingID === item.buildingID)|| (index !== (searchResults.length-1) && searchResults[index + 1].item.name === item.name && searchResults[index + 1].item.buildingID === item.buildingID)) && " (floor "+item.floor+")"}
                                                        </button>
                                                    </li>
                                                </>

                                            ))
                                        )}
                                    </ul>
                                </div>
                            </div>

                            <div className="overflow-y-auto max-h-[60vh] text-white">
                                <p className="titleFont tracking-wide uppercase text-sm mb-4 font-bold">
                                    Information
                                </p>
                                {departmentClicked.floor !== "-1" && (
                                    <div className="text-lg headerFont space-y-4 text-base">
                                        {departmentClicked.services && (
                                            <div>
                                                <strong>Services:</strong>
                                                <p className="textFont not-italic">{departmentClicked.services}</p>
                                            </div>
                                        )}
                                        <div>
                                            <strong>Location:</strong>
                                            <p className="textFont not-italic">
                                                {departmentClicked.building.name},
                                                floor {departmentClicked.floor}{' '}
                                                {departmentClicked.location}
                                            </p>
                                        </div>
                                        {departmentClicked.phone && (
                                            <div>
                                                <strong>Phone:</strong>
                                                <p className="textFont not-italic">{departmentClicked.phone}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}