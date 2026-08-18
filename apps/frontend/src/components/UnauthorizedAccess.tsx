import React, { useEffect } from 'react';

interface UnauthorizedAccessProps {
    open: boolean;
    onClose: () => void;
}

const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({ open, onClose }) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const modalContent = document.querySelector('.confirmation-modal');
            if (open && modalContent && !modalContent.contains(event.target as Node)) {
                onClose();
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, onClose]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (open && event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    return (
        <div className={`modal ${open ? 'display-block' : 'display-none'} z-11`}>
            <div
                className="modal-main confirmation-modal relative bg-white rounded-lg shadow-xl max-w-xl mx-auto flex flex-col items-center"
                style={{
                    border: 'none',
                    padding: 0,
                    minHeight: 'unset',
                    height: 'auto',
                    justifyContent: 'unset'
                }}
            >
                <div className="w-full h-10 bg-[#003A96] rounded-t-lg" />

                <button
                    onClick={onClose}
                    className="absolute top-1 right-4 text-gray-200 hover:text-gray-400 text-2xl font-bold leading-none focus:outline-none z-10"
                    aria-label="Close"
                >
                    &times;
                </button>

                <div className="flex flex-col items-center w-full mt-4 px-8 pb-4">
                    <h1 className="titleFont text-2xl text-[#385DA6] font-bold text-center mt-2 mb-2">
                        Unauthorized Access
                    </h1>
                    <p className="mb-6 text-center textFont text-gray-700 text-lg max-w-md">
                        You don't have permission to access this page.
                        <br />
                        You have been redirected.
                    </p>
                    <p className="mb-6 text-center textFont text-gray-700 text-lg max-w-md">
                        If you feel that you need access to the page please contact an administrator.
                    </p>
                    <button
                        className="headerFont w-full mt-2 bg-[#003A96] text-white font-lg py-2 px-8 rounded-lg transition-colors duration-200 cursor-pointer hover:bg-blue-600"
                        onClick={onClose}
                        style={{
                            fontFamily: 'Newsreader Variable, serif',
                            fontWeight: 'bold',
                            fontSize: '1.09rem'
                        }}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedAccess;
