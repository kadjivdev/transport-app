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
    const [clients, setClients] = useState([]);
    const [acomptes, setAcomptes] = useState([]);
    const [currentAcompte, setCurrentAcompte] = useState({});
    const [searchId, setSearchId] = useState(null);

    // 
    const [dataAcompte, setDataAcompte] = useState({
        client_id: "",
        montant: "",
        preuve: "",
        commentaire: "",
    });
    const [errors, setErrors] = useState({
        client_id: "",
        montant: "",
        preuve: "",
        commentaire: "",
    });

    // les clients
    const getClients = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allClient)

            console.log("Les clients à l'initiation : ", response.data)
            setClients(response.data);

            setStatus('success');
            setStatusCode(response.status);
            setMessage('Liste des clients avec succès!');

            return response.data;
        } catch (error) {
            if (error.response?.status != 204) {
                setStatus('error');
                setStatusCode(error.response?.status);
                setMessage('Erreure lors du chargement des clients!!');
                return [];
            }
        }
    }, [])

    // les acomptes
    const getAcomptes = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allAcompte)

            setAcomptes(response?.data || []);

            console.log("Les acomptes :", response?.data)

            setStatus('success');
            setStatusCode(response.status);
            setMessage('Liste des acomptes chargés avec succès!');

            return response.data;
        } catch (error) {
            setStatus('error');
            setStatusCode(error.response?.status);
            setMessage('Erreure lors du chargement des acomptes!!');
            return [];
        }
    }, [])

    // initialisation des données
    useEffect(function () {
        // chargements des acomptes
        getClients();
        // chargement des acomptes
        getAcomptes();
    }, [])

    // Call DataTable
    useDataTable('myTable', acomptes);

    useEffect(() => (
        console.log("Data acompte :", dataAcompte)
    ), [dataAcompte]);

    // modifier un acompte
    const updateAcompte = (e, acompte) => {
        e.preventDefault();

        setCurrentAcompte(acompte)

        console.log("The acompte : ", acompte)

        setDataAcompte({
            client_id: acompte.client?.id,
            montant: acompte._montant,
            preuve: null,
            commentaire: acompte.commentaire,
        })

        setModalTitle(`Modifier l'acompte ## ${acompte.reference} ##`);
        setModalUpdateVisible(true);
    }

    // submit form
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        console.log('Données de l\'acompte à modifier :', dataAcompte);
        console.log("Current accompte :", currentAcompte)

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

            console.log("Data acompte in handleUpdateSubmit :", dataAcompte)

            formData.append("client_id", dataAcompte.client_id)
            formData.append("montant", dataAcompte.montant)
            formData.append("commentaire", dataAcompte.commentaire)

            if (dataAcompte.preuve) {
                formData.append("preuve", dataAcompte.preuve)
            }

            formData.append("_method", "PATCH");
            const response = await axiosInstance.post(apiRoutes.updateAcompte(currentAcompte?.id), formData);

            setErrors({
                client_id: "",
                montant: "",
                preuve: "",
                commentaire: "",
            });

            setStatus('success');
            setMessage(`L'acompte a été modifié avec succès!`);
            setStatusCode(response?.status);

            await getAcomptes();

            setModalUpdateVisible(false);

            return navigate("/acomptes/list");
        } catch (error) {
            console.log('Erreur lors de la modification du acompte :', error);
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

    // valider un acompte
    const validate = async (e, acompte) => {
        e.preventDefault()

        ConfirmAlert({
            title: `Voulez-vous vraiment valider le acompte ${acompte.reference} ?`,
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
                    const response = await axiosInstance.post(apiRoutes.validateAcompte(acompte.id));

                    console.log('Acompte validé avec succès !');

                    await getAcomptes(); // actualiser la liste des acomptes

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`L'acompte ${acompte.reference} a été validé avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/acomptes/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la validation de l'acompte ${acompte.reference} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    }

    /**
     * Deleting an acompte
     */
    const deleteAcompte = async (e, acompte) => {
        e.preventDefault();

        ConfirmAlert({
            title: `Voulez-vous vraiment supprimer l'acompte ${acompte.reference} ?`,
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
                    const response = await axiosInstance.delete(apiRoutes.deleteAcompte(acompte?.id));

                    console.log('Acompte supprimé avec succès !');

                    await getAcomptes(); // actualiser la liste des acomptes

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`L'acompte ${acompte.reference} a été supprimé avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/acomptes/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la suppression de l'acompte ${acompte.reference} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    };

    /**
     * Filtre via client
     */
    const filteredAcomptes = searchId ? acomptes.filter((acompte) => acompte.client?.id == searchId) : acomptes

    const totalAmount = filteredAcomptes.reduce((sum, item) => {
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
                {checkPermission("acompte.create") &&
                    <LinkButton route={"/acomptes/create"}>
                        <CIcon className='' icon={cibAddthis} /> Ajouter un acompte
                    </LinkButton>
                }

                {/* filtre via client */}
                <div className="row d-flex justify-content-center mb-3">
                    <div className="col-md-6">
                        <Select
                            placeholder="Rechercher un client ..."
                            name="client_id"
                            id="client_id"
                            required
                            className="form-control mt-1 block w-full"
                            options={clients?.map((client) => ({
                                value: client.id,
                                label: `${client.nom} ${client.prenom}`,
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
                            <th scope="col">Client</th>
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
                            filteredAcomptes.length > 0 ? filteredAcomptes.map((acompte, key) => (
                                <tr key={key} id={`row-${acompte.id}`}>
                                    <th scope="row">{key + 1}</th>
                                    <td><span className="badge bg-light text-dark rounded border shadow">{acompte.reference}</span></td>
                                    <td>{`${acompte.client?.nom} ${acompte.client?.prenom}`}</td>
                                    <td><span className="badge bg-light border shadow text-success" readOnly>{acompte.montant} </span></td>
                                    <td>
                                        {acompte.preuve ? <a href={acompte.preuve} target="_blank" className="btn btn-sm shadow text-dark"><CIcon icon={cilCloudDownload} /></a> : '---'}
                                    </td>
                                    <td>{acompte.createdAt || '---'}</td>
                                    <td>{acompte.createdBy?.name || '---'}</td>
                                    <td>{acompte.validatedAt || '---'}</td>
                                    <td>{acompte.validatedBy?.name || '---'}</td>
                                    <td>
                                        <textarea className="form-control" rows="1" placeholder={acompte.commentaire || '---'}></textarea>
                                    </td>
                                    <td>
                                        {!acompte.validatedAt ?
                                            <div className="dropdown">
                                                <a className="btn btn-dark w-100 dropdown-toggle btn-sm" role="button" data-bs-toggle="dropdown">
                                                    <CIcon className='me-2' icon={cilDialpad} /> Gérer
                                                </a>
                                                <ul className="dropdown-menu w-100">
                                                    {checkPermission("acompte.edit") && !acompte.validatedAt && <li><a className="dropdown-item text-warning" onClick={(e) => updateAcompte(e, acompte)} ><CIcon className='me-2' icon={cilPencil} /> Modifier</a></li>}
                                                    {checkPermission("acompte.validate") && !acompte.validatedAt && <li><a className="dropdown-item text-success" onClick={(e) => validate(e, acompte)} ><CIcon className='me-2' icon={cilCheckCircle} /> Valider</a></li>}
                                                    {checkPermission("acompte.delete") && <li><a className="dropdown-item text-danger" onClick={(e) => deleteAcompte(e, acompte)}><CIcon className='me-2' icon={cilTrash} /> Supprimer</a></li>}
                                                </ul>
                                            </div> : '---'}
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="11" className="text-center">Aucun acompte n'a été trouvé</td></tr>
                        }
                    </tbody>
                </table>

                {/* modification d'un acompte */}
                <CModal
                    visible={modalUpdateVisible}
                    onClose={() => setModalUpdateVisible(false)}
                    aria-labelledby="LiveDemoExampleLabel"
                >
                    <form onSubmit={(e) => handleUpdateSubmit(e)} className="p-3">
                        <p>{modalTitle}</p>
                        <div className="mb-3">
                            <InputLabel
                                htmlFor="client_id"
                                text="Le client"
                                required={true} />
                            <Select
                                placeholder="Rechercher un client ..."
                                name="client_id"
                                id="client_id"
                                required
                                className="form-control mt-1 block w-full"
                                options={clients?.map((client) => ({
                                    value: client.id,
                                    label: `${client.nom} ${client.prenom}`,
                                }))}
                                value={clients
                                    .map((client) => ({
                                        value: client.id,
                                        label: `${client.nom} ${client.prenom}`,
                                    }))
                                    .find((option) => option.value === dataAcompte.client_id)} // set selected option
                                onChange={(option) => setDataAcompte({ ...dataAcompte, client_id: option.value })} // update state with id
                            />
                            {errors.client_id && <span className="text-danger">{errors.client_id}</span>}
                        </div>

                        <div className="mb-3">
                            <InputLabel
                                htmlFor="montant"
                                text="Montant de l'acompte"
                                required={true} />
                            <input type="number" name="montant"
                                className="form-control" id="montant"
                                value={dataAcompte.montant}
                                placeholder="Ex: 50.000"
                                required
                                onChange={(e) => setDataAcompte({ ...dataAcompte, montant: e.target.value })}
                            />
                            {errors.montant && <span className="text-danger">{errors.montant}</span>}
                        </div>
                        <div className="mb-3">
                            <InputLabel
                                htmlFor="preuve"
                                text="La preuve de l'acompte"
                                required={false} />
                            <input type="file" name="preuve"
                                className="form-control" id="preuve"
                                onChange={(e) => setDataAcompte({ ...dataAcompte, preuve: e.target.files[0] })} />
                            {errors.preuve && <span className="text-danger">{errors.preuve}</span>}
                        </div>

                        <div className="mb-3">
                            <InputLabel
                                htmlFor="commenatire"
                                text="Commentaire"
                                required={false} />
                            <textarea name="commentaire" className="form-control"
                                rows="2"
                                value={dataAcompte.commentaire}
                                placeholder="Laissez un commentaire ...."
                                onChange={(e) => setDataAcompte({ ...dataAcompte, commentaire: e.target.value })}></textarea>
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