import '../styles.css';
import { Language_Interpreter_Request_Form } from '../components/Language_Interpreter_Request_Form.tsx';
import { Formbackground } from '../components/Formbackground.tsx';

const LanguageRequest = () => {
    return (
        <main id="request" className="overflow-x-hidden">
            <Formbackground />
            {/* top padding */}
            <div className={'w-screen h-5 opacity-0'}></div>
            <Language_Interpreter_Request_Form />
            {/* bottom padding */}
            <div className={'w-screen h-5 opacity-0'}></div>
        </main>
    );
};

export default LanguageRequest;
