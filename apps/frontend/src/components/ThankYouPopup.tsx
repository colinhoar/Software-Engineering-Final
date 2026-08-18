import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

interface ThankYouPopupProps {
    open: boolean;
    onClose: () => void;
    noRedirect?: boolean;
    text?: string;
    title?: string;
}

export const ThankYouPopup = (props: ThankYouPopupProps) => {
    const navigate = useNavigate();
    const [animationStage, setAnimationStage] = useState('checkmark'); // "checkmark", "fadeOut", "message"

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const modalContent = document.querySelector('.thank-you-modal');
            if (props.open && modalContent && !modalContent.contains(event.target as Node)) {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [props.open]);

    useEffect(() => {
        if (props.open) {
            // Reset animation when popup opens
            setAnimationStage('checkmark');

            // Schedule the animation stages
            const checkmarkComplete = setTimeout(() => {
                setAnimationStage('fadeOut');
            }, 1800); // After checkmark animation completes

            const showMessage = setTimeout(() => {
                setAnimationStage('message');
            }, 2300); // After fade out completes

            return () => {
                clearTimeout(checkmarkComplete);
                clearTimeout(showMessage);
            };
        }
    }, [props.open]);

    const handleClose = () => {
        props.onClose();
        if (!props.noRedirect) {
            navigate('/services');
        }
    };

    return (
        <div className={`modal ${props.open ? 'display-block' : 'display-none'} z-11`}>
            <div className="modal-mainThankyou thank-you-modal">
                <div className="w-full h-8 bg-[#044CA4] rounded-t-lg"></div>

                <button
                    onClick={props.onClose}
                    className="absolute top-1 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none focus:outline-none z-10"
                >
                    &times;
                </button>

                <div className="absolute w-full h-12 bg-[#044CA4] rounded-t-lg">
                    <h1 className="text-2xl titleFont text-white dark:text-white text-center m-2">
                        {props.title ? props.title : 'Request Submitted'}
                    </h1>
                </div>

                {/*<div className="modal-head">*/}
                {/*    <h1 className="text-2xl headerFont text-[#044CA4] dark:text-white h-10">*/}
                {/*        {props.title ? props.title : 'Request Submitted'}*/}
                {/*    </h1>*/}
                {/*</div>*/}
                <br />
                <br />
                <br />

                <div className="modal-body px-8">
                    {(animationStage === 'checkmark' || animationStage === 'fadeOut') && (
                        <div
                            className={`flex justify-center items-center my-8 ${animationStage === 'fadeOut' ? 'fade-out' : ''}`}
                        >
                            <svg
                                className="checkmark"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 52 52"
                            >
                                <circle
                                    className="checkmark__circle"
                                    cx="26"
                                    cy="26"
                                    r="25"
                                    fill="none"
                                />
                                <path
                                    className="checkmark__check"
                                    fill="none"
                                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                                />
                            </svg>
                        </div>
                    )}

                    {animationStage === 'message' && (
                        <div className="fade-in">
                            <div className="bg-green-50 border border-green-100 rounded-lg p-6 my-6">
                                <p className="text-center text-lg font-medium text-green-700 textFont">
                                    {props.text
                                        ? props.text
                                        : "Thank you for the request, it's been recorded."}
                                </p>
                            </div>

                            <div className="flex justify-center mt-4">
                                <button
                                    className="buttonLook font-lg py-2 px-8 rounded-lg text-white"
                                    onClick={handleClose}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
