import { cilList, cilSend } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { useState } from "react";
import Card from "src/components/Card";
import Button from "src/components/Button";
import LinkButton from "src/components/LinkButton";
import InputLabel from "src/components/forms/InputLabel";
import { useApp } from "../../AppContext";

const Create = () => {
    const { register } = useApp
    const [errors, setErrors] = useState({ name: '', email: '', password: '', password_confirmation: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { fullname, email, password, password_confirmation } = e.target.value;

        try {
            const response = await register({
                name: fullname,
                email: email,
                password: password,
                password_confirmation: password_confirmation
            });

            if (response.status === 201) {
                console.log('Utilisateur créé avec succès !');
                e.target.reset();
                setErrors({ name: '', email: '', password: '', password_confirmation: '' });
            }
        } catch (error) {
            if (error.response?.status === 422) {
                // Erreurs de validation
                setErrors(error.response.data.errors);
            } else {
                console.error('Erreur:', error);
                alert('Une erreur est survenue');
            }
        } finally {
            setLoading(false);
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
                                    htmlFor="fullname"
                                    text="Nom & Prénom"
                                    required={true} />
                                <input type="text" className="form-control" id="fullname" placeholder="Ex: Dohou Joe" autoFocus />
                                {errors.name && <span className="text-danger">{errors.name}</span>}
                            </div>
                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="email"
                                    text="Email address"
                                    required={true} />
                                <input type="email" className="form-control" id="email" placeholder="Ex: joe@gmail.com" />
                                {errors.email && <span className="text-danger">{errors.email}</span>}
                            </div>
                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="password"
                                    text="Mot de passe"
                                    required={true} />
                                <input type="password" className="form-control" id="password" placeholder="Ex : **************" />
                                {errors.password && <span className="text-danger">{errors.password}</span>}
                            </div>
                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    text="Confirmez le mot de passe"
                                    required={true} />
                                <input type="password" className="form-control" id="password_confirmation" placeholder="Ex : **************" />
                                {errors.password_confirmation && <span className="text-danger">{errors.password_confirmation}</span>}
                            </div>

                            <div className="">
                                <Button newClass={'_btn-dark'}> <CIcon icon={cilSend} /> Enregistrer </Button>
                            </div>
                        </form>
                    </Card>
                </div>
                <div className="col-md-2"></div>
            </div>
        </>
    )
}

export default Create;