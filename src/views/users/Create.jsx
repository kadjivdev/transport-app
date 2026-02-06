import { cilList, cilSend } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { useState } from "react";
import Card from "src/components/Card";
import CustomButton from "src/components/CustomButton";
import LinkButton from "src/components/LinkButton";
import InputLabel from "src/components/forms/InputLabel";
import { useApp } from "../../AppContext";
import { useNavigate } from "react-router-dom";

const Create = () => {
    const { register } = useApp()
    const [errors, setErrors] = useState({ name: '', email: '', password: '', password_confirmation: '' });

    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {

        e.preventDefault();

        const { name, email, password, password_confirmation } = e.target;

        try {
            const response = await register({
                name: name.value,
                email: email.value,
                password: password.value,
                password_confirmation: password_confirmation.value
            });

            if (response.success) {
                console.log('Utilisateur créé avec succès !');
                e.target.reset();
                setErrors({ name: '', email: '', password: '', password_confirmation: '' });

                // window.location.href = '/users/list';
                return navigate("/users/list");
            } else {
                if (response.errors) {
                    console.error('Erreurs de validation:', response?.errors);
                    // Erreurs de validation
                    setErrors(response?.errors);
                } else {
                    console.error('Erreur:', response.error);
                    alert('Une erreur est survenue');
                }
            }
        } catch (error) {
            console.log('Erreur lors de la création de l\'utilisateur :', error.response);
            if (error.response?.status === 422) {
                console.error('Erreurs de validation:', error.response?.data?.errors);
                // Erreurs de validation
                setErrors(error.response?.data?.errors);
            } else {
                console.error('Erreur:', error);
                alert('Une erreur est survenue');
            }
        }
    }

    return (
        <>
            <div className="row">
                <div className="col-md-2"></div>
                <div className="col-md-8">
                    <LinkButton route={"/users/list"}>
                        <CIcon className='' icon={cilList} /> Liste des utilisateurs
                    </LinkButton>

                    <Card>
                        <form onSubmit={(e) => handleSubmit(e)}>
                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="name"
                                    text="Nom & Prénom"
                                    required={true} />
                                <input type="text" name="name" className="form-control" id="name" placeholder="Ex: Dohou Joe" autoFocus />
                                {errors.name && <span className="text-danger">{errors.name}</span>}
                            </div>
                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="email"
                                    text="Email address"
                                    required={true} />
                                <input type="email" name="email" className="form-control" id="email" placeholder="Ex: joe@gmail.com" />
                                {errors.email && <span className="text-danger">{errors.email}</span>}
                            </div>
                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="password"
                                    text="Mot de passe"
                                    required={true} />
                                <input type="password" name="password" className="form-control" id="password" placeholder="Ex : **************" />
                                {errors.password && <span className="text-danger">{errors.password}</span>}
                            </div>
                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    text="Confirmez le mot de passe" />
                                <input type="password" name="password_confirmation" className="form-control" id="password_confirmation" placeholder="Ex : **************" />
                                {errors.password_confirmation && <span className="text-danger">{errors.password_confirmation}</span>}
                            </div>

                            <div className="">
                                <CustomButton newClass={'_btn-dark'} type="submit"> <CIcon icon={cilSend} /> Enregistrer </CustomButton>
                            </div>
                            <br /><br /><br />
                        </form>
                    </Card>
                </div>
                <div className="col-md-2"></div>
            </div>
        </>
    )
}

export default Create;