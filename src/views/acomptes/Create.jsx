import { cilList, cilSend } from "@coreui/icons";

import CIcon from "@coreui/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Card from "src/components/Card";
import CustomButton from "src/components/CustomButton";
import LinkButton from "src/components/LinkButton";
import InputLabel from "src/components/forms/InputLabel";
import { useApp } from "../../AppContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import apiRoutes from "../../api/routes"
import Select from 'react-select'
import Swal from "sweetalert2";

const Create = () => {
    const { setStatus, setLoading, setMessage, setStatusCode } = useApp();

    const authUser = JSON.parse(localStorage.getItem("user") || "[]");
    // verification de permission
    const checkPermission = (name) => {
        return authUser?.permissions?.some(per => per.name == name);
    }

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

    const [clients, setClients] = useState([]);
    const currentClient = useRef([])

    useEffect(() => {
        console.log("Les clients chargés :", clients)
    }, [clients])

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

    useEffect(function () {
        // chargements des clients
        getClients();
    }, [])

    const navigate = useNavigate();

    useEffect(() => (
        console.log("Data acompte :", dataAcompte)
    ), [dataAcompte]);

    // submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Données de l\'acompte à créer :', dataAcompte);

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
            const response = await axiosInstance.post(apiRoutes.createAcompte, dataAcompte, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log('Réponse du serveur après création de la ocation :', response.data);

            setErrors({
                client_id: "",
                montant: "",
                preuve: "",
                commentaire: "",
            });

            setStatus('success');
            setMessage(`L'acompte a été crée avec succès!`);
            setStatusCode(200);

            return navigate("/acomptes/list");
        } catch (error) {
            console.log('Erreur lors de la création de l\'acompte :', error);
            let errMessage = '';

            if (error.response?.status === 422) {
                // Erreurs de validation
                setStatus('error');
                errMessage = `Des erreurs de validation sont survenues. Veuillez vérifier les champs : ${Object.values(error.response?.data?.errors).join(', ')}`;
                setErrors(error.response?.data?.errors);
            } else {
                errMessage = `Une erreur inattendue est survenue. Veuillez réessayer. (${error.response?.data?.error || 'Erreure lors de la création du type'})`;
            }

            setLoading(false);
            setStatus('error');
            setMessage(errMessage);
            setStatusCode(error.response?.status);
        }
    }

    return (
        <>
            <div className="row">
                <div className="col-md-2"></div>
                <div className="col-md-8">
                    {checkPermission("acompte.list") &&
                        <LinkButton route={"/acomptes/list"}>
                            <CIcon className='' icon={cilList} /> Liste des acomptes
                        </LinkButton>
                    }

                    <Card>
                        <form onSubmit={(e) => handleSubmit(e)}>
                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="client"
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
                                        label: `${client.nom}`,
                                    }))}
                                    value={clients
                                        .map((client) => ({
                                            value: client.id,
                                            label: `${client.nom}`,
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
                                    text="La preuve du reglement"
                                    required={true} />
                                <input type="file" name="preuve"
                                    className="form-control" id="contrat"
                                    required
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
                                    placeholder="Laissez un commentaire ...."
                                    onChange={(e) => setDataAcompte({ ...dataAcompte, commentaire: e.target.value })}></textarea>
                                {errors.commentaire && <span className="text-danger">{errors.commentaire}</span>}
                            </div>

                            {checkPermission("acompte.create") &&
                                <div className="mt-3">
                                    <CustomButton newClass={'_btn-dark'} type="submit"> <CIcon icon={cilSend} /> Enregistrer </CustomButton>
                                </div>
                            }
                        </form>
                    </Card>
                    <br /><br /><br />
                </div>
                <div className="col-md-2"></div>
            </div>
        </>
    )
}

export default Create;