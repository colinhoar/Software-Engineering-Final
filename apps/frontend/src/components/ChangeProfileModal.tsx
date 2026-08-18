import React, { useEffect, useState } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';

interface PopupProps {
    open: boolean;
    onClose: () => void;
    onColorChange: (color: string) => void;
    initials: string;
}

export default function ChangeProfileModal(props: PopupProps) {
    const [profileColor, setProfileColor] = useLocalStorage('profileColor', '#044ca4');
    const [inputValue, setInputValue] = useState('');
    const [invalidHex, setInvalidHex] = useState(false);
    const colors = ['#044ca4', '#9b4ea8', '#e75a92', '#ff8372', '#ffbc5d', '#72aba8', '#444655'];

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleSearch = (event: React.MouseEvent<HTMLButtonElement>) => {
        // Check if valid hex color format
        event.preventDefault();
        const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
        if (hexRegex.test(inputValue)) {
            setProfileColor(inputValue);
            props.onColorChange(inputValue);
            setInvalidHex(false);
        } else {
            setInvalidHex(true);
        }
    };

    //useEffect so can click out of modal
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const modalContent = document.querySelector('.color-modal');
            if (props.open && modalContent && !modalContent.contains(event.target as Node)) {
                props.onClose();
                console.log('hello', props);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [props.open, props.onClose]);

    //useEffect so can't scroll when modal is open
    useEffect(() => {
        if (props.open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [props.open]);

    return (
        <div
            className={`modal fixed inset-0 flex items-center justify-center  bg-opacity-50 z-40 ${
                props.open ? 'block' : 'hidden'
            }`}
        >
            <div
                className="relative modal-main confirmation-modal bg-white rounded-lg shadow-xl max-w-xl w-full "
                style={{ border: 'none' }}
            >
                {/* Close (X) Button */}
                <button
                    onClick={props.onClose}
                    className="absolute top-1 right-4 text-gray-200 hover:text-gray-400 text-2xl font-bold leading-none focus:outline-none z-10"
                >
                    &times;
                </button>

                <div className="w-full h-12 bg-[#044CA4] rounded-t-lg flex items-center justify-center">
                    <h1 className="text-3xl titleFont text-white">Profile Picture</h1>
                </div>

                {/*<div className="modal-head text-center rounded-t-lg">*/}
                {/*    <h1 className="text-3xl headerFont text-[#044CA4] dark:text-white h-10">*/}
                {/*        Confirm Submission*/}
                {/*    </h1>*/}
                {/*</div>*/}

                <br />
                <div className="mb-1"></div>
                <div
                    style={{ backgroundColor: profileColor }}
                    className="w-50 h-50 rounded-full flex items-center justify-center"
                >
                    <span className="text-white text-6xl headerFont">{props.initials}</span>
                </div>
                <br />

                <div className="bg-white p-3 rounded border shadow-lg ">
                    <form>
                        <label className=" text-[#020659] headerFont">Search for a color</label>
                        <div className="flex relative textFont">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                id="searchColor"
                                placeholder="Enter hex color (e.g., #FF0000)"
                                className="block border text-sm mb-3 font-medium text-gray-500 p-2 w-[75%]"
                            />
                            <button
                                onClick={handleSearch}
                                className="text-white absolute end-2.5  font-medium rounded-lg text-sm px-4 py-2  buttonLook"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                    {invalidHex && (
                        <p className={'text-red-500 text-sm textFont pb-2'}>
                            {'Invalid hex color format'}
                        </p>
                    )}

                    <div className="flex gap-3">
                        {colors.map((color) => (
                            <div
                                key={color}
                                onClick={() => {
                                    props.onColorChange(color);
                                    setInvalidHex(false);
                                }}
                                className="w-10 h-10 rounded-full cursor-pointer border-2 border-white hover:border-gray-300 transition-all"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
