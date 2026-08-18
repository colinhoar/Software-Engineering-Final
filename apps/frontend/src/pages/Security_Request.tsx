import '../styles.css';
import { Security_Request_Form } from '../components/Security_Request_Form.tsx';
import { Formbackground } from '../components/Formbackground.tsx';

const SecurityRequest = () => {
    return (
        <main id="request" className="overflow-x-hidden">
            <Formbackground />

            <div className={'w-screen h-5 opacity-0'}></div>
            <Security_Request_Form />

            <div className={'w-screen h-5 opacity-0'}></div>
        </main>
    );
};

export default SecurityRequest;
