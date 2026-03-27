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
    const [backs, setBacks] = useState([]);
    const [currentBack, setCurrentBack] = useState({});
    const [searchId, setSearchId] = useState(null);

    // 
    const [dataBack, setDataBack] = useState({
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

    // les backs
    const getBacks = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allBack)

            setBacks(response?.data || []);

            console.log("Les backs :", response?.data)

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
        // chargements des backs
        getClients();
        // chargement des backs
        getBacks();
    }, [])

    // Call DataTable
    useDataTable('myTable', backs);

    useEffect(() => (
        console.log("Data back :", dataBack)
    ), [dataBack]);

    // modifier un back
    const updateBack = (e, back) => {
        e.preventDefault();

        setCurrentBack(back)

        console.log("The back : ", back)

        setDataBack({
            client_id: back.client?.id,
            montant: back._montant,
            preuve: null,
            commentaire: back.commentaire,
        })

        setModalTitle(`Modifier le retour de fond ## ${back.reference} ##`);
        setModalUpdateVisible(true);
    }

    // submit form
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        console.log('Données du retour de fond à modifier :', dataBack);
        console.log("Current accompte :", currentBack)

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

            console.log("Data Back in handleUpdateSubmit :", dataBack)

            formData.append("client_id", dataBack.client_id)
            formData.append("montant", dataBack.montant)
            formData.append("commentaire", dataBack.commentaire)

            if (dataBack.preuve) {
                formData.append("preuve", dataBack.preuve)
            }

            formData.append("_method", "PATCH");
            const response = await axiosInstance.post(apiRoutes.updateBack(currentBack?.id), formData);

            setErrors({
                client_id: "",
                montant: "",
                preuve: "",
                commentaire: "",
            });

            setStatus('success');
            setMessage(`Le retour de fond a été modifié avec succès!`);
            setStatusCode(response?.status);

            await getBacks();

            setModalUpdateVisible(false);

            return navigate("/backs/list");
        } catch (error) {
            console.log('Erreur lors de la modification du back :', error);
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

    // valider un back
    const validate = async (e, back) => {
        e.preventDefault()

        ConfirmAlert({
            title: `Voulez-vous vraiment valider le retour de fond ${back.reference} ?`,
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
                    const response = await axiosInstance.post(apiRoutes.validateBack(back.id));

                    console.log('back validé avec succès !');

                    await getBacks(); // actualiser la liste des Backs

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`Le retour de fond ${back.reference} a été validé avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/backs/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la validation du retour de fond ${back.reference} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    }

    /**
     * Deleting an back
     */
    const deleteBack = async (e, back) => {
        e.preventDefault();

        ConfirmAlert({
            title: `Voulez-vous vraiment supprimer le retour de fond ${back.reference} ?`,
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
                    const response = await axiosInstance.delete(apiRoutes.deleteBack(back?.id));

                    console.log('back supprimé avec succès !');

                    await getBacks(); // actualiser la liste des Backs

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`Le retour de fond ${back.reference} a été supprimé avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/backs/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la suppression du retour de fond ${back.reference} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    };

    /**
     * Filtre via client
     */
    const filteredBacks = searchId ? backs.filter((back) => back.client?.id == searchId) : backs

    const totalAmount = filteredBacks.reduce((sum, item) => {
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
                {checkPermission("back.create") &&
                    <LinkButton route={"/backs/create"}>
                        <CIcon className='' icon={cibAddthis} /> Ajouter un retour de fond
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
                            filteredBacks.length > 0 ? filteredBacks.map((back, key) => (
                                <tr key={key} id={`row-${back.id}`}>
                                    <th scope="row">{key + 1}</th>
                                    <td><span className="badge bg-light text-dark rounded border shadow">{back.reference}</span></td>
                                    <td>{`${back.client?.nom} ${back.client?.prenom}`}</td>
                                    <td><span className="badge bg-light border shadow text-success" readOnly>{back.montant} </span></td>
                                    <td>
                                        {back.preuve ? <a href={back.preuve} target="_blank" className="btn btn-sm shadow text-dark"><CIcon icon={cilCloudDownload} /></a> : '---'}
                                    </td>
                                    <td>{back.createdAt || '---'}</td>
                                    <td>{back.createdBy?.name || '---'}</td>
                                    <td>{back.validatedAt || '---'}</td>
                                    <td>{back.validatedBy?.name || '---'}</td>
                                    <td>
                                        <textarea className="form-control" rows="1" placeholder={back.commentaire || '---'}></textarea>
                                    </td>
                                    <td>
                                        {!back.validatedAt ?
                                            <div className="dropdown">
                                                <a className="btn btn-dark w-100 dropdown-toggle btn-sm" role="button" data-bs-toggle="dropdown">
                                                    <CIcon className='me-2' icon={cilDialpad} /> Gérer
                                                </a>
                                                <ul className="dropdown-menu w-100">
                                                    {checkPermission("back.edit") && !back.validatedAt && <li><a className="dropdown-item text-warning" onClick={(e) => updateBack(e, back)} ><CIcon className='me-2' icon={cilPencil} /> Modifier</a></li>}
                                                    {checkPermission("back.validate") && !back.validatedAt && <li><a className="dropdown-item text-success" onClick={(e) => validate(e, back)} ><CIcon className='me-2' icon={cilCheckCircle} /> Valider</a></li>}
                                                    {checkPermission("back.delete") && <li><a className="dropdown-item text-danger" onClick={(e) => deleteBack(e, back)}><CIcon className='me-2' icon={cilTrash} /> Supprimer</a></li>}
                                                </ul>
                                            </div> : '---'}
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="11" className="text-center">Aucun retour de fond n'a été trouvé</td></tr>
                        }
                    </tbody>
                </table>

                {/* modification d'un back */}
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
                                    .find((option) => option.value === dataBack.client_id)} // set selected option
                                onChange={(option) => setDataBack({ ...dataBack, client_id: option.value })} // update state with id
                            />
                            {errors.client_id && <span className="text-danger">{errors.client_id}</span>}
                        </div>

                        <div className="mb-3">
                            <InputLabel
                                htmlFor="montant"
                                text="Montant du retour de fond"
                                required={true} />
                            <input type="number" name="montant"
                                className="form-control" id="montant"
                                value={dataBack.montant}
                                placeholder="Ex: 50.000"
                                required
                                onChange={(e) => setDataBack({ ...dataBack, montant: e.target.value })}
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
                                onChange={(e) => setDataBack({ ...dataBack, preuve: e.target.files[0] })} />
                            {errors.preuve && <span className="text-danger">{errors.preuve}</span>}
                        </div>

                        <div className="mb-3">
                            <InputLabel
                                htmlFor="commenatire"
                                text="Commentaire"
                                required={false} />
                            <textarea name="commentaire" className="form-control"
                                rows="2"
                                value={dataBack.commentaire}
                                placeholder="Laissez un commentaire ...."
                                onChange={(e) => setDataBack({ ...dataBack, commentaire: e.target.value })}></textarea>
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