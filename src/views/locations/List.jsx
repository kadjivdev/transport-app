import { cibAddthis, cilCheckCircle, cilCloudDownload, cilCut, cilDelete, cilDialpad, cilFile, cilList, cilPencil, cilTrash } from "@coreui/icons";
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

const List = () => {
    const { setStatus, setLoading, setMessage, setStatusCode, modalVisible, setModalVisible, modalTitle, setModalTitle, modalBody, setModalBody } = useApp();

    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem("user") || "[]");

    // verification de permission
    const checkPermission = (name) => {
        return currentUser?.permissions?.some(per => per.name == name);
    }

    const submitFunction = useRef(() => { });
    const [modalUpdateVisible, setModalUpdateVisible] = useState(false);

    const [clients, setClients] = useState([]);
    const [types, setTypes] = useState([]);
    const [locations, setLocations] = useState([]);
    const [currentLocation, setCurrentLocation] = useState({});
    const [actionText, setActionText] = useState("Enregistrer");

    // 
    const [dataLocation, setDataLocation] = useState({ client_id: '', location_type_id: '', type_location_price: '', date_location: '', contrat: '', details: [] });
    const [errors, setErrors] = useState({ client_id: '', location_type_id: '', type_location_price: '', date_location: '', contrat: '', details: [] });

    // les clients
    const getClients = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allClient)

            setClients(response?.data);

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

            setTypes(response?.data);

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

    // Call DataTable
    useDataTable('myTable', locations);

    useEffect(function () {
        // chargements des clients
        getClients();
        // chargement des types
        getTypes();
        // chargement des locations
        getLocations();
    }, [])

    useEffect(() => {
        setDataLocation(
            {
                client_id: '',
                location_type_id: '',
                type_location_price: '',
                date_location: '',
                contrat: '',
                details: currentLocation.details
            });

        console.log("Location", dataLocation)
    }, [currentLocation]);

    /**
     * Modification d'une location
     */
    const handleUpdateSubmit = async (e) => {
        e.preventDefault()

        setLoading(true);
        setStatus(null);

        console.log("Current location  called in handleUpdateSubmit:", currentLocation)

        try {
            const response = await axiosInstance.put(apiRoutes.updateLocation(currentLocation?.id), dataLocation);

            setErrors({
                client_id: '',
                location_type_id: '',
                type_location_price: '',
                date_location: '',
                contrat: '',
                details: ''
            });

            // actualiser la liste des types
            get();

            setModalVisible(false);
            setStatus('success');
            setMessage(`La location ${currentLocation?.reference} a été modifiée avec succès!`);
            setStatusCode(response.status);

            return navigate("/locations/list");
        } catch (error) {
            setLoading(false);
            setStatus('error');
            setStatusCode(error.response?.status);

            console.log("Error :::", error)

            let errorMessage = '';
            if (error.response?.status === 422) {
                errorMessage = `Erreure de validation lors de la modification de la location ${currentLocation?.reference} : ${JSON.stringify(error.response?.data?.errors)}`;
            } else {
                errorMessage = `Erreure lors de la créaction du type ${currentLocation?.reference} `;
            }

            setMessage(errorMessage);
            setErrors(error.response?.data?.errors || {
                client_id: '',
                location_type_id: '',
                type_location_price: '',
                date_location: '',
                contrat: '',
                details: ''
            });
        }
    }

    // handle detail show
    const showDetail = (e, location) => {
        setCurrentLocation(location)

        setModalTitle(`Détails de la location ##${location.reference}`)

        setModalBody(`
            ${location.details?.map((detail, index) => (
            <div className="align-items-center d-flex justify-content-between"
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
            
            `)

        setModalVisible(true)
    };

    // modifier un client
    const updateLocation = (e, location) => {
        e.preventDefault();

        setCurrentLocation(location)

        console.log("Comming location :", location)
        console.log("currentLocation  :", currentLocation)
        console.log("Data type from updateLocation :", dataLocation)

        setModalVisible(true);
        setModalTitle(`Modifier la location ## ${location.reference} ##`);

        console.log(`Location's data : ${JSON.stringify(dataLocation)}`)

        // preciser le text du bouton d'action du modal
        setActionText("Modifier la location")
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
                    const response = await axiosInstance.delete(apiRoutes.deleteLocationType(location?.id));

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
                            <th scope="col">Reference</th>
                            <th scope="col">Client</th>
                            <th scope="col">Type</th>
                            <th scope="col">Date</th>
                            <th scope="col">Details</th>
                            <th scope="col">Contrat</th>
                            <th scope="col">Inserée le</th>
                            <th scope="col">Inserée par</th>
                            <th scope="col">Validée le</th>
                            <th scope="col">Validée par</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            locations.length > 0 ? locations.map((location, key) => (
                                <tr key={key} id={`row-${location.id}`}>
                                    <th scope="row">{key + 1}</th>
                                    <td>{location.reference}</td>
                                    <td>{`${location.client?.nom} - ${location.client?.prenom}`}</td>
                                    <td>{location.type?.libelle || '---'}</td>
                                    <td>{location.date_location || '---'}</td>
                                    <td><button onClick={(e) => showDetail(e, location)} className="btn btn-sm shadow text-dark"><CIcon icon={cilList} /></button></td>
                                    <td>
                                        {location.contrat ? <a href={location.contrat} target="_blank" className="btn btn-sm shadow text-dark"><CIcon icon={cilCloudDownload} /></a> : '---'}

                                    </td>
                                    <td>{location.createdAt || '---'}</td>
                                    <td>{location.createdBy?.name || '---'}</td>
                                    <td>{location.validatedAt || '---'}</td>
                                    <td>{location.validatedBy?.name || '---'}</td>
                                    <td>
                                        <div className="dropdown">
                                            <a className="btn btn-dark w-100 dropdown-toggle btn-sm" role="button" data-bs-toggle="dropdown">
                                                <CIcon className='me-2' icon={cilDialpad} /> Gérer
                                            </a>
                                            <ul className="dropdown-menu w-100">
                                                {checkPermission("location.edit") && <li><a className="dropdown-item text-warning" onClick={(e) => updateLocation(e, location)} ><CIcon className='me-2' icon={cilPencil} /> Modifier</a></li>}
                                                {checkPermission("location.delete") && <li><a className="dropdown-item text-danger" onClick={(e) => deleteLocation(e, location)}><CIcon className='me-2' icon={cilTrash} /> Supprimer</a></li>}
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="12" className="text-center">Aucune location n'a été trouvée</td></tr>
                        }
                    </tbody>
                </table>

                {/*  */}
                <Modal
                    visible={modalVisible}
                    actionText={actionText}
                    handleSubmit={submitFunction.current}></Modal>

                <CModal
                    visible={modalUpdateVisible}
                    onClose={() => setModalUpdateVisible(false)}
                    aria-labelledby="LiveDemoExampleLabel"
                >
                    {/* <form onSubmit={(e) => handleUpdateSubmit(e)}>
                        <CModalHeader>
                            <CModalTitle >{modalTitle || 'Modal par défaut'}</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <div className="mb-3">
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="libelle"
                                        text="Libellé"
                                        required={true} />
                                    <input type="text"
                                        name="libelle"
                                        value={dataLocation?.libelle}
                                        className="form-control"
                                        id="libelle" placeholder={`Ex: ${currentType?.libelle}`}
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.libelle && <span className="text-danger">{errors?.libelle}</span>}
                                </div>
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="description"
                                        text="description"
                                        required={true} />
                                    <input type="text"
                                        name="description"
                                        value={dataLocation?.description}
                                        className="form-control"
                                        id="description" placeholder={`Ex: ${dataLocation?.description}`}
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.description && <span className="text-danger">{errors?.description}</span>}
                                </div>
                            </div>
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="warning" onClick={() => setModalVisible(false)}>
                                <CIcon icon={cilDelete} /> Fermer
                            </CButton>
                            <CButton color="dark" type="submit"> <CIcon icon={cilCheckCircle} /> {actionText}</CButton>
                        </CModalFooter>
                    </form> */}
                </CModal>
            </Card>
        </>
    )
}

export default List;