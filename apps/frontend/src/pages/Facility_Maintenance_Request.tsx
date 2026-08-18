import '../styles.css';
import { FacilityMaintenanceRequestForm } from '../components/Facility_Maintenance_Request_Form.tsx';
import { Formbackground } from '../components/Formbackground.tsx';

const FacilityMaintenanceRequest = () => {
    return (
        <main id="request" className="overflow-x-hidden">
            <Formbackground />


            <div className="w-full h-5 opacity-0"></div>


            <FacilityMaintenanceRequestForm />


            <div className="w-full h-5 opacity-0"></div>
        </main>
    );
};

export default FacilityMaintenanceRequest;
