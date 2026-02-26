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

    const [dataReglement, setDataReglement] = useState({
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
    const currentLocation = useRef([])

    // les locations
    const getLocations = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allLocation)

            // juste les reglement déjà validés & ayant du reste à livrer
            let data = response?.data?.filter((location) => (location.validatedAt && location._reste > 0)) || []
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
        console.log("Data reglement :", dataReglement)
    ), [dataReglement]);

    const handleLocationChange = (value) => {
        let location = locations.find(loca => loca.id == value);
        if (!location) return;

        currentLocation.current = location

        setDataReglement((prev) => ({
            ...prev,
            location_id: value, montant: location._reste
        }));
    }

    // amount hundling...
    const handleMontantChange = (value) => {

        if (value > currentLocation.current?._reste) {
            Swal.fire({
                'title': 'Montant invalide',
                text: `Le montant maximum restant est de : ${currentLocation.current?._reste}`
            })

            setDataReglement((prev) => ({
                ...prev,
                montant: value, montant: currentLocation.current?._reste
            }));
            return;
        }

        setDataReglement((prev) => ({
            ...prev,
            montant: value, montant: value
        }));
    }

    // submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Données du reglement à créer :', dataReglement);
        setLoading(true);
        setStatus(null);

        try {
            const response = await axiosInstance.post(apiRoutes.createReglement, dataReglement, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log('Réponse du serveur après création de la ocation :', response.data);

            setErrors({
                location_id: "",
                montant: "",
                preuve: "",
                commentaire: "",
            });

            setStatus('success');
            setMessage(`Le reglement a été crée avec succès!`);
            setStatusCode(200);

            return navigate("/reglements/list");
        } catch (error) {
            console.log('Erreur lors de la création du reglement :', error);
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
                    <LinkButton route={"/reglements/list"}>
                        <CIcon className='' icon={cilList} /> Liste des reglements
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
                                        .find((option) => option.value === dataReglement.location_id)} // set selected option
                                    onChange={(option) => handleLocationChange(option.value)} // update state with id
                                />
                                {errors.location_id && <span className="text-danger">{errors.location_id}</span>}
                            </div>

                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="montant"
                                    text="Montant du reglement"
                                    required={true} />
                                <input type="number" name="montant"
                                    className="form-control" id="montant"
                                    value={dataReglement.montant}
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
                                    onChange={(e) => setDataReglement({ ...dataReglement, preuve: e.target.files[0] })} />
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
                                    onChange={(e) => setDataReglement({ ...dataReglement, commentaire: e.target.value })}></textarea>
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