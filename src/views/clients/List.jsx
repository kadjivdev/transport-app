import { cibAddthis, cilCheckCircle, cilDelete, cilDialpad, cilLink, cilPencil, cilTrash } from "@coreui/icons";
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

const List = () => {
    const { setStatus, setLoading, setMessage, setStatusCode, modalVisible, setModalVisible, modalTitle, setModalTitle, setModalBody } = useApp();

    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem("user") || "[]");

    // verification de permission
    const checkPermission = (name) => {
        return currentUser?.permissions?.some(per => per.name == name);
    }

    const submitFunction = useRef(() => { });
    const [clients, setClients] = useState([]);
    const [currentClient, setCurrentClient] = useState({});
    const [actionText, setActionText] = useState("Enregistrer");

    // 
    const [dataClient, setDataClient] = useState({ nom: currentClient?.nom, prenom: currentClient?.prenom, phone: currentClient?.phone, ifu: currentClient?.ifu });
    const [errors, setErrors] = useState({ nom: '', prenom: '', phone: '', ifu: '' });

    const getClients = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allClient)

            setClients(response?.data);

            setStatus('success');
            setStatusCode(response.status);
            setMessage('Liste des clients chargée avec succès!');

            return response.data;
        } catch (error) {
            setStatus('error');
            setStatusCode(error.response?.status);
            setMessage('Erreure lors du chargement des clients!!');
            return [];
        }
    }, [])

    useEffect(() => {
        setDataClient({
            nom: currentClient.nom || "",
            prenom: currentClient.prenom || "",
            phone: currentClient.phone || "",
            ifu: currentClient.ifu || ""
        });

        console.log("Client data : ", dataClient)
    }, [currentClient]);

    // Call DataTable
    useDataTable('myTable', clients);

    useEffect(function () {
        // chargement des clients
        getClients()
    }, [])

    /**
     * Modification d'un client
     */
    const handleUpdateSubmit = async (e) => {
        e.preventDefault()

        setLoading(true);
        setStatus(null);

        console.log("Current client  called in handleUpdateSubmit:", currentClient)

        try {
            const response = await axiosInstance.put(apiRoutes.updateClient(currentClient?.id), dataClient);

            setErrors({ nom: '', prenom: '', phone: '', ifu: '' });

            // actualiser la liste des clients
            getClients();

            setModalVisible(false);
            setStatus('success');
            setMessage(`Le client ${currentClient.current?.nom || currentClient?.prenom} a été modifié avec succès!`);
            setStatusCode(response.status);

            return navigate("/clients/list");
        } catch (error) {

            setLoading(false);
            setStatus('error');
            setStatusCode(error.response?.status);

            let errorMessage = '';
            if (error.response?.status === 422) {
                errorMessage = `Erreure de validation lors de la modification du client ${currentClient?.nom || currentClient?.prenom} : ${JSON.stringify(error.response?.data?.errors)}`;
            } else {
                errorMessage = `Erreure lors de la créaction du client ${currentClient?.nom || currentClient?.prenom} : ${JSON.stringify(error.response?.data?.errors)}`;
            }

            setMessage(errorMessage);
            setErrors(error.response?.data?.errors || { nom: '', prenom: '', phone: '', ifu: '' });
        }
    }

    // handle change
    const handleChange = (e) => {
        const { name, value } = e.target;

        setDataClient(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // modifier un client
    const updateClient = (e, client) => {
        e.preventDefault();

        setCurrentClient(client)

        console.log("currentClient current :", currentClient)
        console.log("Data client from updateClient :", dataClient)

        setModalVisible(true);
        setModalTitle(`Modifier le client ## ${client.nom || client.prenom} ##`);

        console.log(`Data's client : ${JSON.stringify(dataClient)}`)

        // preciser le text du bouton d'action du modal
        setActionText("Modifier le client")
    }

    /**
     * Deleting a client
     */
    const deleteClient = async (e, client) => {
        e.preventDefault();

        ConfirmAlert({
            title: `Voulez-vous vraiment supprimer le client ${client.nom || client.prenom} ?`,
            confirmButtonText: "Supprimer",
            denyButtonText: "Annuler",
            next: async () => {
                try {
                    setLoading(true);
                    setStatus(null);
                    const response = await axiosInstance.delete(apiRoutes.deleteClient(client?.id));

                    console.log('Client supprimé avec succès !');

                    await getClients(); // actualiser la liste des clients

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`Le client ${client.nom || client.prenom} a été supprimé avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/clients/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la suppression du client ${client.nom || client.prenom} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    };

    return (
        <>
            <Card>
                <LinkButton route={"/clients/create"}>
                    <CIcon className='' icon={cibAddthis} /> Ajouter un client
                </LinkButton>

                <table className="table table-striped bg-transparent" id="myTable">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Nom</th>
                            <th scope="col">Prénom</th>
                            <th scope="col">Phone</th>
                            <th scope="col">Ifu</th>
                            <th scope="col">Crée le</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            clients.length > 0 ? clients.map((client, key) => (
                                <tr key={key} id={`row-${client.id}`}>
                                    <th scope="row">{key + 1}</th>
                                    <td>{client.nom}</td>
                                    <td>{client.prenom}</td>
                                    <td>{client.phone}</td>
                                    <td>{client.ifu}</td>
                                    <td>{client.createdAt}</td>
                                    <td>
                                        <div className="dropdown">
                                            <a className="btn btn-dark w-100 dropdown-toggle btn-sm" role="button" data-bs-toggle="dropdown"
                                                disabled={client.id == 1}>
                                                <CIcon className='me-2' icon={cilDialpad} /> Gérer
                                            </a>
                                            <ul className="dropdown-menu w-100">
                                                {checkPermission("client.edit") && <li><a className="dropdown-item text-warning" onClick={(e) => updateClient(e, client)} ><CIcon className='me-2' icon={cilPencil} /> Modifier</a></li>}
                                                {checkPermission("client.delete") && <li><a className="dropdown-item text-danger" onClick={(e) => deleteClient(e, client)}><CIcon className='me-2' icon={cilTrash} /> Supprimer</a></li>}
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="7" className="text-center">Aucun client n'a été trouvé</td></tr>
                        }
                    </tbody>
                </table>

                {/*  */}
                {/* <Modal
                    visible={modalVisible}
                    actionText={actionText}
                    handleSubmit={submitFunction.current}></Modal> */}

                <CModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    aria-labelledby="LiveDemoExampleLabel"
                >
                    <form onSubmit={(e) => handleUpdateSubmit(e)}>
                        <CModalHeader>
                            <CModalTitle >{modalTitle || 'Modal par défaut'}</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <div className="mb-3">
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="nom"
                                        text="Nom"
                                        required={true} />
                                    <input type="text"
                                        name="nom"
                                        value={dataClient?.nom}
                                        className="form-control"
                                        id="nom" placeholder={`Ex: ${currentClient?.nom}`}
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
                                        value={dataClient?.prenom}
                                        className="form-control"
                                        id="prenom" placeholder={`Ex: ${dataClient?.prenom}`}
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.prenom && <span className="text-danger">{errors?.prenom}</span>}
                                </div>
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="phone"
                                        text="Télephone"
                                        required={true} />
                                    <input type="tel" name="phone"
                                        value={dataClient.phone}
                                        className="form-control"
                                        id="phone" placeholder={`Ex: ${dataClient?.phone}`}
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.phone && <span className="text-danger">{errors?.phone}</span>}
                                </div>
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="ifu"
                                        text="IFU"
                                        required={true} />
                                    <input type="text" name="ifu"
                                        value={dataClient.ifu}
                                        className="form-control" id="ifu" placeholder={`Ex: ${currentClient?.ifu}`}
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.ifu && <span className="text-danger">{errors?.ifu}</span>}
                                </div>
                            </div>
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="warning" onClick={() => setModalVisible(false)}>
                                <CIcon icon={cilDelete} /> Fermer
                            </CButton>
                            <CButton color="dark" type="submit"> <CIcon icon={cilCheckCircle} /> {actionText}</CButton>
                        </CModalFooter>
                    </form>
                </CModal>
            </Card>
        </>
    )
}

export default List;