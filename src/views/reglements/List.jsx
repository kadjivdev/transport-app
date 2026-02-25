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

    // verification de permission
    const checkPermission = (name) => {
        return currentUser?.permissions?.some(per => per.name == name);
    }

    const [modalUpdateVisible, setModalUpdateVisible] = useState(false);

    const [locations, setLocations] = useState([]);
    const [reglements, setReglements] = useState([]);
    const [currentReglement, setCurrentReglement] = useState({
        location_id: "",
        montant: "",
        preuve: "",
        commentaire: "",
    });

    // 
    const [dataReglement, setDataReglement] = useState({
        location_id: "",
        montant: "",
        preuve: "",
        commentaire: "",
    });
    const [errors, setErrors] = useState({
        location_id: "",
        montant: "",
        preuve: "",
        commentaire: "",
    });

    // les locations
    const getLocations = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allLocation)

            // juste les reglement déjà validés
            setLocations(response?.data?.map((reglement) => reglement.validatedAt!=null) || []);

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


    // les reglements
    const getReglements = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allReglement)

            setReglements(response?.data || []);

            console.log("Les reglements :", response?.data)

            setStatus('success');
            setStatusCode(response.status);
            setMessage('Liste des reglements chargés avec succès!');

            return response.data;
        } catch (error) {
            setStatus('error');
            setStatusCode(error.response?.status);
            setMessage('Erreure lors du chargement des reglements!!');
            return [];
        }
    }, [])

    // initialisation des données
    useEffect(function () {
        // chargements des locations
        getLocations();
        // chargement des reglements
        getReglements();
    }, [])

    // Call DataTable
    useDataTable('myTable', locations);

    // initialisation des datas au changeùent du currentLocation
    useEffect(() => {
        setDataReglement({
            ...dataReglement,
        });

        console.log(`Current dataReglement : ${JSON.stringify(dataReglement)}`)
    }, [currentReglement])

    // modifier un reglement
    const updateReglement = (e, reglement) => {
        e.preventDefault();

        console.log("updating reglement :", reglement)

        setCurrentReglement(reglement)

        setModalTitle(`Modifier la location ## ${location.reference} ##`);
        setModalUpdateVisible(true);

        console.log(`Reglement Current : ${JSON.stringify(currentReglement)}`)
    }

    // submit form
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        console.log('Données du reglement à modifier :', dataReglement);
        setLoading(true);
        setStatus(null);

        try {

            const formData = new FormData();

            formData.append("location_id", dataReglement.location_id);
            formData.append("montant", dataReglement.montant);
            formData.append("commentaire", dataReglement.commentaire);

            // Important : n'envoyer le fichier QUE si c'est un vrai File
            if (dataReglement.preuve instanceof File) {
                formData.append("preuve", dataReglement.preuve);
            }

            formData.append('_method', 'PATCH');

            const response = await axiosInstance.post(
                apiRoutes.updateReglement(currentReglement?.id),
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );

            setErrors({
                location_id: "",
                montant: "",
                preuve: "",
                commentaire: "",
            });

            setStatus('success');
            setMessage(`Le reglement a été modifié avec succès!`);
            setStatusCode(200);

            return navigate("/reglement/list");
        } catch (error) {
            console.log('Erreur lors de la modification du reglement :', error);
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
    const validate = async (e, reglement) => {
        e.preventDefault()

        ConfirmAlert({
            title: `Voulez-vous vraiment valider le reglement ${reglement.reference} ?`,
            confirmButtonText: "Valider",
            denyButtonText: "Annuler",
            next: async () => {
                try {
                    setLoading(true);
                    setStatus(null);
                    const response = await axiosInstance.post(apiRoutes.validateReglement (location.id));

                    console.log('Reglement validé avec succès !');

                    await getReglements(); // actualiser la liste des reglements

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`Le reglement ${reglement.reference} a été validé avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/reglement/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la validation du reglement ${reglement.reference} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    }

    /**
     * Deleting a reglement
     */
    const deleteReglement = async (e, reglement) => {
        e.preventDefault();

        ConfirmAlert({
            title: `Voulez-vous vraiment supprimer le reglement ${reglement.reference} ?`,
            confirmButtonText: "Supprimer",
            denyButtonText: "Annuler",
            next: async () => {
                try {
                    setLoading(true);
                    setStatus(null);
                    const response = await axiosInstance.delete(apiRoutes.deleteReglement(reglement?.id));

                    console.log('Reglement supprimé avec succès !');

                    await getLocations(); // actualiser la liste des reglement

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`Le reglement ${reglement.reference} a été supprimé avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/reglement/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la suppression du reglement ${reglement.reference} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    };

    return (
        <>
            <Card>
                <LinkButton route={"/reglements/create"}>
                    <CIcon className='' icon={cibAddthis} /> Ajouter un reglement
                </LinkButton>

                <table className="table table-striped bg-transparent" id="myTable">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Reference</th>
                            <th scope="col">Location</th>
                            <th scope="col">Montant</th>
                            <th scope="col">Preuve</th>
                            <th scope="col">Inserée le</th>
                            <th scope="col">Inserée par</th>
                            <th scope="col">Validée le</th>
                            <th scope="col">Validée par</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            reglements.length > 0 ? reglements.map((reglement, key) => (
                                <tr key={key} id={`row-${reglement.id}`}>
                                    <th scope="row">{key + 1}</th>
                                    <td>{reglement.reference}</td>
                                    <td>{`${reglement.location?.reference}`}</td>
                                    <td><button className="btn btn-sm shadow text-success" readOnly>{reglement.montant} </button></td>
                                    <td>
                                        {reglement.preuve ? <a href={reglement.preuve} target="_blank" className="btn btn-sm shadow text-dark"><CIcon icon={cilCloudDownload} /></a> : '---'}
                                    </td>
                                    <td>{reglement.createdAt || '---'}</td>
                                    <td>{reglement.createdBy?.name || '---'}</td>
                                    <td>{reglement.validatedAt || '---'}</td>
                                    <td>{reglement.validatedBy?.name || '---'}</td>
                                    <td>
                                        <div className="dropdown">
                                            <a className="btn btn-dark w-100 dropdown-toggle btn-sm" role="button" data-bs-toggle="dropdown">
                                                <CIcon className='me-2' icon={cilDialpad} /> Gérer
                                            </a>
                                            <ul className="dropdown-menu w-100">
                                                {checkPermission("reglement.edit") && !reglement.validatedAt && <li><a className="dropdown-item text-warning" onClick={(e) => updateReglement(e, reglement)} ><CIcon className='me-2' icon={cilPencil} /> Modifier</a></li>}
                                                {checkPermission("reglement.validate") && !reglement.validatedAt && <li><a className="dropdown-item text-success" onClick={(e) => validate(e, reglement)} ><CIcon className='me-2' icon={cilCheckCircle} /> Valider</a></li>}
                                                {checkPermission("reglement.delete") && <li><a className="dropdown-item text-danger" onClick={(e) => deleteReglement(e, reglement)}><CIcon className='me-2' icon={cilTrash} /> Supprimer</a></li>}
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="10" className="text-center">Aucun reglement n'a été trouvé</td></tr>
                        }
                    </tbody>
                </table>

                {/* modification d'une location */}
                <CModal
                    visible={modalUpdateVisible}
                    onClose={() => setModalUpdateVisible(false)}
                    aria-labelledby="LiveDemoExampleLabel"
                >
                    <form onSubmit={(e) => handleUpdateSubmit(e)} className="p-3">
                        <h4 className="">{modalTitle}</h4>
                        {/*  */}
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