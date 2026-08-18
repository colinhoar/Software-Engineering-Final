import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './auth_context';
import DepartmentDropdown from './DepartmentDropdown';
import { SignoutModal } from './SignoutModal';
import LocationDropdown from './LocationDropdown';
import SpeechRecognitionWidget from '../components/SpeechRecognitionWidget.tsx';
import { useHandTracking } from './HandTrackingProvider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';

const Header: React.FC = () => {
    const location = useLocation();
    const { isLoggedIn, isAdmin, logout } = useAuth();
    const { enabled, toggle } = useHandTracking();
    const [activeTab, setActiveTab] = useState<string>(location.pathname);
    const [isDepartmentsOpen, setIsDepartmentsOpen] = useState<boolean>(false);
    const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
    const [algorithm, setAlgorithm] = useState<'dijkstra' | 'dfs'>(
        () => (localStorage.getItem('algorithm') as 'dijkstra' | 'dfs') || 'dijkstra'
    );

    const [showProfileModal, setShowProfileModal] = useState(false);
    const profileButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isDepartmentsOpen && activeTab === 'departments') {
            setActiveTab(location.pathname);
        }
    }, [isDepartmentsOpen, location.pathname]);

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const toggleAlgorithm = () => {
        const next = algorithm === 'dijkstra' ? 'dfs' : 'dijkstra';
        setAlgorithm(next);
        localStorage.setItem('algorithm', next);
        window.dispatchEvent(new CustomEvent('algorithmChange', { detail: next }));
    };

    return (
        <nav className="header-style z-15 flex justify-between items-center px-6 py-3 bg-gradient-to-br from-[#001F4D] via-[#004AAD] to-[#007BFF] shadow-md">
            <div className="flex items-center">
                <Link to="/" onClick={() => setActiveTab('')}>
                    <img
                        src="/assets/bwh-logo.svg"
                        alt="Brigham and Women's Hospital"
                        className="bwh-logo hover:opacity-80 transition"
                    />
                </Link>
            </div>


            <div className="flex items-center space-x-6 text-white text-lg font-normal ">
                <Tooltip title={enabled ? 'Disable Hands-Free' : 'Enable Hands-Free'}>
                    <IconButton onClick={toggle} sx={{ color: enabled ? '#F2CD88' : 'white' }}>
                        <PanToolAltIcon />
                    </IconButton>
                </Tooltip>
                <SpeechRecognitionWidget showFull={false}></SpeechRecognitionWidget>
                <div className="h-full flex items-center">
                    <LocationDropdown />
                </div>
                {/*I tweaked for so long in the wronf file to fix this stupid thing*/}
                <Link
                    to="/navigation"
                    onClick={() => setActiveTab('/navigation')}
                    className="relative group cursor-pointer transition duration-200"
                >
                    <span
                        className={`after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-white
                        group-hover:after:w-full after:transition-all after:duration-300
                        ${activeTab === '/navigation' ? 'text-[#F2CD88]' : ''}`}
                    >
                        Navigation
                    </span>
                </Link>
                <DepartmentDropdown
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isDepartmentsOpen={isDepartmentsOpen}
                    setIsDepartmentsOpen={setIsDepartmentsOpen}
                />

                <SignoutModal
                    open={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                ></SignoutModal>

                {isLoggedIn && (
                    <Link
                        to="/services"
                        onClick={() => setActiveTab('/services')}
                        className="relative group cursor-pointer transition duration-200"
                    >
                        <span
                            className={`after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-white
                            group-hover:after:w-full after:transition-all after:duration-300
                            ${activeTab === '/services' ? 'text-[#F2CD88]' : ''}`}
                        >
                            Services
                        </span>
                    </Link>
                )}

                {isLoggedIn ? (
                    <button
                        className="relative group cursor-pointer transition duration-200"
                        onClick={() => {
                            setShowProfileModal((prev) => !prev);
                        }}
                        ref={profileButtonRef}
                    >
                        {
                            showProfileModal ? (
                                <img
                                    className="size-8 mx-auto select-none"
                                    src={'/assets/profileYellow.svg'}
                                    alt="Profile Icon"
                                />
                            ) : (
                                <img
                                    className="size-8 mx-auto select-none"
                                    src={'/assets/profile.svg'}
                                    alt="Profile Icon"
                                />
                            )
                        }
                    </button>
                ) : (
                    activeTab !== '/login' && (
                        <Link
                            to="/login"
                            onClick={() => setActiveTab('/login')}
                            className="relative group cursor-pointer transition duration-200"
                        >
                            <span
                                className={`after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-white
                                group-hover:after:w-full after:transition-all after:duration-300
                                ${activeTab === '/login' ? 'text-[#F2CD88]' : ''}`}
                            >
                                Login
                            </span>
                        </Link>
                    )
                )}
            </div>
        </nav>
    );
};

export default Header;
