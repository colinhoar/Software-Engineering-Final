{
    /*I copied the  exact thing I made for departments here
     *and I hope it works*/
}

import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm.tsx';

const Login = () => {
    return (
        <main id="login" className="h-screen">
            <LoginForm />
        </main>
    );
};

export default Login;
