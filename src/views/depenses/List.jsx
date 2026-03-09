import { cibAddthis, cilCheckCircle, cilCloudDownload, cilDialpad, cilPencil, cilSend, cilTrash } from "@coreui/icons";
import { CModal } from '@coreui/react'

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
import Swal from "sweetalert2";

const List = () => {
    const { setStatus, setLoading, setMessage, setStatusCode, setModalVisible, modalTitle, setModalTitle } = useApp();

    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem("user") || "[]");

    // verification de permission
    const checkPermission = (name) => {
        return currentUser?.permissions?.some(per => per.name == name);
    }

    const [modalUpdateVisible, setModalUpdateVisible] = useState(false);

    const [locations, setLocations] = useState([]);
    const [depenses, setDepenses] = useState([]);
    const [currentDepense, setCurrentDepense] = useState({
        location_id: "",
        montant: "",
        preuve: "",
        commentaire: "",
    });

    // 
    const [dataDepense, setDataDepense] = useState({
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

            // juste les depense déjà validés & ayant du reste à livrer
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

    // les depenses
    const getDepenses = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allDepense)

            setDepenses(response?.data || []);

            console.log("Les depenses :", response?.data)

            setStatus('success');
            setStatusCode(response.status);
            setMessage('Liste des depenses chargées avec succès!');

            return response.data;
        } catch (error) {
            setStatus('error');
            setStatusCode(error.response?.status);
            setMessage('Erreure lors du chargement des depenses!!');
            return [];
        }
    }, [])

    // initialisation des données
    useEffect(function () {
        // chargements des locations
        getLocations();
        // chargement des depenses
        getDepenses();
    }, [])

    // Call DataTable
    useDataTable('myTable', depenses);

    useEffect(() => (
        console.log("Data depense :", dataDepense)
    ), [dataDepense]);

    useEffect(() => {
        console.log("Current depense :", dataDepense)
    }, [dataDepense]);

    // modifier un depense
    const updateDepense = (e, depense) => {
        e.preventDefault();

        console.log("updating depense :", depense)

        setCurrentDepense({ ...depense, montant: depense._montant, commentaire: depense.commentaire })

        setDataDepense({
            ...dataDepense,
            location_id: depense.location?.id,
            montant: depense._montant,
            commentaire: depense.commentaire
        })

        setModalTitle(`Modifier la depense ## ${depense.reference} ##`);
        setModalUpdateVisible(true);

        console.log(`Depense Current : ${JSON.stringify(currentDepense)}`)
    }

    // submit form
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        console.log('Données de la depense à modifier :', dataDepense);
        setLoading(true);
        setStatus(null);

        try {

            const formData = new FormData();
            formData.append("location_id", dataDepense.location_id);
            formData.append("montant", dataDepense.montant);
            formData.append("commentaire", dataDepense.commentaire);

            // Important : n'envoyer le fichier QUE si c'est un vrai File
            if (dataDepense.preuve instanceof File) {
                formData.append("preuve", dataDepense.preuve);
            }

            formData.append('_method', 'PATCH');

            const response = await axiosInstance.post(apiRoutes.updateDepense(currentDepense?.id), formData);

            setErrors({
                location_id: "",
                montant: "",
                preuve: "",
                commentaire: "",
            });

            setStatus('success');
            setMessage(`La depense a été modifiée avec succès!`);
            setStatusCode(response?.status);

            await getDepenses()

            setModalUpdateVisible(false);
            return navigate("/depenses/list");
        } catch (error) {
            console.log('Erreur lors de la modification de la depense :', error);
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

    // valider une depense
    const validate = async (e, depense) => {
        e.preventDefault()

        ConfirmAlert({
            title: `Voulez-vous vraiment valider la depense ${depense.reference} ?`,
            confirmButtonText: "Valider",
            denyButtonText: "Annuler",
            next: async () => {
                try {
                    setLoading(true);
                    setStatus(null);
                    const response = await axiosInstance.post(apiRoutes.validateDepense(depense.id));

                    console.log('Depense validée avec succès !');

                    await getDepenses(); // actualiser la liste des depenses

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`La depense ${depense.reference} a été validée avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/depenses/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la validation de la depense ${depense.reference} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    }

    /**
     * Deleting a depense
     */
    const deleteDepense = async (e, depense) => {
        e.preventDefault();

        ConfirmAlert({
            title: `Voulez-vous vraiment supprimer la depense ${depense.reference} ?`,
            confirmButtonText: "Supprimer",
            denyButtonText: "Annuler",
            next: async () => {
                try {
                    setLoading(true);
                    setStatus(null);
                    const response = await axiosInstance.delete(apiRoutes.deleteDepense(depense?.id));

                    console.log('Depense supprimée avec succès !');

                    await getDepenses(); // actualiser la liste des depenses

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`La depense ${depense.reference} a été supprimée avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/depenses/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la suppression de la depense ${depense.reference} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    };

    return (
        <>
            <Card>
                <LinkButton route={"/depenses/create"}>
                    <CIcon className='' icon={cibAddthis} /> Ajouter une depense
                </LinkButton>

                <table className="table table-striped bg-transparent" id="myTable">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Action</th>
                            <th scope="col">Reference</th>
                            <th scope="col">Location</th>
                            <th scope="col">Montant</th>
                            <th scope="col">Preuve</th>
                            <th scope="col">Inserée le</th>
                            <th scope="col">Inserée par</th>
                            <th scope="col">Validée le</th>
                            <th scope="col">Validée par</th>
                            <th scope="col">Commentaire</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            depenses.length > 0 ? depenses.map((depense, key) => (
                                <tr key={key} id={`row-${depense.id}`}>
                                    <th scope="row">{key + 1}</th>
                                    <td>
                                        {!depense.validatedAt ?
                                            <div className="dropdown">
                                                <a className="btn btn-dark w-100 dropdown-toggle btn-sm" role="button" data-bs-toggle="dropdown">
                                                    <CIcon className='me-2' icon={cilDialpad} /> Gérer
                                                </a>
                                                <ul className="dropdown-menu w-100">
                                                    {checkPermission("depense.edit") && !depense.validatedAt && <li><a className="dropdown-item text-warning" onClick={(e) => updateDepense(e, depense)} ><CIcon className='me-2' icon={cilPencil} /> Modifier</a></li>}
                                                    {checkPermission("depense.validate") && !depense.validatedAt && <li><a className="dropdown-item text-success" onClick={(e) => validate(e, depense)} ><CIcon className='me-2' icon={cilCheckCircle} /> Valider</a></li>}
                                                    {checkPermission("depense.delete") && <li><a className="dropdown-item text-danger" onClick={(e) => deleteDepense(e, depense)}><CIcon className='me-2' icon={cilTrash} /> Supprimer</a></li>}
                                                </ul>
                                            </div> : '---'}
                                    </td>
                                    <td><span className="badge bg-light text-dark border rounded shadow"> {depense.reference}</span></td>
                                    <td><span className="badge bg-light text-dark border rounded shadow">{`${depense.location?.reference}`}</span></td>
                                    <td><span className="badge bg-light text-dark border rounded shadow text-success" readOnly>{depense.montant} </span></td>
                                    <td>
                                        {depense.preuve ? <a href={depense.preuve} target="_blank" className="btn btn-sm shadow text-dark"><CIcon icon={cilCloudDownload} /></a> : '---'}
                                    </td>
                                    <td>{depense.createdAt || '---'}</td>
                                    <td>{depense.createdBy?.name || '---'}</td>
                                    <td>{depense.validatedAt || '---'}</td>
                                    <td>{depense.validatedBy?.name || '---'}</td>
                                    <td>
                                        <textarea className="form-control" rows="1" placeholder={depense.commentaire || '---'}></textarea>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="11" className="text-center">Aucune depense n'a été trouvée</td></tr>
                        }
                    </tbody>
                </table>

                {/* modification d'une depense */}
                <CModal
                    visible={modalUpdateVisible}
                    onClose={() => setModalUpdateVisible(false)}
                    aria-labelledby="LiveDemoExampleLabel"
                >
                    <form onSubmit={(e) => handleUpdateSubmit(e)} className="p-3">
                        <p>{modalTitle}</p>
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
                                text="Montant du depense"
                                required={true} />
                            <input type="number" name="montant"
                                className="form-control" id="montant"
                                value={dataDepense.montant}
                                placeholder="Ex: 50.000"
                                required
                                onChange={(e) => setDataDepense({ ...dataDepense, montant: e.target.value })}
                            />
                            {errors.montant && <span className="text-danger">{errors.montant}</span>}
                        </div>
                        <div className="mb-3">
                            <InputLabel
                                htmlFor="preuve"
                                text="La preuve du depense"
                                required={false} />
                            <input type="file" name="preuve"
                                className="form-control" id="contrat"
                                // required
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
                                value={dataDepense.commentaire}
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
                </CModal>
            </Card>
        </>
    )
}

export default List;