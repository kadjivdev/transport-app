import { cibAddthis, cilCheckCircle, cilCloudDownload, cilCut, cilDelete, cilDialpad, cilFile, cilList, cilPencil, cilSend, cilTrash } from "@coreui/icons";
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'

import CIcon from "@coreui/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Card from "src/components/Card";
import LinkButton from "src/components/LinkButton";
import useDataTable from "src/hooks/useDataTable";
import axiosInstance from "../../api/axiosInstance";
import apiRoutes from "../../api/routes"
import { useApp } from "../../AppContext";
import { Modal } from "../../components/Modal";
import InputLabel from "src/components/forms/InputLabel";
import { useNavigate } from "react-router-dom";
import ConfirmAlert from "../../hooks/ConfirmAlert";
import Select from 'react-select'
import CustomButton from "src/components/CustomButton";


const List = () => {
    const { setStatus, setLoading, setMessage, setStatusCode, modalVisible, setModalVisible, modalTitle, setModalTitle, modalBody, setModalBody } = useApp();

    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem("user") || "[]");

    const formatToISO = (date) => {
        if (!date) return "";
        const [month, day, year] = date.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    };

    // verification de permission
    const checkPermission = (name) => {
        return currentUser?.permissions?.some(per => per.name == name);
    }

    const submitFunction = useRef(() => { });
    const [modalUpdateVisible, setModalUpdateVisible] = useState(false);

    const [clients, setClients] = useState([]);
    const [types, setTypes] = useState([]);
    const [locations, setLocations] = useState([]);
    const [camions, setCamions] = useState([]);
    const [currentLocation, setCurrentLocation] = useState({
        client_id: '',
        location_type_id: '',
        date: '',
        date_location: '',
        contrat: '',
        details: [{
            price: '',
            camion_id: ''
        },]
    });

    // 
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

    // les locations
    const getLocations = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allLocation)

            setLocations(response?.data);

            console.log("Les locations :", response?.data)

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

    // initialisation des données
    useEffect(function () {
        // chargements des clients
        getClients();
        // chargement des types
        getTypes();
        // chargement des camions
        getCamions();
        //chargmeents des locations
        getLocations();
    }, [])

    // Call DataTable
    useDataTable('myTable', locations);

    // initialisation des datas au changeùent du currentLocation
    useEffect(() => {
        setDataLocation({
            ...dataLocation,
            date_location: currentLocation?.date.split("T")[0],
            details: currentLocation?.details || []
        });

        console.log(`Current dataLocation : ${JSON.stringify(dataLocation)}`)
    }, [currentLocation])

    // handle detail show
    const showDetail = (e, location) => {
        setCurrentLocation(location)

        setModalTitle(`Détails de la location ##${location.reference}`)

        setModalVisible(true)
    };

    // modifier une location
    const updateLocation = (e, location) => {
        e.preventDefault();

        console.log("updating location :", location)

        setCurrentLocation(location)

        setModalTitle(`Modifier la location ## ${location.reference} ##`);
        setModalUpdateVisible(true);

        console.log(`Location Current : ${JSON.stringify(currentLocation)}`)
    }

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
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        console.log('Données du location à modifier :', dataLocation);
        setLoading(true);
        setStatus(null);

        try {
            const formData = new FormData();

            formData.append("client_id", dataLocation.client_id);
            formData.append("location_type_id", dataLocation.location_type_id);
            formData.append("date_location", dataLocation.date_location);

            // Important : n'envoyer le fichier QUE si c'est un vrai File
            if (dataLocation.contrat instanceof File) {
                formData.append("contrat", dataLocation.contrat);
            }

            // si tu as un tableau details
            formData.append("details", JSON.stringify(dataLocation.details));

            formData.append('_method', 'PATCH');

            const response = await axiosInstance.post(
                apiRoutes.updateLocation(currentLocation?.id),
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );

            console.log('Réponse du serveur après création de location :', response.data);

            setErrors({
                client_id: '',
                location_type_id: '',
                date_location: '',
                contrat: '',
                details: ''
            });

            setStatus('success');
            setMessage(`La location a été modifiée avec succès!`);
            setStatusCode(200);

            return navigate("/locations/list");
        } catch (error) {
            console.log('Erreur lors de la modification de la location :', error);
            let errMessage = '';

            if (error.response?.status === 422) {
                // Erreurs de validation
                errMessage = `Des erreurs de validation sont survenues. Veuillez vérifier les champs `;
            } else {
                errMessage = `Une erreur inattendue est survenue. Veuillez réessayer. (${error.response?.data?.error || 'Erreure survenue'})`;
            }

            console.log(errMessage)
            setLoading(false);
            setStatus('error');
            setMessage(errMessage);
            setStatusCode(error.response?.status);
            setErrors(error.response?.data?.errors);
        }
    }

    // valider un elocation
    const validate = async (e, location) => {
        e.preventDefault()

        ConfirmAlert({
            title: `Voulez-vous vraiment valider la location ${location.reference} ?`,
            confirmButtonText: "Valider",
            denyButtonText: "Annuler",
            next: async () => {
                try {
                    setLoading(true);
                    setStatus(null);
                    const response = await axiosInstance.post(apiRoutes.validateLocation(location.id));

                    console.log('Location validée avec succès !');

                    await getLocations(); // actualiser la liste des locations

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`La location ${location.reference} a été validée avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/locations/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la validation de la location ${location.reference} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    }

    /**
     * Deleting a location
     */
    const deleteLocation = async (e, location) => {
        e.preventDefault();

        ConfirmAlert({
            title: `Voulez-vous vraiment supprimer la location ${location.reference} ?`,
            confirmButtonText: "Supprimer",
            denyButtonText: "Annuler",
            next: async () => {
                try {
                    setLoading(true);
                    setStatus(null);
                    const response = await axiosInstance.delete(apiRoutes.deleteLocation(location?.id));

                    console.log('Location supprimée avec succès !');

                    await getLocations(); // actualiser la liste des locations

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`La location ${location.reference} a été supprimée avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/locations/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la suppression de la location ${location.reference} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    };

    return (
        <>
            <Card>
                <LinkButton route={"/locations/create"}>
                    <CIcon className='' icon={cibAddthis} /> Ajouter une location
                </LinkButton>

                <table className="table table-striped bg-transparent" id="myTable">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Action</th>
                            <th scope="col">Reference</th>
                            <th scope="col">Client</th>
                            <th scope="col">Type</th>
                            <th scope="col">Date</th>
                            <th scope="col">Details</th>
                            <th scope="col">Montant</th>
                            <th scope="col">Réglé</th>
                            <th scope="col">Reste</th>
                            <th scope="col">Contrat</th>
                            <th scope="col">Inserée le</th>
                            <th scope="col">Inserée par</th>
                            <th scope="col">Validée le</th>
                            <th scope="col">Validée par</th>
                            <th scope="col">Commentaire</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            locations.length > 0 ? locations.map((location, key) => (
                                <tr key={key} id={`row-${location.id}`}>
                                    <th scope="row">{key + 1}</th>
                                    <td>
                                        {!location.validatedAt ?
                                            <div className="dropdown">
                                                <a className="btn btn-dark w-100 dropdown-toggle btn-sm" role="button" data-bs-toggle="dropdown">
                                                    <CIcon className='me-2' icon={cilDialpad} /> Gérer
                                                </a>
                                                <ul className="dropdown-menu w-100">
                                                    {checkPermission("location.edit") && !location.validatedAt && <li><a className="dropdown-item text-warning" onClick={(e) => updateLocation(e, location)} ><CIcon className='me-2' icon={cilPencil} /> Modifier</a></li>}
                                                    {checkPermission("location.validate") && !location.validatedAt && <li><a className="dropdown-item text-success" onClick={(e) => validate(e, location)} ><CIcon className='me-2' icon={cilCheckCircle} /> Valider</a></li>}
                                                    {checkPermission("location.delete") && <li><a className="dropdown-item text-danger" onClick={(e) => deleteLocation(e, location)}><CIcon className='me-2' icon={cilTrash} /> Supprimer</a></li>}
                                                </ul>
                                            </div> : '---'}
                                    </td>
                                    <td>{location.reference}</td>
                                    <td>{`${location.client?.nom} - ${location.client?.prenom}`}</td>
                                    <td>{location.type?.libelle || '---'}</td>
                                    <td>{location.date_location || '---'}</td>
                                    <td><button onClick={(e) => showDetail(e, location)} className="btn btn-sm shadow text-dark"><CIcon icon={cilList} /></button></td>
                                    <td><button className="btn btn-sm shadow text-success" readOnly>{location.montant} </button></td>
                                    <td><button className="btn btn-sm shadow text-success" readOnly>{location.regle} </button></td>
                                    <td><button className="btn btn-sm shadow text-danger" readOnly>{location.reste} </button></td>
                                    <td>
                                        {location.contrat ? <a href={location.contrat} target="_blank" className="btn btn-sm shadow text-dark"><CIcon icon={cilCloudDownload} /></a> : '---'}

                                    </td>
                                    <td>{location.createdAt || '---'}</td>
                                    <td>{location.createdBy?.name || '---'}</td>
                                    <td>{location.validatedAt || '---'}</td>
                                    <td>{location.validatedBy?.name || '---'}</td>
                                    <td>
                                        <textarea className="form-control" rows="2" placeholder={location.commentaire || '---'}></textarea>
                                    </td>

                                </tr>
                            )) : <tr><td colSpan="15" className="text-center">Aucune location n'a été trouvée</td></tr>
                        }
                    </tbody>
                </table>

                {/* Detail d'une location */}
                <CModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                >
                    <div className="p-3">
                        <h3 className="">{modalTitle}</h3>
                        {currentLocation.details?.map((detail, index) => (
                            <div className="align-items-center d-flex justify-content-between m-1"
                                key={index}
                            >
                                <div className="">
                                    <input type="number"
                                        className="form-control"
                                        readOnly={true}
                                        value={detail.price} />
                                </div>
                                <div className="">
                                    <input type="text"
                                        className="form-control"
                                        readOnly={true}
                                        value={detail.camion?.libelle} />
                                </div>
                            </div>
                        ))}
                    </div>
                </CModal>

                {/* modification d'une location */}
                <CModal
                    visible={modalUpdateVisible}
                    onClose={() => setModalUpdateVisible(false)}
                    aria-labelledby="LiveDemoExampleLabel"
                >
                    <form onSubmit={(e) => handleUpdateSubmit(e)} className="p-3">
                        <h4 className="">{modalTitle}</h4>
                        <div className="mb-3">
                            <InputLabel
                                htmlFor="client_id"
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
                                value={dataLocation.date_location}
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
                                            placeholder="Ex: 30.000"
                                            value={detail.price}
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
                            <CustomButton newClass={'_btn-dark -w-100'} type="submit"> <CIcon icon={cilPencil} /> Modifier </CustomButton>
                        </div>
                        <br /><br /><br />
                    </form>
                </CModal>
            </Card>
        </>
    )
}

export default List;