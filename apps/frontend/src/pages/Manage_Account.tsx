import { useEffect, useState } from 'react';
import Profilebutton from '../components/Profilebutton';
import { Calendar } from '../components/Calendar.tsx';
import '../styles.css';
import axios from 'axios';
import { API_ROUTES } from 'common/src/constants.ts';
import ChangePasswordModal from '../components/ChangePasswordModal.tsx';

import { Tooltip } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
// import ChangeProfileModal from '../components/ChangeProfileModal.tsx';
import { useLocalStorage } from '@uidotdev/usehooks';
const ManageAccounts = () => {
    const getFirstName = () => {
        const name = localStorage.getItem('name') || '';
        const nameParts = name.split(' ');
        return nameParts[0];
    };

    const [inEdit, setinEdit] = useState(false);
    const [Showsave, setShowsave] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [name, setName] = useState(localStorage.getItem('name'));
    //get just the name without a space
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();

    const [open, setOpen] = useState(false);
    const [profileColor, setProfileColor] = useLocalStorage('profileColor', '#044ca4');

    const [values, setValues] = useState({
        name: '',
        birthday: '',
        pronouns: '',
        role: '',
    });

    useEffect(() => {
        handleDisplayNewInfo();
        //need to get logs of submitted forms from the back end
        // need to use fetch to retrieve data from server
        ///logs is endpoint
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handleEditClick = () => {
        setinEdit(true);
        setShowsave(true);
    };

    const handleSaveClick = async () => {
        try {
            const data = JSON.stringify({
                email: localStorage.getItem('email'),
                name: values.name.trim(),
                birthday: values.birthday,
                pronouns: values.pronouns,
                role: values.role,
            });

            const res = await axios.post(API_ROUTES.EMPLOYEE, data, {
                headers: {
                    'content-Type': 'application/json',
                },
            });

            if (res.status === 200) {
                handleDisplayNewInfo();

                //can use this as a way to find the employee
                setinEdit(false);
                setShowsave(false); // this line was missing
            }
        } catch (error) {
            alert('Error submitting changes!');
            console.log('Error submitting changes:', error);
        }
    };
    const handleDisplayNewInfo = async () => {
        try {
            const res = await axios.get(
                API_ROUTES.EMPLOYEE + '?email=' + localStorage.getItem('email')
            );

            if (res.status === 200) {
                const employees = res.data;
                setValues({
                    name: employees.name,
                    birthday: employees.birthday,
                    pronouns: employees.pronouns,
                    role: employees.role,
                });
                localStorage.setItem('name', employees.name);
            }
        } catch (error) {
            alert('Error getting request');
            console.log('Error getting request:', error);
        }
    };

    return (
        <div className="min-h-screen p-2 bg-[url('/Service_Icons/ServicesPageBackground.png')] bg-cover bg-center bg-no-repeat">
            <div className="relative flex flex-col">
                <div className="relative flex flex-col">
                    <div className="flex flex-row justify-center items-center sm:mx-auto mt-7">
                        <div className="flex flex-col text-center -ml-4">
                            <h1 className="text-[#385DA6] text-4xl font-bold titleFont">
                                Welcome, {localStorage.getItem('name')}!
                            </h1>
                            <h2 className="text-[#385DA6] text-lg font-bold titleFont">
                                Manage your information to make Brigham & Women's better for you!
                            </h2>
                        </div>
                    </div>

                    <hr className="my-2 w-1/2 mx-auto border-t-3 border-[#044ca4]" />
                </div>

                <div className="flex justify-center py-3">
                    <div className="relative flex flex-col md:flex-row items-start bg-[#D9F0FF] p-6 rounded-lg shadow-inner w-full md:w-[90%] max-w-[50%]  ">
                        <button
                        // onClick={() => setOpen(true)}
                        // style={{ backgroundColor: profileColor }}
                        // className="ProfileManagmentbutton text-7xl leading-none focus:outline-none mt-6 "
                        >
                            <Profilebutton PressFromModal={false} />
                        </button>

                        <div className="relative flex flex-col bg-[#DFE9F2] px-4 py-2.5 rounded-lg shadow-inner textFont w-full max-w-xs md:max-w-sm">
                            <div className="flex justify-between items-center w-full ">
                                <div className="flex gap-2 -mb-2">
                                    <h1 className="headerFont text-[#385DA6] text-base md:text-lg ">
                                        Account Information
                                    </h1>
                                </div>
                                <div className="flex gap-2 mb-1">
                                    <Tooltip title="Change Password" arrow>
                                        <button
                                            onClick={() => setShowPasswordModal(true)}
                                            className="transition duration-200 ease-in-out bg-[#044ca4] hover:bg-[#033b84] text-white p-2 rounded-full shadow-md flex items-center justify-center hover:scale-105"
                                        >
                                            <LockOutlinedIcon fontSize="small" />
                                        </button>
                                    </Tooltip>
                                    <Tooltip title="Edit Info" arrow>
                                        <button
                                            onClick={handleEditClick}
                                            className="transition duration-200 ease-in-out bg-[#044ca4] hover:bg-[#033b84] text-white p-2 rounded-full shadow-md flex items-center justify-center hover:scale-105"
                                        >
                                            <EditOutlinedIcon fontSize="small" />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>

                            <hr className="my-1 w-full mx-auto border-t-3 border-[#044ca4]" />
                            <div className="mb-2"></div>

                            <ul className="headerFont">
                                <li>
                                    {inEdit ? (
                                        <div>
                                            <p>
                                                Name:
                                                <input
                                                    name="name"
                                                    className="border px-1 py-1"
                                                    value={values.name}
                                                    onChange={handleChange}
                                                />
                                            </p>
                                        </div>
                                    ) : (
                                        <p>Name: {values.name}</p>
                                    )}
                                </li>
                                <div className="mb-2"></div>
                                <li>Email: {localStorage.getItem('email')}</li>
                                <div className="mb-2"></div>
                                <li>Role: {values.role}</li>
                                <div className="mb-2"></div>
                                <li>
                                    {inEdit ? (
                                        <div>
                                            <div className="flex flex-col">
                                                <p>
                                                    Birthday:
                                                    <button
                                                        type="button"
                                                        className="headerFont text-sm md:w-1/3 p-1 border border-gray-300"
                                                        onClick={() =>
                                                            setShowCalendar(!showCalendar)
                                                        }
                                                    >
                                                        <div className="textFont text-sm">
                                                            {selectedDate
                                                                ? selectedDate.toLocaleDateString(
                                                                      undefined,
                                                                      {
                                                                          year: 'numeric',
                                                                          month: 'long',
                                                                          day: 'numeric',
                                                                      }
                                                                  )
                                                                : 'Choose Date'}
                                                        </div>
                                                    </button>
                                                </p>

                                                {showCalendar && (
                                                    <div className="mt-2 flex justify-center">
                                                        <Calendar
                                                            mode="single"
                                                            selected={selectedDate}
                                                            onSelect={(date) => {
                                                                setSelectedDate(date);
                                                                setValues((prev) => ({
                                                                    ...prev,
                                                                    birthday:
                                                                        date
                                                                            ?.toISOString()
                                                                            .split('en-CA')[0] ||
                                                                        '',
                                                                }));
                                                                setShowCalendar(false);
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p>
                                            Birthday:{' '}
                                            {values.birthday
                                                ? new Date(values.birthday).toLocaleDateString(
                                                      'en-GB',
                                                      {
                                                          day: 'numeric',
                                                          month: 'long',
                                                          year: 'numeric',
                                                      }
                                                  )
                                                : 'N/A'}
                                        </p>
                                    )}
                                </li>

                                <div className="mb-2"></div>
                                <li>
                                    {inEdit ? (
                                        <div>
                                            <p className="mb-1">Pronouns:</p>
                                            <select
                                                name="pronouns"
                                                value={
                                                    [
                                                        'she/her',
                                                        'he/him',
                                                        'they/them',
                                                        'prefer_not_to_say',
                                                    ].includes(values.pronouns)
                                                        ? values.pronouns
                                                        : 'other'
                                                }
                                                onChange={handleChange}
                                                className="border px-2 py-1 mb-2 rounded-md text-sm"
                                            >
                                                <option value="">Choose Pronoun</option>
                                                <option value="she/her">She/Her</option>
                                                <option value="he/him">He/Him</option>
                                                <option value="they/them">They/Them</option>
                                                <option value="prefer_not_to_say">
                                                    Prefer not to say
                                                </option>
                                                <option value="other">Other</option>
                                            </select>

                                            {values.pronouns !== '' &&
                                                ![
                                                    'she/her',
                                                    'he/him',
                                                    'they/them',
                                                    'prefer_not_to_say',
                                                ].includes(values.pronouns) && (
                                                    <input
                                                        name="pronouns"
                                                        placeholder="Enter your pronouns"
                                                        className="border px-2 py-1 rounded-md text-sm"
                                                        value={values.pronouns}
                                                        onChange={handleChange}
                                                    />
                                                )}
                                        </div>
                                    ) : (
                                        <p>Pronouns: {values.pronouns}</p>
                                    )}
                                </li>
                            </ul>

                            {Showsave && (
                                <button
                                    className="savebutton font-bold ml-10 mt-4 text-sm"
                                    onClick={handleSaveClick}
                                >
                                    Save
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ChangePasswordModal
                open={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />

            {/*<ChangeProfileModal*/}
            {/*    open={open}*/}
            {/*    onClose={() => setOpen(false)}*/}
            {/*    onColorChange={(color) => {*/}
            {/*        setProfileColor(color);*/}
            {/*    }}*/}
            {/*></ChangeProfileModal>*/}
        </div>
    );
};

export default ManageAccounts;
