import { cibAddthis, cilCheckCircle, cilCloudDownload, cilDelete, cilDialpad, cilList, cilPencil, cilSend, cilTrash } from "@coreui/icons";
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'

import CIcon from "@coreui/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
    const [reglements, setReglements] = useState([]);
    const [currentReglement, setCurrentReglement] = useState({});
    const [modalCamionsVisible, setModalCamionsVisible] = useState(false);

    const [camions, setCamions] = useState([]);
    const currentLocation = useRef({})
    const [showClient, setShowClient] = useState(false)

    // 
    const [dataReglement, setDataReglement] = useState({
        location_id: "",
        camions: "",
        montant: "",
        preuve: "",
        commentaire: "",
    });
    const [errors, setErrors] = useState({
        location_id: "",
        camions: "",
        montant: "",
        preuve: "",
        commentaire: "",
    });

    // les locations
    const getLocations = useCallback(async function () {
        try {
            const response = await axiosInstance.get(apiRoutes.allLocation)

            console.log("Les locations à l'initiation : ", response.data)

            // juste les reglement déjà validés & ayant du reste à livrer
            let data = response?.data?.filter((location) => (location.validatedAt && location._reste > 0)) || []
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
    useDataTable('myTable', reglements);

    useEffect(() => (
        console.log("Data reglement :", dataReglement)
    ), [dataReglement]);

    useEffect(() => (
        console.log("Data camions :", camions)
    ), [camions]);

    const handleLocationChange = (value) => {
        let location = locations.find(loca => loca.id == value);
        if (!location) return;

        console.log("Location choosed :", location);

        // tous les camions de la location de ce reglement
        setCamions(location?.details?.map(detail => ({ ...detail })))

        currentLocation.current = location

        setCamions(location.details?.map((detail) => ({
            id: detail.camion.id,
            libelle: detail.camion.libelle,
            immatriculation: detail.camion.immatriculation,
        })))

        setShowClient(true)

        setDataReglement((prev) => ({
            ...prev,
            location_id: value, montant: location.client?.solde
        }));
    }

    // amount hundling...
    const handleMontantChange = (value) => {

        if (value > currentLocation.current?.client?.solde) {
            Swal.fire({
                'title': 'Montant invalide',
                text: `Le solde maximum restant pour le client est de : ${currentLocation.current?.client?.solde}`
            })

            setDataReglement((prev) => ({
                ...prev,
                montant: currentLocation.current?.client?.solde
            }));
            return;
        }

        setDataReglement((prev) => ({
            ...prev,
            montant: value
        }));
    }

    // modifier un reglement
    const updateReglement = (e, reglement) => {
        e.preventDefault();


        setCurrentReglement(reglement)
        setShowClient(true)

        currentLocation.current = reglement.location

        // tous les camions de la location de ce reglement
        setCamions(reglement.location?.details?.map(detail => ({ ...detail.camion })))

        console.log("The reglement : ", reglement)

        setDataReglement({
            location_id: reglement.location?.id,
            camions: reglement.camions?.map(c => ({ id: c.id, libelle: c.libelle })),
            montant: reglement.montant,
            preuve: null,
            commentaire: reglement.commentaire,
        })

        setModalTitle(`Modifier le reglement ## ${reglement.reference} ##`);
        setModalUpdateVisible(true);
    }

    // submit form
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        console.log('Données du reglement à modifier :', dataReglement);

        if (dataReglement.montant > currentLocation.current?.client?.solde) {
            Swal.fire({
                'title': 'Montant invalide',
                text: `Le solde maximum restant pour le client est de : ${currentLocation.current?.client?.solde}`
            })

            setDataReglement((prev) => ({
                ...prev,
                montant: currentLocation.current?.client?.solde
            }));
            return;
        }

        if (dataReglement.montant > currentLocation.current?.reste_a_regler) {
            Swal.fire({
                title: 'Montant invalide',
                text: `Le montant maximum restant à régler sur cette location est de : ${currentReglement.location?.reste_a_regler} FCFA`
            })
            return;
        }

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

            console.log("Data location in handleUpdateSubmit :", dataReglement)

            formData.append("location_id", dataReglement.location_id)
            formData.append("montant", dataReglement.montant)
            formData.append("commentaire", dataReglement.commentaire)

            dataReglement.camions.forEach((camion, index) => {
                formData.append(`camions[${index}][id]`, JSON.stringify(camion.id))  // On envoie chaque camion séparément
                formData.append(`camions[${index}][libelle]`, JSON.stringify(camion.libelle))  // On envoie chaque camion séparément
            });


            if (dataReglement.preuve) {
                formData.append("preuve", dataReglement.preuve)
            }

            formData.append("_method", "PATCH");
            const response = await axiosInstance.post(apiRoutes.updateReglement(currentReglement?.id), formData);

            setErrors({
                location_id: "",
                camions: "",
                montant: "",
                preuve: "",
                commentaire: "",
            });

            setStatus('success');
            setMessage(`Le reglement a été modifié avec succès!`);
            setStatusCode(response?.status);

            await getReglements();

            setModalUpdateVisible(false);

            return navigate("/reglements/list");
        } catch (error) {
            console.log('Erreur lors de la modification du reglement :', error);
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

    // valider un elocation
    const validate = async (e, reglement) => {
        e.preventDefault()

        if (reglement.montant > reglement.location?.reste_a_regler) {
            Swal.fire({
                title: 'Montant invalide',
                text: `Le montant maximum restant à régler sur cette location est de : ${reglement.location?.reste_a_regler} FCFA`
            })
            return;
        }

        ConfirmAlert({
            title: `Voulez-vous vraiment valider le reglement ${reglement.reference} ?`,
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
                    const response = await axiosInstance.post(apiRoutes.validateReglement(reglement.id));

                    console.log('Reglement validé avec succès !');

                    await getReglements(); // actualiser la liste des reglements

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`Le reglement ${reglement.reference} a été validé avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/reglements/list");
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
                    const response = await axiosInstance.delete(apiRoutes.deleteReglement(reglement?.id));

                    console.log('Reglement supprimé avec succès !');

                    await getLocations(); // actualiser la liste des reglement

                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`Le reglement ${reglement.reference} a été supprimé avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/reglements/list");
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

    /**
     * Show Camions
     */
    const showCamions = (reglement) => {
        setCurrentReglement(reglement);
        setModalCamionsVisible(true);
        setModalTitle(`Liste des camions liés aux règlement ## ${reglement.reference} ##`);
    }

    return (
        <>
            <Card>
                {checkPermission("reglement.create") &&
                    <LinkButton route={"/reglements/create"}>
                        <CIcon className='' icon={cibAddthis} /> Ajouter un reglement
                    </LinkButton>
                }

                {/* tableau */}
                <table className="table table-striped bg-transparent" id="myTable">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Action</th>
                            <th scope="col">Reference</th>
                            <th scope="col">Location</th>
                            <th scope="col">Montant</th>
                            <th scope="col">Preuve</th>
                            <th scope="col">Camions</th>
                            <th scope="col">Inserée le</th>
                            <th scope="col">Inserée par</th>
                            <th scope="col">Validée le</th>
                            <th scope="col">Validée par</th>
                            <th scope="col">Commentaire</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            reglements.length > 0 ? reglements.map((reglement, key) => (
                                <tr key={key} id={`row-${reglement.id}`}>
                                    <th scope="row">{key + 1}</th>
                                    <td>
                                        {!reglement.validatedAt ?
                                            <div className="dropdown">
                                                <a className="btn btn-dark w-100 dropdown-toggle btn-sm" role="button" data-bs-toggle="dropdown">
                                                    <CIcon className='me-2' icon={cilDialpad} /> Gérer
                                                </a>
                                                <ul className="dropdown-menu w-100">
                                                    {checkPermission("reglement.edit") && !reglement.validatedAt && <li><a className="dropdown-item text-warning" onClick={(e) => updateReglement(e, reglement)} ><CIcon className='me-2' icon={cilPencil} /> Modifier</a></li>}
                                                    {checkPermission("reglement.validate") && !reglement.validatedAt && <li><a className="dropdown-item text-success" onClick={(e) => validate(e, reglement)} ><CIcon className='me-2' icon={cilCheckCircle} /> Valider</a></li>}
                                                    {checkPermission("reglement.delete") && <li><a className="dropdown-item text-danger" onClick={(e) => deleteReglement(e, reglement)}><CIcon className='me-2' icon={cilTrash} /> Supprimer</a></li>}
                                                </ul>
                                            </div> : '---'}
                                    </td>
                                    <td>{reglement.reference}</td>
                                    <td>{`${reglement.location?.reference}`}</td>
                                    <td><button className="btn btn-sm shadow text-success" readOnly>{reglement.montant} </button></td>
                                    <td>
                                        {reglement.preuve ? <a href={reglement.preuve} target="_blank" className="btn btn-sm shadow text-dark"><CIcon icon={cilCloudDownload} /></a> : '---'}
                                    </td>
                                    <td> <button className="btn btn-light shadow rounded border" onClick={() => showCamions(reglement)}><CIcon icon={cilList} /></button> </td>
                                    <td>{reglement.createdAt || '---'}</td>
                                    <td>{reglement.createdBy?.name || '---'}</td>
                                    <td>{reglement.validatedAt || '---'}</td>
                                    <td>{reglement.validatedBy?.name || '---'}</td>
                                    <td>
                                        <textarea className="form-control" rows="1" placeholder={reglement.commentaire || '---'}></textarea>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="12" className="text-center">Aucun reglement n'a été trouvé</td></tr>
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
                                    label: `${location.reference} - Reste à regler : ${location.reste}`,
                                }))}
                                value={locations
                                    .map((location) => ({
                                        value: location.id,
                                        label: `${location.reference} - Reste à regler : ${location.reste}`,
                                    }))
                                    .find((option) => option.value === dataReglement.location_id)} // set selected option
                                onChange={(option) => handleLocationChange(option.value)} // update state with id
                            />
                            {errors.location_id && <span className="text-danger">{errors.location_id}</span>}
                        </div>

                        {
                            showClient &&
                            (
                                <div className="">
                                    <div className="mb-3">
                                        <InputLabel
                                            htmlFor="camion"
                                            text="Précisez le camion"
                                            required={true} />
                                        <Select
                                            placeholder="Rechercher un camion ..."
                                            name="camions"
                                            id="camions"
                                            required
                                            className="form-control mt-1 block w-full"
                                            isMulti={true}
                                            value={dataReglement.camions?.map((camion) => ({
                                                value: camion.id,
                                                label: `${camion.libelle}`,
                                            }))}
                                            options={camions.map((camion) => ({
                                                value: camion.id,
                                                label: `${camion.libelle}`,
                                            }))}
                                            onChange={(options) => setDataReglement({ ...dataReglement, camions: options.map(opt => ({ id: opt.value, libelle: opt.label })) ?? [] })} // update state with id
                                        />
                                        {errors.camions && <span className="text-danger">{errors.camions}</span>}
                                    </div>

                                    <div className="mb-3">

                                        <InputLabel
                                            htmlFor="montant"
                                            text="Le client concerné.e" />
                                        <input type="text"
                                            className="form-control"
                                            value={`${currentLocation.current?.client?.nom} - ${currentLocation.current?.client?.prenom} | Solde : ${currentLocation.current?.client?.solde}`}
                                            readOnly={true}
                                        />
                                        {errors.montant && <span className="text-danger">{errors.montant}</span>}
                                    </div>
                                </div>)
                        }

                        <div className="mb-3">
                            <InputLabel
                                htmlFor="montant"
                                text="Montant du reglement"
                                required={true} />
                            <input type="number" name="montant"
                                className="form-control" id="montant"
                                value={dataReglement.montant}
                                placeholder="Ex: 50.000"
                                required
                                onChange={(e) => handleMontantChange(e.target.value)}
                            />
                            {errors.montant && <span className="text-danger">{errors.montant}</span>}
                        </div>
                        <div className="mb-3">
                            <InputLabel
                                htmlFor="preuve"
                                text="La preuve du reglement" />
                            <input type="file" name="preuve"
                                className="form-control" id="contrat"
                                // required
                                onChange={(e) => setDataReglement({ ...dataReglement, preuve: e.target.files[0] })} />
                            {errors.preuve && <span className="text-danger">{errors.preuve}</span>}
                        </div>

                        <div className="mb-3">
                            <InputLabel
                                htmlFor="commenatire"
                                text="Commentaire"
                                required={false} />
                            <textarea name="commentaire" className="form-control"
                                rows="2"
                                placeholder="Laissez un commentaire ...."
                                value={dataReglement.commentaire}
                                onChange={(e) => setDataReglement({ ...dataReglement, commentaire: e.target.value })}></textarea>
                            {errors.commentaire && <span className="text-danger">{errors.commentaire}</span>}
                        </div>

                        {checkPermission("reglement.edit") &&
                            <div className="mt-3">
                                <CustomButton newClass={'_btn-dark'} type="submit"> <CIcon icon={cilSend} /> Enregistrer </CustomButton>
                            </div>
                        }
                    </form>
                </CModal>

                {/* Les camions */}
                <CModal
                    visible={modalCamionsVisible}
                    onClose={() => setModalCamionsVisible(false)}
                    aria-labelledby="LiveDemoExampleLabel"
                >
                    <CModalHeader>
                        <CModalTitle >{modalTitle || 'Modal par défaut'}</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <div className="mb-3">
                            <ol className="list-group list-group-numbered">
                                {
                                    currentReglement?.camions?.length > 0 ? currentReglement.camions?.map((camion, key) => (
                                        <li key={key} className="list-group-item">{camion.libelle} - ({camion.immatriculation})</li>
                                    )) : <li className="list-group-item text-danger">Aucun camion retrouvé</li>
                                }
                            </ol>
                        </div>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="warning" onClick={() => setModalCamionsVisible(false)}>
                            <CIcon icon={cilDelete} /> Fermer
                        </CButton>
                    </CModalFooter>
                </CModal>
            </Card>
        </>
    )
}

export default List;