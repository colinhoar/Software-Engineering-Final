import React, { useEffect } from 'react';
import '../styles.css';
import './Sanitation_Request_Form.tsx';

interface ConfirmationPopupProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    formValues: {
        requesterName: string;
        assignedEmployeeID: number;
        requestedService: string;
        locationRequiringService: string;
        urgencyLevel: string;
        status: string;
        description: string;
        PatientTransportationRequest?: {
            date: string;
            destination: string;
            mobilitylevel: string;
        };
        FacilityMaintenanceRequest?: {
            date: string;
        };
    };
}

export const ConfirmationPopup = (props: ConfirmationPopupProps) => {

    // prevent background scrolling when popup is open
    useEffect(() => {
        if (props.open) {
            const backup = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = "hidden";

            return () => {
                document.body.style.overflow = backup;
            };
        }
    }, [props.open]);

    return (
        <div className={`modal ${props.open ? 'display-block' : 'display-none'} z-11`}>
            <div
                className="modal-main confirmation-modal relative bg-white rounded-lg shadow-xl max-w-xl mx-auto"
                style={{ border: 'none' }}
            >

                {/* Close (X) Button */}
                <button
                    onClick={props.onClose}
                    className="absolute top-1 right-4 text-gray-200 hover:text-gray-400 text-2xl font-bold leading-none focus:outline-none z-10"
                >
                    &times;
                </button>

                <div className="absolute w-full h-12 bg-[#044CA4] rounded-t-lg">
                    <h1 className="text-2xl titleFont text-white dark:text-white text-center m-2">
                        Confirm Your Submission
                    </h1>


                    <p className="mb-6 text-center font-medium text-[#020659] textFont mt-5">
                        Please review your request details
                    </p>
                </div>
                <div className="modal-body w-full px-10 mt-25">
                    {/* scrollable content */}
                    <div className="bg-gray-50 p-6 rounded-lg max-h-70 overflow-y-auto shadow-inner">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-6 text-[#020659]">
                            <Detail
                                label="Requesters Name"
                                value={props.formValues.requesterName}
                            />
                            <Detail
                                label="Assigned Employee ID"
                                value={props.formValues.assignedEmployeeID ? String(props.formValues.assignedEmployeeID):"Unassigned"}
                            />
                            <Detail
                                label="Service Requested"
                                value={props.formValues.requestedService}
                            />
                            <Detail
                                label="Location"
                                value={props.formValues.locationRequiringService}
                            />
                            <Detail label="Urgency Level" value={props.formValues.urgencyLevel} />
                            <Detail label="Status" value={props.formValues.status} />
                            {props.formValues.FacilityMaintenanceRequest && (
                                <div className="">
                                    <Detail
                                        label="Date"
                                        value={new Date(
                                            props.formValues.FacilityMaintenanceRequest.date
                                        ).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    />
                                </div>
                            )}
                            {props.formValues.PatientTransportationRequest && (
                                <>
                                    <Detail
                                        label="Date"
                                        value={new Date(
                                            props.formValues.PatientTransportationRequest.date
                                        ).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    />
                                    <Detail
                                        label="Destination"
                                        value={
                                            props.formValues.PatientTransportationRequest
                                                .destination
                                        }
                                    />
                                    <div className="">
                                        <Detail
                                            label="Mobility Level"
                                            value={
                                                props.formValues.PatientTransportationRequest
                                                    .mobilitylevel
                                            }
                                        />
                                    </div>
                                </>
                            )}
                            <div className="col-span-2">
                                <Detail label="Description" value={props.formValues.description} />
                            </div>

                        </div>
                    </div>
                </div>

                <p className="mb-1 text-center text-sm  textFont text-[#020659]">
                    Are you sure you want to submit this request?
                </p>

                <div className="flex justify-center gap-4 mt-1">
                    <button
                        className="headerFont bg-white border-2 hover:bg-[#3F74B8] border-gray-300 hover:border-2 cursor-pointer text-gray-700 font-lg py-2 px-6 rounded-lg transform-scale(1.05)"
                        onClick={props.onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="buttonLook font-lg py-2 px-8 rounded-lg transition-colors duration-200 cursor-pointer text-white"
                        onClick={props.onConfirm}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

// Reusable detail block
const Detail = ({ label, value }: { label: string; value: string }) => (
    <div className="text-center">
        <h3 className="font-medium text-gray-500 text-sm uppercase tracking-wide">{label}</h3>
        <p className="mt-1 text-gray-800 break-words">{value}</p>
    </div>
);
