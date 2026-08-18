import '../styles.css';
import { Patient_Transportation_Request_Form } from '../components/Patient_Transportation_Request_Form.tsx';
import { Formbackground } from '../components/Formbackground.tsx';

const PatientTransportationRequest = () => {
    return (
        <main id="request" className="overflow-x-hidden">
            <Formbackground />
            {/* top padding (I don't know any other way other than this blank div hack) */}
            <div className={'w-screen h-5 opacity-0'}></div>
            <Patient_Transportation_Request_Form />
            {/* bottom padding */}
            <div className={'w-screen h-5 opacity-0'}></div>
        </main>
    );
};

export default PatientTransportationRequest;
