import '../styles.css';
import { SanitationRequestForm } from '../components/Sanitation_Request_Form.tsx';
import { Formbackground } from '../components/Formbackground.tsx';

const SanitationRequest = () => {
    return (
        <main id="request" className="overflow-x-hidden">
            <Formbackground />
            {/* top padding (I don't know any other way other than this blank div hack) */}
            <div className={'w-screen h-5 opacity-0'}></div>
            <SanitationRequestForm />
            {/* bottom padding */}
            <div className={'w-screen h-5 opacity-0'}></div>
        </main>
    );
};

export default SanitationRequest;
