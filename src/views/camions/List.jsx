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
    const { setStatus, setLoading, setMessage, setStatusCode, modalVisible, setModalVisible, modalTitle, setModalTitle } = useApp();

    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem("user") || "[]");

    // verification de permission
    const checkPermission = (name) => {
        return currentUser?.permissions?.some(per => per.name == name);
    }

    const submitFunction = useRef(() => { });
    const [camions, setCamions] = useState([]);
    const [currentCamion, setCurrentCamion] = useState({});
    const [actionText, setActionText] = useState("Enregistrer");

    // 
    const [dataCamion, setDataCamion] = useState({ libelle: currentCamion?.libelle, immatriculation: currentCamion?.immatriculation});
    const [errors, setErrors] = useState({ libelle: '', immatriculation: '' });

    const getCamions = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allCamion)

            setCamions(response?.data);

            console.log("Les camions :",response?.data)

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

    useEffect(() => {
        setDataCamion({
            libelle: currentCamion.libelle || "",
            immatriculation: currentCamion.immatriculation || "",
        });

        console.log("Camion", dataCamion)
    }, [currentCamion]);

    // Call DataTable
    useDataTable('myTable', camions);

    useEffect(function () {
        // chargement des camions
        getCamions()
    }, [])

    /**
     * Modification d'un client
     */
    const handleUpdateSubmit = async (e) => {
        e.preventDefault()

        setLoading(true);
        setStatus(null);

        console.log("Current camion  called in handleUpdateSubmit:", currentCamion)

        try {
            const response = await axiosInstance.put(apiRoutes.updateCamion(currentCamion?.id), dataCamion);

            setErrors({ libelle: '', immatriculation: '' });

            // actualiser la liste des camions
            getCamions();

            setModalVisible(false);
            setStatus('success');
            setMessage(`Le client ${currentCamion.current?.nom || currentCamion?.prenom} a été modifié avec succès!`);
            setStatusCode(response.status);

            return navigate("/camions/list");
        } catch (error) {

            setLoading(false);
            setStatus('error');
            setStatusCode(error.response?.status);

            let errorMessage = '';
            if (error.response?.status === 422) {
                errorMessage = `Erreure de validation lors de la modification du camion ${currentCamion?.nom || currentCamion?.prenom} : ${JSON.stringify(error.response?.data?.errors)}`;
            } else {
                errorMessage = `Erreure lors de la créaction du client ${currentCamion?.libelle || currentCamion?.immatriculation} : ${JSON.stringify(error.response?.data?.errors)}`;
            }

            setMessage(errorMessage);
            setErrors(error.response?.data?.errors || { libelle: '', immatriculation: '' });
        }
    }

    // handle change
    const handleChange = (e) => {
        const { name, value } = e.target;

        setDataCamion(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // modifier un client
    const updateCamion = (e, camion) => {
        e.preventDefault();

        setCurrentCamion(camion)

        console.log("Comming camion :", camion)
        console.log("currentCamion current :", currentCamion)
        console.log("Data camion from updateCamion :", dataCamion)

        setModalVisible(true);
        setModalTitle(`Modifier le Camion ## ${camion.libelle || camion.immatriculation} ##`);

        console.log(`Camion's data : ${JSON.stringify(dataCamion)}`)

        // preciser le text du bouton d'action du modal
        setActionText("Modifier le camion")
    }

    /**
     * Deleting a client
     */
    const deleteCamion = async (e, camion) => {
        e.preventDefault();

        ConfirmAlert({
            title: `Voulez-vous vraiment supprimer le camion ${camion.libelle || camion.immatriculation} ?`,
            confirmButtonText: "Supprimer",
            denyButtonText: "Annuler",
            next: async () => {
                try {
                    setLoading(true);
                    setStatus(null);
                    const response = await axiosInstance.delete(apiRoutes.deleteCamion(camion?.id));

                    console.log('Camion supprimé avec succès !');

                    await getCamions(); // actualiser la liste des camions

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`Le camion ${camion.libelle || camion.immatriculation} a été supprimé avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/camions/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la suppression du camion ${camion.libelle || camion.immatriculation} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    };

    return (
        <>
            <Card>
                <LinkButton route={"/camions/create"}>
                    <CIcon className='' icon={cibAddthis} /> Ajouter un camion
                </LinkButton>

                <table className="table table-striped bg-transparent" id="myTable">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Libelle</th>
                            <th scope="col">Immatriculation</th>
                            <th scope="col">Crée le</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            camions.length > 0 ? camions.map((camion, key) => (
                                <tr key={key} id={`row-${camion.id}`}>
                                    <th scope="row">{key + 1}</th>
                                    <td>{camion.libelle}</td>
                                    <td>{camion.immatriculation}</td>
                                    <td>{camion.createdAt}</td>
                                    <td>
                                        <div className="dropdown">
                                            <a className="btn btn-dark w-100 dropdown-toggle btn-sm" role="button" data-bs-toggle="dropdown">
                                                <CIcon className='me-2' icon={cilDialpad} /> Gérer
                                            </a>
                                            <ul className="dropdown-menu w-100">
                                                {checkPermission("camion.edit") && <li><a className="dropdown-item text-warning" onClick={(e) => updateCamion(e, camion)} ><CIcon className='me-2' icon={cilPencil} /> Modifier</a></li>}
                                                {checkPermission("camion.delete") && <li><a className="dropdown-item text-danger" onClick={(e) => deleteCamion(e, camion)}><CIcon className='me-2' icon={cilTrash} /> Supprimer</a></li>}
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="5" className="text-center">Aucun camion n'a été trouvé</td></tr>
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
                                        htmlFor="libelle"
                                        text="Libellé"
                                        required={true} />
                                    <input type="text"
                                        name="libelle"
                                        value={dataCamion?.libelle}
                                        className="form-control"
                                        id="libelle" placeholder={`Ex: ${currentCamion?.libelle}`}
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
                                        id="immatriculation" placeholder={`Ex: ${dataCamion?.immatriculation}`}
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.immatriculation && <span className="text-danger">{errors?.immatriculation}</span>}
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