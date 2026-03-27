import { cibAddthis, cilCheckCircle, cilCloudDownload, cilDialpad, cilPencil, cilSend, cilTrash } from "@coreui/icons";
import { CModal } from '@coreui/react'

import CIcon from "@coreui/icons-react";
import { useCallback, useEffect, useState } from "react";
import Card from "src/components/Card";
import LinkButton from "src/components/LinkButton";
import useDataTable from "src/hooks/useDataTable";
import axiosInstance from "../../api/axiosInstance";
import apiRoutes from "../../api/routes"
import { useApp } from "../../AppContext";
import InputLabel from "src/components/forms/InputLabel";
import { useNavigate } from "react-router-dom";
import ConfirmAlert from "../../hooks/ConfirmAlert";
import Select from 'react-select'
import CustomButton from "src/components/CustomButton";
import Swal from "sweetalert2";

const List = () => {
    const { setStatus, setLoading, setMessage, setStatusCode, setModalVisible, modalTitle, setModalTitle } = useApp();

    const navigate = useNavigate();

    const authUser = JSON.parse(localStorage.getItem("user") || "[]");

    // verification de permission
    const checkPermission = (name) => {
        return authUser?.permissions?.some(per => per.name == name);
    }

    const [modalUpdateVisible, setModalUpdateVisible] = useState(false);

    const [locations, setLocations] = useState([]);
    const [tvas, setTvas] = useState([]);
    const [currentTva, setCurrentTva] = useState({});
    const [searchId, setSearchId] = useState(null);

    // 
    const [dataTva, setDataTva] = useState({
        locattion_id: "",
        montant: "",
        preuve: "",
        commentaire: "",
    });
    const [errors, setErrors] = useState({
        locattion_id: "",
        montant: "",
        preuve: "",
        commentaire: "",
    });

    // les Locations
    const getLocations = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allLocation)

            console.log("Les locations à l'initiation : ", response.data)
            setLocations(response.data);

            setStatus('success');
            setStatusCode(response.status);
            setMessage('Liste des locations avec succès!');

            return response.data;
        } catch (error) {
            if (error.response?.status != 204) {
                setStatus('error');
                setStatusCode(error.response?.status);
                setMessage('Erreure lors du chargement des locations!!');
                return [];
            }
        }
    }, [])

    // les Tvas
    const getTvas = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allTva)

            setTvas(response?.data || []);

            console.log("Les Tvas :", response?.data)

            setStatus('success');
            setStatusCode(response.status);
            setMessage('Liste des retour de fond chargés avec succès!');

            return response.data;
        } catch (error) {
            setStatus('error');
            setStatusCode(error.response?.status);
            setMessage('Erreure lors du chargement des retour de fond!!');
            return [];
        }
    }, [])

    // initialisation des données
    useEffect(function () {
        // chargements des Tvas
        getLocations();
        // chargement des Tvas
        getTvas();
    }, [])

    // Call DataTable
    useDataTable('myTable', tvas);

    useEffect(() => (
        console.log("Data tva :", dataTva)
    ), [dataTva]);

    // modifier un Tva
    const updateTva = (e, tva) => {
        e.preventDefault();

        setCurrentTva(tva)

        console.log("The tva : ", tva)

        setDataTva({
            locattion_id: tva.location?.id,
            montant: tva._montant,
            preuve: null,
            commentaire: tva.commentaire,
        })

        setModalTitle(`Modifier le retour de fond ## ${tva.reference} ##`);
        setModalUpdateVisible(true);
    }

    // submit form
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        console.log('Données du retour de fond à modifier :', dataTva);
        console.log("Current accompte :", currentTva)

        Swal.fire({
            title: "Opération en cours...",
            text: "Veuillez patienter",
            icon: "info",
            didOpen: (toast) => {
                Swal.showLoading()
            },
            allowOutsideClick: false,
            allowEscapeKey: false,
            didClose: () => {
                Swal.close();
            }
        });

        setStatus(null);

        try {

            const formData = new FormData()

            console.log("Data Tva in handleUpdateSubmit :", dataTva)

            formData.append("locattion_id", dataTva.locattion_id)
            formData.append("montant", dataTva.montant)
            formData.append("commentaire", dataTva.commentaire)

            if (dataTva.preuve) {
                formData.append("preuve", dataTva.preuve)
            }

            formData.append("_method", "PATCH");
            const response = await axiosInstance.post(apiRoutes.updateTva(currentTva?.id), formData);

            setErrors({
                locattion_id: "",
                montant: "",
                preuve: "",
                commentaire: "",
            });

            setStatus('success');
            setMessage(`Le retour de fond a été modifié avec succès!`);
            setStatusCode(response?.status);

            await getTvas();

            setModalUpdateVisible(false);

            return navigate("/tvas/list");
        } catch (error) {
            console.log('Erreur lors de la modification du tva :', error);
            let errMessage = '';

            if (error.response?.status === 422) {
                // Erreurs de validation
                errMessage = `Des erreurs de validation sont survenues. Veuillez vérifier les champs `;
                setErrors(error.response?.data?.errors);
            } else {
                errMessage = `Une erreur inattendue est survenue. Veuillez réessayer. (${error.response?.data?.error || 'Erreure survenue'})`;
            }

            setLoading(false);
            setStatus('error');
            setMessage(errMessage);
            setStatusCode(error.response?.status);

            // setModalUpdateVisible(false);
        }
    }

    // valider un tva
    const validate = async (e, tva) => {
        e.preventDefault()

        ConfirmAlert({
            title: `Voulez-vous vraiment valider le retour de fond ${tva.reference} ?`,
            confirmButtonText: "Valider",
            denyButtonText: "Annuler",
            next: async () => {
                try {
                    Swal.fire({
                        title: "Opération en cours...",
                        text: "Veuillez patienter",
                        icon: "info",
                        didOpen: (toast) => {
                            Swal.showLoading()
                        },
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        didClose: () => {
                            Swal.close();
                        }
                    });

                    setStatus(null);
                    const response = await axiosInstance.post(apiRoutes.validateTva(tva.id));

                    console.log('tva validé avec succès !');

                    await getTvas(); // actualiser la liste des Tvas

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`Le retour de fond ${tva.reference} a été validé avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/tvas/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la validation du retour de fond ${tva.reference} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    }

    /**
     * Deleting an tva
     */
    const deleteTva = async (e, tva) => {
        e.preventDefault();

        ConfirmAlert({
            title: `Voulez-vous vraiment supprimer le retour de fond ${tva.reference} ?`,
            confirmButtonText: "Supprimer",
            denyButtonText: "Annuler",
            next: async () => {
                try {
                    Swal.fire({
                        title: "Opération en cours...",
                        text: "Veuillez patienter",
                        icon: "info",
                        didOpen: (toast) => {
                            Swal.showLoading()
                        },
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        didClose: () => {
                            Swal.close();
                        }
                    });

                    setStatus(null);
                    const response = await axiosInstance.delete(apiRoutes.deleteTva(tva?.id));

                    console.log('tva supprimé avec succès !');

                    await getTvas(); // actualiser la liste des Tvas

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`Le retour de fond ${tva.reference} a été supprimé avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/tvas/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la suppression du retour de fond ${tva.reference} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    };

    /**
     * Filtre via location
     */
    const filteredTvas = searchId ? tvas.filter((tva) => tva.location?.id == searchId) : tvas

    const totalAmount = filteredTvas.reduce((sum, item) => {
        const value = Number(item.montant.replace(/\s/g, '').replace(',', '.'));
        return sum + value;
    }, 0);

    const totalFormattedAmount = totalAmount.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return (
        <>
            <Card>
                {checkPermission("tva.create") &&
                    <LinkButton route={"/tvas/create"}>
                        <CIcon className='' icon={cibAddthis} /> Ajouter un Tva
                    </LinkButton>
                }

                {/* filtre via location */}
                <div className="row d-flex justify-content-center mb-3">
                    <div className="col-md-6">
                        <Select
                            placeholder="Rechercher une location ..."
                            name="locattion_id"
                            id="locattion_id"
                            required
                            className="form-control mt-1 block w-full"
                            options={locations?.map((location) => ({
                                value: location.id,
                                label: `${location.reference}`,
                            }))
                            }
                            onChange={(option) => setSearchId(option.value)} // update state with id
                        />
                    </div>
                </div>

                {/* totaux */}
                <h5 className="">Montant total : <span className="badge bg-light rounded border shadow text-success">{totalFormattedAmount} FCFA</span></h5>
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
                            <th scope="col">Commentaire</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredTvas.length > 0 ? filteredTvas.map((tva, key) => (
                                <tr key={key} id={`row-${tva.id}`}>
                                    <th scope="row">{key + 1}</th>
                                    <td><span className="badge bg-light text-dark rounded border shadow">{tva.reference}</span></td>
                                    <td>{`${tva.location?.reference}`}</td>
                                    <td><span className="badge bg-light border shadow text-success" readOnly>{tva.montant} </span></td>
                                    <td>
                                        {tva.preuve ? <a href={tva.preuve} target="_blank" className="btn btn-sm shadow text-dark"><CIcon icon={cilCloudDownload} /></a> : '---'}
                                    </td>
                                    <td>{tva.createdAt || '---'}</td>
                                    <td>{tva.createdBy?.name || '---'}</td>
                                    <td>{tva.validatedAt || '---'}</td>
                                    <td>{tva.validatedBy?.name || '---'}</td>
                                    <td>
                                        <textarea className="form-control" rows="1" placeholder={tva.commentaire || '---'}></textarea>
                                    </td>
                                    <td>
                                        {!tva.validatedAt ?
                                            <div className="dropdown">
                                                <a className="btn btn-dark w-100 dropdown-toggle btn-sm" role="button" data-bs-toggle="dropdown">
                                                    <CIcon className='me-2' icon={cilDialpad} /> Gérer
                                                </a>
                                                <ul className="dropdown-menu w-100">
                                                    {checkPermission("tva.edit") && !tva.validatedAt && <li><a className="dropdown-item text-warning" onClick={(e) => updateTva(e, tva)} ><CIcon className='me-2' icon={cilPencil} /> Modifier</a></li>}
                                                    {checkPermission("tva.validate") && !tva.validatedAt && <li><a className="dropdown-item text-success" onClick={(e) => validate(e, tva)} ><CIcon className='me-2' icon={cilCheckCircle} /> Valider</a></li>}
                                                    {checkPermission("tva.delete") && <li><a className="dropdown-item text-danger" onClick={(e) => deleteTva(e, tva)}><CIcon className='me-2' icon={cilTrash} /> Supprimer</a></li>}
                                                </ul>
                                            </div> : '---'}
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="11" className="text-center">Aucun retour de fond n'a été trouvé</td></tr>
                        }
                    </tbody>
                </table>

                {/* modification d'un tva */}
                <CModal
                    visible={modalUpdateVisible}
                    onClose={() => setModalUpdateVisible(false)}
                    aria-labelledby="LiveDemoExampleLabel"
                >
                    <form onSubmit={(e) => handleUpdateSubmit(e)} className="p-3">
                        <p>{modalTitle}</p>
                        <div className="mb-3">
                            <InputLabel
                                htmlFor="locattion_id"
                                text="La location"
                                required={true} />
                            <Select
                                placeholder="Rechercher un location ..."
                                name="locattion_id"
                                id="locattion_id"
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
                                    .find((option) => option.value === dataTva.locattion_id)} // set selected option
                                onChange={(option) => setDataTva({ ...dataTva, locattion_id: option.value })} // update state with id
                            />
                            {errors.locattion_id && <span className="text-danger">{errors.locattion_id}</span>}
                        </div>

                        <div className="mb-3">
                            <InputLabel
                                htmlFor="montant"
                                text="Montant du retour de fond"
                                required={true} />
                            <input type="number" name="montant"
                                className="form-control" id="montant"
                                value={dataTva.montant}
                                placeholder="Ex: 50.000"
                                required
                                onChange={(e) => setDataTva({ ...dataTva, montant: e.target.value })}
                            />
                            {errors.montant && <span className="text-danger">{errors.montant}</span>}
                        </div>
                        <div className="mb-3">
                            <InputLabel
                                htmlFor="preuve"
                                text="La preuve du retour de fond"
                                required={false} />
                            <input type="file" name="preuve"
                                className="form-control" id="preuve"
                                onChange={(e) => setDataTva({ ...dataTva, preuve: e.target.files[0] })} />
                            {errors.preuve && <span className="text-danger">{errors.preuve}</span>}
                        </div>

                        <div className="mb-3">
                            <InputLabel
                                htmlFor="commenatire"
                                text="Commentaire"
                                required={false} />
                            <textarea name="commentaire" className="form-control"
                                rows="2"
                                value={dataTva.commentaire}
                                placeholder="Laissez un commentaire ...."
                                onChange={(e) => setDataTva({ ...dataTva, commentaire: e.target.value })}></textarea>
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