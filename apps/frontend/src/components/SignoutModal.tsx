import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';
import { useAuth } from './auth_context';
import Profilebutton from './Profilebutton';
import { useLocalStorage } from '@uidotdev/usehooks';

interface ProfileProps {
    open: boolean;
    onClose: () => void;
    isProfileOpen: boolean;
    isChangeProfileOpen: boolean;
    profileButtonRef: React.RefObject<HTMLButtonElement>;

    profileColor: string;
    setProfileColor: (color: string) => void;
}

export const SignoutModal = (props: ProfileProps) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState<string>(location.pathname);
    const [infoHover, setInfoHover] = useState(-1);
    const [open, setOpen] = useState(false);
    const [profileColor, setProfileColor] = useLocalStorage('profileColor', '#044ca4');

    useEffect(() => {
        if (props.isChangeProfileOpen) {
        }
    }, [props.isChangeProfileOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const modalContent = document.querySelector('.profile-modal');
            if (
                props.open &&
                modalContent &&
                !modalContent.contains(event.target as Node) &&
                !(
                    props.profileButtonRef.current &&
                    props.profileButtonRef.current.contains(event.target as Node)
                )
            ) {
                //handleClose();
            }
        };

        if (props.open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [props.open, props.profileButtonRef]);

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };
    const getFirstName = () => {
        const name = localStorage.getItem('name') || '';
        //get just the name without a space
        const nameParts = name.split(' ');
        return nameParts[0];
    };

    return (
        <div
            className={`${props.open ? '' : 'hidden'}  inset-0 flex justify-center items-start mt-17 z-50`}
            // mt-17
        >
            <div className="modal-mainProfile relative bg-white rounded-lg shadow-lg">
                <div className="w-full h-9 bg-[#044ca4] rounded-tl-2xl rounded-tr-2xl"></div>
                {/*as chris how to get name */}
                <h1 className=" text-center text-[#044ca4] text-2xl font-bold titleFont mt-4">
                    Hi, {getFirstName()}!
                </h1>
                <hr className="my-1 w-3/4 mx-auto border-t-3 border-[#044ca4]" />
                <button
                    onClick={props.onClose}
                    className="absolute top-2 right-3 text-gray-400 hover:text-white text-2xl font-bold leading-none focus:outline-none"
                    aria-label="Close"
                >
                    &times;
                </button>
                <div className="mt-60 absolute bg-gray-50 p-4 rounded-lg mb-4 max-h-40  overflow-y-auto shadow-inner w-65 h-33  ">
                    <Link to="/manageAccounts">
                        <button
                            onClick={props.onClose}
                            className=" signoutModalbutton  ml-3  leading-none focus:outline-none"
                        >
                            Manage Account
                        </button>
                    </Link>

                    <button

                        onClick={() => {
                            props.onClose();
                            logout();
                            window.location.href = '/';
                        }}
                        className="  signoutModalbutton ml-3 mt-5 leading-none focus:outline-none"
                    >
                        Log Out
                    </button>
                </div>
            </div>
            <button className="right-20 mt-25 absolute">
                <Profilebutton PressFromModal={true} />
            </button>

        </div>
    );
};
