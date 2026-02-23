import { cilList, cilSend } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { useState } from "react";
import Card from "src/components/Card";
import CustomButton from "src/components/CustomButton";
import LinkButton from "src/components/LinkButton";
import InputLabel from "src/components/forms/InputLabel";
import { useApp } from "../../../AppContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import apiRoutes from "../../../api/routes"

const Create = () => {
    const { setStatus, setLoading, setMessage, setStatusCode } = useApp();

    const [dataType, setDataType] = useState({ libelle: '', description: '' ,price:''});
    const [errors, setErrors] = useState({ libelle: '', description: '' ,price:''});

    const navigate = useNavigate();

    // handle change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setDataType((prev) => ({ ...prev, [name]: value }));
    }

    // submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Données du type à créer :', dataType);
        setLoading(true);
        setStatus(null);

        try {
            const response = await axiosInstance.post(apiRoutes.createLocationType, dataType);
            console.log('Réponse du serveur après création du type :', response.data);

            setErrors({ libelle: '', description: '' ,'price'});

            setStatus('success');
            setMessage(`Le type a été créé avec succès!`);
            setStatusCode(200);

            return navigate("/locations/types/list");
        } catch (error) {
            console.log('Erreur lors de la création du type :', error);
            let errMessage = '';

            if (error.response?.status === 422) {
                // Erreurs de validation
                setStatus('error');
                errMessage = `Des erreurs de validation sont survenues. Veuillez vérifier les champs : ${Object.values(error.response?.data?.errors).join(', ')}`;
            } else {
                errMessage = `Une erreur inattendue est survenue. Veuillez réessayer. (${error.response?.data?.error || 'Erreure lors de la création du type'})`;
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
                    <LinkButton route={"/locations/types/list"}>
                        <CIcon className='' icon={cilList} /> Liste des types de location
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
                                        value={dataType?.libelle}
                                        className="form-control"
                                        id="libelle"
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.libelle && <span className="text-danger">{errors?.libelle}</span>}
                                </div>
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="price"
                                        text="Le prix"
                                        required={true} />
                                    <input type="number"
                                        name="price"
                                        value={dataType?.price}
                                        className="form-control"
                                        id="price"
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.libelle && <span className="text-danger">{errors?.price}</span>}
                                </div>
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="description"
                                        text="description"
                                        required={true} />
                                    <input type="text"
                                        name="description"
                                        value={dataType?.description}
                                        className="form-control"
                                        id="description"
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.description && <span className="text-danger">{errors?.description}</span>}
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