import React, { useEffect, useState } from 'react';
import '../styles.css';
import { useLocalStorage } from '@uidotdev/usehooks';

import ChangeProfileModal from './ChangeProfileModal';
import { API_ROUTES } from 'common/src/constants.ts';
import { useAuth } from "./auth_context.tsx";
import axios from 'axios';

interface ProfileButtonProps {


    PressFromModal?: boolean;
}

export const Profilebutton = ({ PressFromModal }: ProfileButtonProps) => {
    const { isLoggedIn } = useAuth();

    const [open, setOpen] = useState(false);
    const [profileColor, setProfileColor] = useLocalStorage('profileColor', '#044ca4');
    useEffect(() => {
        const updateProfileColor = async () => {
            try {
                const res = await axios.get(
                    API_ROUTES.EMPLOYEE + '?email=' + localStorage.getItem('email')
                );

                if (res.status === 200) {
                    const employee = res.data;
                    setProfileColor(employee.profileColor);
                }
            } catch (error) {

            }
        }
        if (isLoggedIn){
            updateProfileColor()
        }
    }, [isLoggedIn]);

    const getFirstName = () => {
        const name = localStorage.getItem('name') || '';
        //get just the name without a space
        const nameParts = name.split(' ');
        return nameParts[0];
    };

    const getFirstInitial = () => {
        const name = localStorage.getItem('name') || '';
        //get just the name without a space
        const nameParts = name.split('');
        return nameParts[0];
    };

    const getLastInitial = () => {
        const name = localStorage.getItem('name') || '';
        //get just the name without a space

        //if no seconed letter than rerutn ''
        const nameParts = name.split(' ');
        if (nameParts.length > 1) {
            const last = nameParts[nameParts.length - 1];
            return last.charAt(0);
        } else {
            return '';
        }
    };

    return (
        <div>
            <div>
                {PressFromModal ? (
                    <button
                        style={{ backgroundColor: profileColor }}
                        onClick={() => setOpen(true)}
                        className=" profilebutton text-5xl flex justify-center items-center"
                    >
                        {getFirstInitial()}
                        {getLastInitial()}
                    </button>
                ) : (
                    <button
                        style={{ backgroundColor: profileColor }}
                        onClick={() => setOpen(true)}
                        className="ProfileManagmentbutton text-7xl leading-none focus:outline-none mt-6 flex justify-center items-center"
                    >
                        {getFirstInitial()}
                        {getLastInitial()}
                    </button>
                )}
            </div>

            {/* Edit button shown only when PressFromModal is true */}
            {PressFromModal && (
                <button
                    onClick={() => setOpen(true)}
                    className="editbuttonIcon absolute ml-20 -mt-8 bg-gray-400 w-9 h-9 rounded-4xl mb-4 max-h-10 overflow-y-auto shadow-inner  "
                >
                    <img
                        className="z-2 mx-auto select-none w-5"
                        src="/assets/edit.svg"
                        alt="edit picture"
                    />
                </button>
            )}


            <ChangeProfileModal
                open={open}
                onClose={() => setOpen(false)}
                onColorChange={async (color) => {
                    try {
                        const data = JSON.stringify({
                            email: localStorage.getItem('email'),
                            newColor: color,
                        });

                        const res = await axios.post(API_ROUTES.EMPLOYEE, data, {
                            headers: {
                                'content-Type': 'application/json',
                            },
                        });
                        if (res.status === 200) {
                            setProfileColor(color);
                        }
                    } catch (error) {
                        alert('Error submitting changes!');
                        console.log('Error submitting changes:', error);
                    }
                }}
                initials={`${getFirstInitial()}${getLastInitial()}`}
            />

        </div>
    );
};

export default Profilebutton;
