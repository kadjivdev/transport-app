import { cibAddthis, cilCut, cilList, cilSend } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { useCallback, useEffect, useState } from "react";
import Card from "src/components/Card";
import CustomButton from "src/components/CustomButton";
import LinkButton from "src/components/LinkButton";
import InputLabel from "src/components/forms/InputLabel";
import { useApp } from "../../AppContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import apiRoutes from "../../api/routes"
import Select from 'react-select'

const Create = () => {
    const { setStatus, setLoading, setMessage, setStatusCode } = useApp();

    const [dataLocation, setDataLocation] = useState({
        client_id: '',
        location_type_id: '',
        date_location: '',
        contrat: '',
        details: [{
            price: '',
            camion_id: ''
        },]
    });
    const [errors, setErrors] = useState({
        client_id: '',
        location_type_id: '',
        date_location: '',
        contrat: '',
        details: [{
            price: '',
            camion_id: ''
        },]
    });

    const [clients, setClients] = useState([]);
    const [types, setTypes] = useState([]);
    const [camions, setCamions] = useState([]);

    // les clients
    const getClients = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allClient)

            setClients(response?.data || []);

            console.log("Les clients :", response?.data)

            setStatus('success');
            setStatusCode(response.status);
            setMessage('Liste des clients chargés avec succès!');

            return response.data;
        } catch (error) {
            setStatus('error');
            setStatusCode(error.response?.status);
            setMessage('Erreure lors du chargement des clients!!');
            return [];
        }
    }, [])

    // les types
    const getTypes = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allLocationType)

            setTypes(response?.data || []);

            console.log("Les types :", response?.data)

            setStatus('success');
            setStatusCode(response.status);
            setMessage('Liste des types chargés avec succès!');

            return response.data;
        } catch (error) {
            setStatus('error');
            setStatusCode(error.response?.status);
            setMessage('Erreure lors du chargement des types!!');
            return [];
        }
    }, [])

    // les Camions
    const getCamions = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allCamion)

            setCamions(response?.data || []);

            console.log("Les camions :", response?.data)

            setStatus('success');
            setStatusCode(response.status);
            setMessage('Liste des camions chargés avec succès!');

            return response.data;
        } catch (error) {
            setStatus('error');
            setStatusCode(error.response?.status);
            setMessage('Erreure lors du chargement des camions!!');
            return [];
        }
    }, [])

    useEffect(function () {
        // chargements des clients
        getClients();
        // chargement des types
        getTypes();
        // chargement des camions
        getCamions();
    }, [])

    const navigate = useNavigate();

    useEffect(() => (
        console.log("Data location :", dataLocation)
    ), [dataLocation]);

    // handle detail adding
    const addDetail = (e) => {
        e.preventDefault()

        let newDetail = {
            price: '',
            camion_id: ''
        }
        setDataLocation({ ...dataLocation, details: [...dataLocation.details, newDetail] })
    }

    // handle detail removing
    const removeDetail = (e, index) => {
        e.preventDefault()

        let fiteredDetails = dataLocation.details.filter((__, i) => i != index)
        console.log("filtrerdDetails", fiteredDetails)
        setDataLocation({ ...dataLocation, details: fiteredDetails })
    }

    // submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Données du location à créer :', dataLocation);
        setLoading(true);
        setStatus(null);

        try {
            const response = await axiosInstance.post(apiRoutes.createLocation, dataLocation, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log('Réponse du serveur après création de la ocation :', response.data);

            setErrors({ libelle: '', description: '' });

            setStatus('success');
            setMessage(`La location a été créée avec succès!`);
            setStatusCode(200);

            return navigate("/locations/list");
        } catch (error) {
            console.log('Erreur lors de la création de la location :', error);
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
                    <LinkButton route={"/locations/list"}>
                        <CIcon className='' icon={cilList} /> Liste des locations
                    </LinkButton>

                    <Card>
                        <form onSubmit={(e) => handleSubmit(e)}>
                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="client"
                                    text="Le Client"
                                    required={true} />
                                <Select
                                    placeholder="Rechercher un client ..."
                                    name="client_id"
                                    id="client_id"
                                    required
                                    className="form-control mt-1 block w-full"
                                    options={clients.map((client) => ({
                                        value: client.id,
                                        label: `${client.nom} - ${client.prenom}`,
                                    }))}
                                    value={clients
                                        .map((client) => ({
                                            value: client.id,
                                            label: `${client.nom} - ${client.prenom}`,
                                        }))
                                        .find((option) => option.value === dataLocation.client_id)} // set selected option
                                    onChange={(option) => setDataLocation({ ...dataLocation, client_id: option.value })} // update state with id
                                />
                                {errors.client_id && <span className="text-danger">{errors.client_id}</span>}
                            </div>
                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="location_type_id"
                                    text="Type de location"
                                    required={true} />
                                <Select
                                    placeholder="Rechercher un type de location ..."
                                    name="location_type_id"
                                    id="location_type_id"
                                    required
                                    className="form-control mt-1 block w-full"
                                    options={types.map((type) => ({
                                        value: type.id,
                                        label: `${type.libelle}`,
                                    }))}
                                    value={types
                                        .map((type) => ({
                                            value: type.id,
                                            label: `${type.libelle}`,
                                        }))
                                        .find((option) => option.value === dataLocation.location_type_id)} // set selected option
                                    onChange={(option) => setDataLocation({ ...dataLocation, location_type_id: option.value })} // update state with id
                                />
                                {errors.location_type_id && <span className="text-danger">{errors.location_type_id}</span>}
                            </div>

                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="date"
                                    text="Date de location"
                                    required={true} />
                                <input type="date" name="date"
                                    className="form-control" id="date"
                                    onChange={(e) => setDataLocation({ ...dataLocation, date_location: e.target.value })}
                                    required />
                                {errors.date && <span className="text-danger">{errors.date}</span>}
                            </div>
                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="contrat"
                                    text="Le contrat de location" />
                                <input type="file" name="contrat"
                                    className="form-control" id="contrat"
                                    onChange={(e) => setDataLocation({ ...dataLocation, contrat: e.target.files[0] })} />
                                {errors.contrat && <span className="text-danger">{errors.contrat}</span>}
                            </div>

                            {/* Details dela location */}
                            <div className="mb-3">
                                <button className="btn my-2 btn-sm btn-success text-white"
                                    onClick={(e) => addDetail(e)}>
                                    <CIcon icon={cibAddthis} />Ajouter un détail
                                </button>
                                {/* <br /> */}
                                {dataLocation.details?.map((detail, index) => (
                                    <div className="align-items-center d-flex justify-content-between"
                                        key={index}
                                    >
                                        <div className="">
                                            <InputLabel
                                                text="Le prix "
                                                required={true} />
                                            <input type="number"
                                                className="form-control"
                                                required
                                                placeholder="Ex: 50.000"
                                                onChange={function (e) {
                                                    let allDetail = [...dataLocation.details]
                                                    allDetail[index].price = e.target.value
                                                    setDataLocation({ ...dataLocation, details: allDetail })
                                                }} />
                                        </div>
                                        <div className="">
                                            <InputLabel
                                                text="Le Camion "
                                                required={true} />
                                            <Select
                                                placeholder="Rechercher un Camion ..."
                                                name="client_id"
                                                id="client_id"
                                                required
                                                className="form-control mt-1 block w-full"
                                                options={camions.map((camion) => ({
                                                    value: camion.id,
                                                    label: `${camion.libelle}`,
                                                }))}
                                                value={camions
                                                    .map((camion) => ({
                                                        value: camion.id,
                                                        label: `${camion.libelle}`,
                                                    }))
                                                    .find((option) => option.value === detail.camion_id)} // set selected option
                                                onChange={function (option) {
                                                    let allDetail = [...dataLocation.details]
                                                    allDetail[index].camion_id = option.value
                                                    setDataLocation({ ...dataLocation, details: allDetail })
                                                }}
                                            />
                                        </div>
                                        <div className="remove-btn">
                                            <button className="btn btn-sm shadow btn-danger"
                                                onClick={(e) => removeDetail(e, index)}> <CIcon icon={cilCut} /> </button>
                                        </div>
                                    </div>
                                ))}
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