import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import '../styles.css';

const Footer = () => {
    const location = useLocation();

    const checkLocation = () => {
        return !(location.pathname === ('/services/sanitationrequest')
            || location.pathname === ('/services/languagerequest')
            || location.pathname === ('/services/facilitymaintenancerequest')
            || location.pathname === ('/services/patienttransportationrequest')
            || location.pathname === ('/navigation')
        );
    }

    return (
        <div>
            { checkLocation() && (
                <footer className="w-full h-24 bg-gradient-to-tr from-[#003e7e] via-[#265AAD] to-[#007BFF] shadow-md z-1">
                    <div className="max-w-7xl mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Left: Logos */}
                        <img
                            src="/assets/footerlogos.png"
                            alt="Brigham and Women's Hospital"
                            className="h-14 md:h-16 object-contain"
                        />

                        {/* Right: Text and Links */}
                        <div className="text-center md:text-right flex-shrink-0">
                            <div className="flex items-center justify-between md:block -mt-8 md:mt-0">
                                <span className="text-sm italic text-white/90">©2025 Blue Baba-Yagas</span>
                                <ul className="flex ml-4 md:ml-0 md:mt-1 space-x-4 text-sm italic text-white">
                                    <li>
                                        <Link
                                            to="/about"
                                            className="hover:underline hover:text-[#F2CD88] transition"
                                        >
                                            About
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/credits"
                                            className="hover:underline hover:text-[#F2CD88] transition"
                                        >
                                            Credits
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default Footer;
