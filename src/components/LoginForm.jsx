import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import kadjivLogo from '../../public/kadjiv-logo.png';
import { useApp } from '../AppContext.jsx';
import Swal from 'sweetalert2';

const LoginForm = () => {
    const navigate = useNavigate();
    const { login, loading } = useApp();
    const [errors, setErrors] = useState({ email: "", password: "" });

    useEffect(() => {
        console.log(`The new errors : ${JSON.stringify(errors)}`)
    }, [errors])

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrors({ email: "", password: "" });

        const { email, password } = e.target;
        const result = await login(email.value, password.value);

        if (result.success) {
            e.target.reset();
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } else {
            if (result.status === 422 && result.errors) {
                // Erreurs de validation
                setErrors({
                    email: result.errors.email?.[0] || "",
                    password: result.errors.password?.[0] || ""
                });
            } else {
                // Erreur générale
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    // icon: "error",
                    title: result.error
                });
            }
        }
    }
    return (
        <>
            <form onSubmit={(e) => handleLogin(e)} className='rounded shadow p-3 w-100 m-5 border'>
                <div className="text-center">
                    <img src={kadjivLogo} className='img-fluid' />
                </div>
                <br />

                <label htmlFor="" className='form-label d-block'>Identifiant</label>
                <div className="input-group">
                    <span className="input-group-text" id="basic-addon1"><i className="bi bi-envelope-at-fill"></i></span>
                    <input type="email"
                        name="email"
                        autoFocus
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="Ex: john@gmail.com" />
                </div>
                {errors.email && <div className="text-danger d-inline mb-3">{errors.email}</div>}

                <br />
                <label htmlFor="" className='form-label d-block'>Mot de passe</label>
                <div className="input-group mb-3">
                    <span className="input-group-text" id="basic-addon1"><i className="bi bi-person-fill-lock"></i></span>
                    <input type="password"
                        name="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="**************" />
                </div>
                {errors.password && <div className="text-danger d-inline mb-3">{errors.password}</div>}

                <br />
                <button type="submit" disabled={loading} className="btn btn-dark w-100">
                    <i className="bi bi-box-arrow-in-right"></i> {loading ? 'Connexion...' : 'Se connecter'}
                </button>
                <br />
                <p className="text-center">
                    <small className="text-center">© Copyright | Kadjiv sarl <strong className='text-yellow'>{new Date().getFullYear()}</strong> </small>
                </p>
            </form>
        </>
    )
}

export default LoginForm;