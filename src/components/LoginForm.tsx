import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import kadjivLogo from '../../public/kadjiv-logo.png';
import aipRoutes from "../api/routes";
import SuccessAlert from './Alerts/SuccessAlert.tsx';

const LoginForm = () => {
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        const { email, password } = e.target;

        try {
            const response = await axios.post(aipRoutes.login, {
                email: email.value,
                password: password.value
            });

            if (response.status === 200) {
                setShowSuccess(true);
                
                // Redirection après 2 secondes
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            alert('Email ou mot de passe incorrect');
        }
    }
    return (
        <>
            {showSuccess && <SuccessAlert text={'Vous êtes connecté.e avec succès!'} />}
            <form onSubmit={(e) => handleLogin(e)} className='rounded shadow p-3 w-100 m-5 border'>
                <div className="text-center">
                    <img src={kadjivLogo} className='img-fluid' />
                </div>
                <br />
                <label htmlFor="" className='form-label'>Identifiant</label>
                <div className="input-group mb-3">
                    <span className="input-group-text" id="basic-addon1"><i className="bi bi-envelope-at-fill"></i></span>
                    <input type="email"
                        name="email"
                        autoFocus
                        className="form-control"
                        placeholder="Ex: john@gmail.com" required />
                </div>

                <label htmlFor="" className='form-label'>Mot de passe</label>
                <div className="input-group mb-3">
                    <span className="input-group-text" id="basic-addon1"><i className="bi bi-person-fill-lock"></i></span>
                    <input type="password"
                        name="password"
                        className="form-control"
                        placeholder="**************" required />
                </div>
                <button type="submit" className="btn btn-dark w-100"><i className="bi bi-box-arrow-in-right"></i> Se connecter</button>
                <br />
                <p className="text-center">
                    <small className="text-center">© Copyright | Kadjiv sarl <strong className='text-yellow'>{new Date().getFullYear()}</strong> </small>
                </p>
            </form>
        </>
    )
}

export default LoginForm;