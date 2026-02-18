import { cilList, cilSend } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { useState } from "react";
import Card from "src/components/Card";
import CustomButton from "src/components/CustomButton";
import LinkButton from "src/components/LinkButton";
import InputLabel from "src/components/forms/InputLabel";
import { useApp } from "../../AppContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import apiRoutes from "../../api/routes"

const Create = () => {
    const { setStatus, setLoading, setMessage, setStatusCode } = useApp();

    const [dataCamion, setDataCamion] = useState({ libelle: '', immatriculation: '' });
    const [errors, setErrors] = useState({ libelle: '', immatriculation: '' });

    const navigate = useNavigate();

    // handle change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setDataCamion((prev) => ({ ...prev, [name]: value }));
    }

    // submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Données du client à créer :', dataCamion);
        setLoading(true);
        setStatus(null);

        try {
            const response = await axiosInstance.post(apiRoutes.createCamion, dataCamion);
            console.log('Réponse du serveur après création du camion :', response.data);

            setErrors({ libelle: '', immatriculation: '' });

            setStatus('success');
            setMessage(`Le camion a été créé avec succès!`);
            setStatusCode(200);

            return navigate("/camions/list");
        } catch (error) {
            console.log('Erreur lors de la création du camion :', error);
            let errMessage = '';

            if (error.response?.status === 422) {
                // Erreurs de validation
                setStatus('error');
                errMessage = `Des erreurs de validation sont survenues. Veuillez vérifier les champs : ${Object.values(error.response?.data?.errors).join(', ')}`;
            } else {
                errMessage = `Une erreur inattendue est survenue. Veuillez réessayer. (${error.response?.data?.error || 'Erreure lors de la création du camion'})`;
            }

            setLoading(false);
            setStatus('error');
            setMessage(errMessage);
            setStatusCode(error.response?.status);
            setErrors(error.response?.data?.errors);
        }
    }

    return (
        <>
            <div className="row">
                <div className="col-md-2"></div>
                <div className="col-md-8">
                    <LinkButton route={"/camions/list"}>
                        <CIcon className='' icon={cilList} /> Liste des Camions
                    </LinkButton>

                    <Card>
                        <form onSubmit={(e) => handleSubmit(e)}>
                            <div className="mb-3">
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="libelle"
                                        text="Libellé"
                                        required={true} />
                                    <input type="text"
                                        name="libelle"
                                        value={dataCamion?.libelle}
                                        className="form-control"
                                        id="libelle"
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.libelle && <span className="text-danger">{errors?.libelle}</span>}
                                </div>
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="immatriculation"
                                        text="Immatriculation"
                                        required={true} />
                                    <input type="text"
                                        name="immatriculation"
                                        value={dataCamion?.immatriculation}
                                        className="form-control"
                                        id="immatriculation"
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.immatriculation && <span className="text-danger">{errors?.immatriculation}</span>}
                                </div>
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