import { useEffect } from 'react';
import { Prisma } from '../../../../packages/database';

interface ServiceReqInfoPopupProps {
    // Determines whether modal is open or not
    open: boolean;
    // Function that closes the modal
    onClose: () => void;
    serviceRequest: Prisma.ServiceRequestsGetPayload<{
        include: { PatientTransportationRequest: true; FacilityMaintenanceRequest: true };
    }>;
}


export default function ServiceReqInfoPopup(props: ServiceReqInfoPopupProps) {
    const handleClose = () => {
        // Close the modal
        props.onClose();
    };

    // Close modal on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const modalContent = document.querySelector('.modal-main');
            if (props.open && modalContent && !modalContent.contains(event.target as Node)) {
                props.onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [props.open, props.onClose]);

    return (
        <div className={`${'modal'} ${props.open ? 'display-block' : 'display-none'} z-50`}>
            <div className="modal-main bg-white rounded-3xl shadow-xl max-w-md w-full max-h-[92vh] flex flex-col">
                <div className="w-full h-12 bg-[#003A96] rounded-t-lg">
                    <h1 className="text-2xl titleFont text-white dark:text-white text-center m-2">
                        All Info
                    </h1>
                </div>
                {/*close button*/}
                <button
                    onClick={handleClose}
                    className="absolute top-1 right-4 text-gray-200 hover:text-gray-400 text-xl font-bold transition-all focus:outline-none hover:cursor-pointer"
                    aria-label="Close"
                >
                    &times;
                </button>

                <div className="modal-body relative right-1/10 px-30 pb-4 pt-1 overflow-y-auto flex-1 mt-4">
                    <div className="flex flex-col gap-4">
                        <InfoField label="Request ID" value={props.serviceRequest.requestID} />
                        <InfoField label="Requester" value={props.serviceRequest.requesterName} />
                        <InfoField label="Assigned Employee ID" value={(props.serviceRequest.assignedEmployeeID)? props.serviceRequest.assignedEmployeeID : 'None'} />
                        <InfoField label="Category" value={props.serviceRequest.serviceCategory} />
                        <InfoField
                            label="Requested Service"
                            value={props.serviceRequest.requestedService}
                        />
                        <InfoField label="Description" value={props.serviceRequest.description} />
                        <InfoField label="Status" value={props.serviceRequest.status} />
                        <InfoField
                            label="Location"
                            value={props.serviceRequest.locationRequiringService}
                        />
                        <InfoField
                            label="Urgency Level"
                            value={props.serviceRequest.urgencyLevel}
                        />
                        {props.serviceRequest.serviceCategory === 'Patient Transportation' &&
                        props.serviceRequest.PatientTransportationRequest ? (
                            <>
                                <InfoField
                                    label="Date"
                                    value={props.serviceRequest.PatientTransportationRequest.date}
                                />
                                <InfoField
                                    label="Destination"
                                    value={
                                        props.serviceRequest.PatientTransportationRequest
                                            .destination
                                    }
                                />
                                <InfoField
                                    label="Patient Mobility Level"
                                    value={
                                        props.serviceRequest.PatientTransportationRequest
                                            .patientMobilityLevel
                                    }
                                />
                            </>
                        ) : null}
                        {props.serviceRequest.serviceCategory === 'Facility Maintenance' &&
                        props.serviceRequest.FacilityMaintenanceRequest ? (
                            <InfoField
                                label="Date"
                                value={props.serviceRequest.FacilityMaintenanceRequest.date}
                            />
                        ) : null}
                    </div>
                </div>

                <div className="w-full flex justify-center px-7 pb-6">
                    <button
                        className="buttonLook px-8 py-2 rounded-xl bg-[#385DA6] text-white font-semibold text-base transition hover:bg-[#020659] focus:outline-none"
                        onClick={handleClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// this is to make it more readable
function InfoField({ label, value }: { label: string; value: string | number | null | undefined }) {
    if (!value) return null;
    return (
        <div className="flex flex-col text-left">
            <span className="text-[13px] headerFont font-semibold text-[#9AA1A8] uppercase tracking-wide">
                {label}
            </span>
            <span className="text-[17px] textFont text-[#020659] font-semibold mt-0.5">
                {value}
            </span>
        </div>
    );
}
