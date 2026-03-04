import { cibAddthis, cilCut, cilList, cilSend } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Card from "src/components/Card";
import CustomButton from "src/components/CustomButton";
import LinkButton from "src/components/LinkButton";
import InputLabel from "src/components/forms/InputLabel";
import { useApp } from "../../AppContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import apiRoutes from "../../api/routes"
import Select from 'react-select'
import Swal from "sweetalert2";

const Create = () => {
    const { setStatus, setLoading, setMessage, setStatusCode } = useApp();

    const [dataDepense, setDataDepense] = useState({
        location_id: "",
        montant: '',
        preuve: "",
        commentaire: "",
    });
    const [errors, setErrors] = useState({
        location_id: "",
        montant: "",
        preuve: "",
        commentaire: "",
    });

    const [locations, setLocations] = useState([]);

    // les locations
    const getLocations = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allLocation)

            // juste les locations déjà validés & ayant du reste à livrer
            let data = response?.data?.filter((location) => location.validatedAt) || []
            setLocations(data);

            console.log("Les locations :", data)

            setStatus('success');
            setStatusCode(response.status);
            setMessage('Liste des locations chargées avec succès!');

            return response.data;
        } catch (error) {
            setStatus('error');
            setStatusCode(error.response?.status);
            setMessage('Erreure lors du chargement des locations!!');
            return [];
        }
    }, [])

    useEffect(function () {
        // chargements des locations
        getLocations();
    }, [])

    const navigate = useNavigate();

    useEffect(() => (
        console.log("Data depense :", dataDepense)
    ), [dataDepense]);

    // amount hundling...
    const handleMontantChange = (value) => {
        setDataDepense((prev) => ({
            ...prev,
            montant: value
        }));
    }

    // submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Données de la depense à créer :', dataDepense);
        setLoading(true);
        setStatus(null);

        try {
            const response = await axiosInstance.post(apiRoutes.createDepense, dataDepense, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log('Réponse du serveur après création de la depense :', response.data);

            setErrors({
                location_id: "",
                montant: "",
                preuve: "",
                commentaire: "",
            });

            setStatus('success');
            setMessage(`La depense a été crée avec succès!`);
            setStatusCode(200);

            return navigate("/depenses/list");
        } catch (error) {
            console.log('Erreur lors de la création de la depense :', error);
            let errMessage = '';

            if (error.response?.status === 422) {
                // Erreurs de validation
                setStatus('error');
                errMessage = `Des erreurs de validation sont survenues. Veuillez vérifier les champs : ${Object.values(error.response?.data?.errors).join(', ')}`;
                setErrors(error.response?.data?.errors);
            } else {
                errMessage = `Une erreur inattendue est survenue. Veuillez réessayer. (${error.response?.data?.error || 'Erreure lors de la création du type'})`;
            }

            setLoading(false);
            setStatus('error');
            setMessage(errMessage);
            setStatusCode(error.response?.status);
        }
    }

    return (
        <>
            <div className="row">
                <div className="col-md-2"></div>
                <div className="col-md-8">
                    <LinkButton route={"/depenses/list"}>
                        <CIcon className='' icon={cilList} /> Liste des dépenses
                    </LinkButton>

                    <Card>
                        <form onSubmit={(e) => handleSubmit(e)}>
                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="location"
                                    text="La location"
                                    required={true} />
                                <Select
                                    placeholder="Rechercher une location ..."
                                    name="location_id"
                                    id="location_id"
                                    required
                                    className="form-control mt-1 block w-full"
                                    options={locations?.map((location) => ({
                                        value: location.id,
                                        label: `${location.reference}`,
                                    }))}
                                    value={locations
                                        .map((location) => ({
                                            value: location.id,
                                            label: `${location.reference}`,
                                        }))
                                        .find((option) => option.value === dataDepense.location_id)} // set selected option
                                    onChange={(option) => setDataDepense({ ...dataDepense, location_id: option.value })} // update state with id
                                />
                                {errors.location_id && <span className="text-danger">{errors.location_id}</span>}
                            </div>

                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="montant"
                                    text="Montant de la dépense"
                                    required={true} />
                                <input type="number" name="montant"
                                    className="form-control" id="montant"
                                    value={dataDepense.montant}
                                    placeholder="Ex: 50.000"
                                    required
                                    onChange={(e) => handleMontantChange(e.target.value)}
                                />
                                {errors.montant && <span className="text-danger">{errors.montant}</span>}
                            </div>
                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="preuve"
                                    text="La preuve du reglement"
                                    required={true} />
                                <input type="file" name="preuve"
                                    className="form-control" id="contrat"
                                    required
                                    onChange={(e) => setDataDepense({ ...dataDepense, preuve: e.target.files[0] })} />
                                {errors.preuve && <span className="text-danger">{errors.preuve}</span>}
                            </div>

                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="commenatire"
                                    text="Commentaire"
                                    required={false} />
                                <textarea name="commentaire" className="form-control"
                                    rows="2"
                                    placeholder="Laissez un commentaire ...."
                                    onChange={(e) => setDataDepense({ ...dataDepense, commentaire: e.target.value })}></textarea>
                                {errors.commentaire && <span className="text-danger">{errors.commentaire}</span>}
                            </div>

                            <br />
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