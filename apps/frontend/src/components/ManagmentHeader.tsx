import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ManagmentHeader: React.FC = () => {};

return (
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
);
export default ManagmentHeader;
