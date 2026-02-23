import { cibAddthis, cilCheckCircle, cilDelete, cilDialpad, cilPencil, cilTrash } from "@coreui/icons";
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'

import CIcon from "@coreui/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Card from "src/components/Card";
import LinkButton from "src/components/LinkButton";
import useDataTable from "src/hooks/useDataTable";
import axiosInstance from "../../../api/axiosInstance";
import apiRoutes from "../../../api/routes"
import { useApp } from "../../../AppContext";
import { Modal } from "../../../components/Modal";
import InputLabel from "src/components/forms/InputLabel";
import { useNavigate } from "react-router-dom";
import ConfirmAlert from "../../../hooks/ConfirmAlert";

const List = () => {
    const { setStatus, setLoading, setMessage, setStatusCode, modalVisible, setModalVisible, modalTitle, setModalTitle } = useApp();

    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem("user") || "[]");

    // verification de permission
    const checkPermission = (name) => {
        return currentUser?.permissions?.some(per => per.name == name);
    }

    const submitFunction = useRef(() => { });
    const [types, setTypes] = useState([]);
    const [currentType, setCurrentType] = useState({});
    const [actionText, setActionText] = useState("Enregistrer");

    // 
    const [dataType, setDataType] = useState({ libelle: currentType?.libelle, description: currentType?.description });
    const [errors, setErrors] = useState({ libelle: '', description: '' });

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

    useEffect(() => {
        setDataType({
            libelle: currentType.libelle || "",
            description: currentType.description || "",
        });

        console.log("Type", dataType)
    }, [currentType]);

    // Call DataTable
    useDataTable('myTable', types);

    useEffect(function () {
        // chargement des types
        getTypes()
    }, [])

    /**
     * Modification d'un type
     */
    const handleUpdateSubmit = async (e) => {
        e.preventDefault()

        setLoading(true);
        setStatus(null);

        console.log("Current type  called in handleUpdateSubmit:", currentType)

        try {
            const response = await axiosInstance.put(apiRoutes.updateLocationType(currentType?.id), dataType);

            setErrors({ libelle: '', description: '' });

            // actualiser la liste des types
            getTypes();

            setModalVisible(false);
            setStatus('success');
            setMessage(`Le client ${currentType.current?.libelle || currentType?.description} a été modifié avec succès!`);
            setStatusCode(response.status);

            return navigate("/locations/types/list");
        } catch (error) {

            setLoading(false);
            setStatus('error');
            setStatusCode(error.response?.status);

            console.log("Error :::", error)

            let errorMessage = '';
            if (error.response?.status === 422) {
                errorMessage = `Erreure de validation lors de la modification du type ${currentType?.libelle || currentType?.description} : ${JSON.stringify(error.response?.data?.errors)}`;
            } else {
                errorMessage = `Erreure lors de la créaction du type ${currentType?.libelle || currentType?.description} `;
            }

            setMessage(errorMessage);
            setErrors(error.response?.data?.errors || { libelle: '', description: '' });
        }
    }

    // handle change
    const handleChange = (e) => {
        const { name, value } = e.target;

        setDataType(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // modifier un client
    const updateLocationType = (e, type) => {
        e.preventDefault();

        setCurrentType(type)

        console.log("Comming type :", type)
        console.log("currentType current :", currentType)
        console.log("Data type from updateLocationType :", dataType)

        setModalVisible(true);
        setModalTitle(`Modifier le type ## ${type.libelle || type.description} ##`);

        console.log(`Type's data : ${JSON.stringify(dataType)}`)

        // preciser le text du bouton d'action du modal
        setActionText("Modifier le type")
    }

    /**
     * Deleting a client
     */
    const deleteLocationType = async (e, type) => {
        e.preventDefault();

        ConfirmAlert({
            title: `Voulez-vous vraiment supprimer le camion ${type.libelle || type.description} ?`,
            confirmButtonText: "Supprimer",
            denyButtonText: "Annuler",
            next: async () => {
                try {
                    setLoading(true);
                    setStatus(null);
                    const response = await axiosInstance.delete(apiRoutes.deleteLocationType(type?.id));

                    console.log('Type supprimé avec succès !');

                    await getTypes(); // actualiser la liste des types

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`Le type ${type.libelle || type.description} a été supprimé avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/locations/types/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la suppression du type ${type.libelle || type.description} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    };

    return (
        <>
            <Card>
                <LinkButton route={"/locations/types/create"}>
                    <CIcon className='' icon={cibAddthis} /> Ajouter un type de location
                </LinkButton>

                <table className="table table-striped bg-transparent" id="myTable">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Libelle</th>
                            <th scope="col">Prix</th>
                            <th scope="col">description</th>
                            <th scope="col">Crée le</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            types.length > 0 ? types.map((type, key) => (
                                <tr key={key} id={`row-${type.id}`}>
                                    <th scope="row">{key + 1}</th>
                                    <td>{type.libelle}</td>
                                    <td>{type.price}</td>
                                    <td>{type.description}</td>
                                    <td>{type.created_at || '---'}</td>
                                    <td>
                                        <div className="dropdown">
                                            <a className="btn btn-dark w-100 dropdown-toggle btn-sm" role="button" data-bs-toggle="dropdown">
                                                <CIcon className='me-2' icon={cilDialpad} /> Gérer
                                            </a>
                                            <ul className="dropdown-menu w-100">
                                                {checkPermission("location.edit") && <li><a className="dropdown-item text-warning" onClick={(e) => updateLocationType(e, type)} ><CIcon className='me-2' icon={cilPencil} /> Modifier</a></li>}
                                                {checkPermission("location.delete") && <li><a className="dropdown-item text-danger" onClick={(e) => deleteLocationType(e, type)}><CIcon className='me-2' icon={cilTrash} /> Supprimer</a></li>}
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="6" className="text-center">Aucun camion n'a été trouvé</td></tr>
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
                                        value={dataType?.libelle}
                                        className="form-control"
                                        id="libelle" placeholder={`Ex: ${currentType?.libelle}`}
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.libelle && <span className="text-danger">{errors?.libelle}</span>}
                                </div>
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="price"
                                        text="Prix"
                                        required={true} />
                                    <input type="number"
                                        name="price"
                                        value={dataType?.price}
                                        className="form-control"
                                        id="price" placeholder={`Ex: ${currentType?.price}`}
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors?.price && <span className="text-danger">{errors?.price}</span>}
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
                                        id="description" placeholder={`Ex: ${dataType?.description}`}
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
                    </form>
                </CModal>
            </Card>
        </>
    )
}

export default List;