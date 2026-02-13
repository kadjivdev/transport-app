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

    const [dataClient, setDataClient] = useState({ nom: '', prenom: '', phone: '', ifu: '' });
    const [errors, setErrors] = useState({ nom: '', prenom: '', phone: '', ifu: '' });

    const navigate = useNavigate();

    // handle change
    const handleChange = (e) => {
        const { name, value } = e.target;
        dataClient[name] = value;
        setDataClient({ ...dataClient, [name]: value });
    }

    // submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Données du client à créer :', dataClient);
        setLoading(true);
        setStatus(null);

        try {
            const response = await axiosInstance.post(apiRoutes.createClient, dataClient);
            console.log('Réponse du serveur après création du client :', response.data);

            setErrors({ nom: '', prenom: '', phone: '', ifu: '' });

            setStatus('success');
            setMessage(`Le client a été créé avec succès!`);
            setStatusCode(200);

            return navigate("/clients/list");
        } catch (error) {
            console.log('Erreur lors de la création du client :', error);
            let errMessage = '';

            if (error.response?.status === 422) {
                // Erreurs de validation
                setStatus('error');
                errMessage = `Des erreurs de validation sont survenues. Veuillez vérifier les champs : ${Object.values(error.response?.data?.errors).join(', ')}`;
            } else {
                errMessage = `Une erreur inattendue est survenue. Veuillez réessayer. (${error.response?.data?.error || 'Erreure lors de la création du client'})`;
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
                    <LinkButton route={"/clients/list"}>
                        <CIcon className='' icon={cilList} /> Liste des Clients
                    </LinkButton>

                    <Card>
                        <form onSubmit={(e) => handleSubmit(e)}>
                            <div className="mb-3">
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="nom"
                                        text="Nom"
                                        required={true} />
                                    <input type="text"
                                        name="nom"
                                        value={dataClient.nom}
                                        className="form-control"
                                        id="nom" placeholder={`Ex: ${dataClient.nom}`}
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.nom && <span className="text-danger">{errors?.nom}</span>}
                                </div>
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="prenom"
                                        text="Prénom"
                                        required={true} />
                                    <input type="text"
                                        name="prenom"
                                        value={dataClient.prenom}
                                        className="form-control"
                                        id="prenom" placeholder={`Ex: ${dataClient.prenom}`}
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.prenom && <span className="text-danger">{errors?.prenom}</span>}
                                </div>
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="phone"
                                        text="Télephone"
                                        required={true} />
                                    <input type="tel" name="phone" value={dataClient.phone}
                                        className="form-control"
                                        id="phone" placeholder={`Ex: ${dataClient.phone}`}
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.phone && <span className="text-danger">{errors?.phone}</span>}
                                </div>
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="ifu"
                                        text="IFU"
                                        required={true} />
                                    <input type="text" name="ifu" value={dataClient.ifu}
                                        className="form-control" id="ifu" placeholder={`Ex: ${dataClient.ifu}`}
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.ifu && <span className="text-danger">{errors?.ifu}</span>}
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