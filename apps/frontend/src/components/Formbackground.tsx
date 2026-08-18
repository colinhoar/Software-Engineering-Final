import React from 'react';
import '../styles.css';

const Formbackground = () => {
    return (
        <div className="overflow-x-hidden overflow-y-hidden max-w-full max-h-full">
            <div className="fixed w-full h-full inset-0 z-0 filter blur-xs bg-[url('/assets/main_campus.jpg')] bg-cover bg-center ">
                {/* Blue overlay with opacity */}
                <div className="absolute inset-0 bg-[#044ca4] opacity-80"></div>
            </div>
        </div>
    );
};

export { Formbackground };
