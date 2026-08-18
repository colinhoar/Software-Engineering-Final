import { useEffect, useState } from 'react';
import '../styles.css';
import { ConfirmationPopup } from './ConfirmationPopup.tsx';
import { ThankYouPopup } from './ThankYouPopup.tsx';
import axios from 'axios';
import { API_ROUTES } from 'common/src/constants.ts';
import { fetchDepartments, fetchEmployees } from '../lib/utils.ts';
import { Prisma } from "../../../../packages/database/.prisma/client"
import { useSessionStorage } from "@uidotdev/usehooks";

export function SanitationRequestForm() {
    // values for form fields
    const [values, setValues] = useState({
        requesterName: window.localStorage.getItem("name"),
        assignedEmployeeID: null,
        requestedService: '',
        locationRequiringService: '',
        urgencyLevel: '',
        status: '',
        description: '',
    });

    const [formValuesSession, setFormValuesSession] = useSessionStorage('voiceFormValues', {
        requesterName: 'invalid',
        assignedEmployeeID: null,
        requestedService: '',
        locationRequiringService: '',
        urgencyLevel: '',
        status: '',
        description: '',
    });

    useEffect(() => {
        if (formValuesSession.requesterName!=='invalid'){
            setValues(formValuesSession)
            setFormValuesSession({
                requesterName: 'invalid',
                assignedEmployeeID: null,
                requestedService: '',
                locationRequiringService: '',
                urgencyLevel: '',
                status: '',
                description: '',
            })
        }
    }, [formValuesSession]);

    const [employee, setEmployee] = useState<
        Prisma.EmployeeGetPayload<{ include: {connectedUser: false} }>[]
    >([
        {
            id: -1,
            name: 'Loading...',
            role: 'Loading...',
            birthday: 'Loading...',
            pronouns: 'Loading...',
            profileColor: 'Loading...'
        },
    ]);

    // values for departments dropdown
    const [departments, setDepartments] = useState<
        Prisma.DepartmentGetPayload<{ include: { building: true } }>[]
    >([
        {
            // make it clear that departments haven't been fetched yet by default.
            // replaced by real departments once fetched
            departmentID: -1,
            name: 'Loading...',
            services: 'Loading...',
            location: 'Loading...',
            buildingID: -1,
            building: {
                name: '',
                id: 0,
            },
            floor: "-1",
            phone: 'Loading...',
        },
    ]);

    // state to show location dropdown options
    const [showFiltered, setShowFiltered] = useState(false);

    // error state for validation
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

    // gets the departments when necessary
    useEffect(() => {
        fetchDepartments(10, 1000, true, setDepartments);
    }, []);

    useEffect(() => {
        fetchEmployees(10, 1000, setEmployee);
    }, []);

    // Popup visibility states
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);
    const [voiceServiceConfirmation, setVoiceServiceConfirmation] = useSessionStorage('voiceServiceConfirmation', false)
    const [voiceServiceSubmit, setVoiceServiceSubmit] = useSessionStorage('voiceServiceSubmit', false)
    useEffect(() => {
            setShowConfirmation(voiceServiceConfirmation)
    }, [voiceServiceConfirmation]);
    useEffect(() => {
        if (voiceServiceSubmit){
            handleConfirming()
        }
    }, [voiceServiceSubmit]);

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        if (!values.requesterName.trim()) errors.requesterName = 'Name is required.';
        if (!values.urgencyLevel) errors.urgencyLevel = 'Urgency is required.';
        if (!values.status) errors.status = 'Status is required.';
        if (!values.locationRequiringService.trim())
            errors.locationRequiringService = 'Location is required.';
        else {
            let validLocation = false;
            departments.map((dept) => {
                if (
                    values.locationRequiringService.trim() ===
                    dept.name + ' at ' + dept.building.name
                ) {
                    validLocation = true;
                }
            });
            if (!validLocation) errors.locationRequiringService = 'Invalid location.';
        }

        if (!values.requestedService) errors.requestedService = 'Requested sanitation is required.';
        if (!values.description.trim()) errors.description = 'Description is required.';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Log changes while fields are being changed
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });

        if (name === 'locationRequiringService') setShowFiltered(true);
    };

    const handleBlur = (
        e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name } = e.target;
        setTouched({ ...touched, [name]: true });
        validateForm();
        if (name === 'locationRequiringService') {
            setShowFiltered(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valid = validateForm();
        const allTouched = Object.keys(values).reduce(
            (acc, key) => {
                acc[key] = true;
                return acc;
            },
            {} as typeof touched
        );
        setTouched(allTouched);

        if (valid) setShowConfirmation(true);
    };

    const postSubmit = () => {
        setShowConfirmation(false);
        setShowThankYou(true);
        setValues({
            requesterName: window.localStorage.getItem("name"),
            assignedEmployeeID: null,
            requestedService: '',
            locationRequiringService: '',
            urgencyLevel: '',
            status: '',
            description: '',
        });
        setVoiceServiceConfirmation(false)
        setVoiceServiceSubmit(false)
    };

    const handleConfirming = async () => {
        try {
            const data = JSON.stringify({
                requesterName: window.localStorage.getItem('name'),
                assignedEmployeeID: parseInt(values.assignedEmployeeID),
                requestedService: values.requestedService,
                locationRequiringService: values.locationRequiringService,
                urgencyLevel: values.urgencyLevel,
                status: values.status,
                description: values.description,
                serviceCategory: 'Sanitation',
            });

            // send request to backend
            const res = await axios.post(API_ROUTES.SERVICEREQUESTS, data, {
                headers: {
                    'content-Type': 'application/json',
                },
            });

            if (res.status === 200) {
                postSubmit();
            }
        } catch (error) {
            // ideally there would be a nice-looking popup on error like the confirmation form instead of a browser alert
            alert('Error submitting form!');
            console.log('Error submitting form:', error);
        }
    };

    return (
        <main>
            <div className=" card relative z-10 ">
                <h2 className=" titleFont flex flex-col mx-auto text-3xl space-y-2">
                    Sanitation Request Form
                </h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <h2 className="flex flex-col mx-auto formFont text-md text-center -mt-5">
                            Christopher Yon, Aliza Khalil
                        </h2>

                        <div className={'mt-2'}>
                            {/* Employee Type dropdown */}
                            <label>Assigned Employee</label>
                            <select
                                className={`cursor-pointer textFont text-sm w-full p-2 border border-red-500' : 'border-gray-300'} rounded`}
                                onChange={handleChange}
                                value={values.assignedEmployeeID? values.assignedEmployeeID:'null'}
                                name="assignedEmployeeID"
                                onBlur={handleBlur}
                                required
                            >
                                <option value={''} disabled>
                                    Assign an Employee
                                </option>
                                <option value={'null'}>
                                    Unassigned
                                </option>
                                {employee.map((emp) => (
                                    <option key={emp.id}
                                            value={emp.id}>
                                        {emp.name}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <div className={'mt-5'}>
                            {/* Sanitation Type dropdown */}
                            <label>Urgency Level</label>
                            <select
                                name="urgencyLevel"
                                className={`cursor-pointer textFont text-sm w-full p-2 border ${formErrors.urgencyLevel && touched.urgencyLevel ? 'border-red-500' : 'border-gray-300'} rounded`}
                                value={values.urgencyLevel}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            >
                                <option value={''} disabled>
                                    Please select
                                </option>
                                <option value="Emergency">Emergency</option>
                                <option value="High/Urgent">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                            {formErrors.urgencyLevel && touched.urgencyLevel && (
                                <p className="cursor-pointer textFont text-red-500 text-sm mt-1">
                                    {formErrors.urgencyLevel}
                                </p>
                            )}
                        </div>

                        <div className={'mt-5'}>
                            {/* Status dropdown */}
                            <label>Status</label>
                            <select
                                name="status"
                                className={`cursor-pointer textFont text-sm w-full border p-2 ${formErrors.status && touched.status ? 'border-red-500' : 'border-gray-300'} rounded`}
                                value={values.status}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            >
                                <option value={''} disabled>
                                    Please select
                                </option>

                                <option value="Unassigned">Unassigned</option>
                                <option value="Assigned">Assigned</option>
                                <option value="Working">Working</option>
                                <option value="Done">Done</option>
                            </select>
                            {!formErrors.status && !touched.status && <p></p>}
                            {formErrors.status && touched.status && (
                                <p className="cursor-pointer textFont text-red-500 text-sm mt-1">
                                    {formErrors.status}
                                </p>
                            )}
                        </div>

                        <div className="mt-5 relative">
                            {/* Location field */}
                            <label htmlFor="location-search">Location</label>
                            <input
                                id="location-search"
                                type="text"
                                name="locationRequiringService"
                                className={`cursor-pointer textFont text-sm w-full p-2 border ${formErrors.locationRequiringService && touched.locationRequiringService ? 'border-red-500' : 'border-gray-300'} rounded`}
                                placeholder="Search location..."
                                value={values.locationRequiringService}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                onFocus={() => setShowFiltered(true)}
                            />
                            {formErrors.locationRequiringService &&
                                touched.locationRequiringService && (
                                    <p className="cursor-pointer textFont text-red-500 text-sm mt-1">
                                        {formErrors.locationRequiringService}
                                    </p>
                                )}

                            {showFiltered && (
                                <div className="cursor-pointer textFont text-sm absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded max-h-48 overflow-y-auto shadow-lg">
                                    {departments
                                        .filter((dept) =>
                                            (dept.name + ' ' + dept.building.name)
                                                .toLowerCase()
                                                .includes(
                                                    values.locationRequiringService.toLowerCase()
                                                )
                                        )
                                        .map((dept) => (
                                            <div
                                                key={dept.departmentID}
                                                className="cursor-pointer p-2 hover:bg-gray-100 cursor-pointer"
                                                onMouseDown={() => {
                                                    const selected =
                                                        dept.name +
                                                        ' at ' +
                                                        dept.building.name
                                                    setValues({
                                                        ...values,
                                                        locationRequiringService: selected,
                                                    });
                                                    setShowFiltered(false);
                                                }}
                                            >
                                                {dept.building.name + ', ' + dept.name}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        <div className={'mt-5'}>
                            {/* Sanitation Type dropdown */}
                            <label>Sanitation Requested</label>
                            <select
                                name="requestedService"
                                className={`cursor-pointer textFont text-sm w-full border p-2 ${formErrors.requestedService && touched.requestedService ? 'border-red-500' : 'border-gray-300'} rounded`}
                                value={values.requestedService}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            >
                                <option value={''} disabled>
                                    Please select
                                </option>
                                <option value="Waste Management">Waste Management</option>
                                <option value="Room Cleaning">Room Cleaning</option>
                                <option value="OR Cleaning">OR Cleaning</option>
                                <option value="Waiting area Cleaning">Waiting Area Cleaning</option>
                                <option value="Hallway Cleaning">Hallway Cleaning</option>
                                <option value="Disposal">Disposal</option>
                                <option value="Disinfection">Disinfection</option>
                                <option value="Laundry and Lining">Laundry and Lining</option>
                            </select>
                            {formErrors.requestedService && touched.requestedService && (
                                <p className="cursor-pointer textFont text-red-500 text-sm mt-1">
                                    {formErrors.requestedService}
                                </p>
                            )}
                        </div>
                    </div>


                    <div className={'mt-5'}>
                        {/* Description */}
                        <label>Sanitation Description</label>
                        <textarea
                            name={'description'}
                            className={`textFont text-sm w-full border p-2 ${formErrors.description && touched.description ? 'border-red-500' : 'border-gray-300'} rounded`}
                            value={values.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Description of Request"
                            required
                        />
                        {formErrors.description && touched.description && (
                            <p className="textFont text-red-500 text-sm mt-1">
                                {formErrors.description}
                            </p>
                        )}
                    </div>


                    {/* Submit button */}
                    <button type="submit" className="button buttonLook mt-2">
                        Submit
                    </button>
                </form>
            </div>

            <ConfirmationPopup
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleConfirming}
                formValues={values}
            />

            <ThankYouPopup open={showThankYou} onClose={() => setShowThankYou(false)} />
        </main>
    );
}
