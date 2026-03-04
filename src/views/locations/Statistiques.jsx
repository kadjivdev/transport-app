import { cilCloudDownload, cilSend } from "@coreui/icons";

import CIcon from "@coreui/icons-react";
import { useCallback, useEffect, useState } from "react";
import Card from "src/components/Card";
import useDataTable from "src/hooks/useDataTable";
import axiosInstance from "../../api/axiosInstance";
import apiRoutes from "../../api/routes"
import { useApp } from "../../AppContext";
import InputLabel from "src/components/forms/InputLabel";
import { useNavigate } from "react-router-dom";
import CustomButton from "src/components/CustomButton";


const Statistiques = () => {
    const { setStatus, setLoading, setMessage, setStatusCode } = useApp();

    const navigate = useNavigate();

    const [clients, getClients] = useState([]);
    const [locations, setLocations] = useState([]);
    // 
    const [dates, setDates] = useState({
        date: '',
        debut: '',
        fin: '',
    });

    useEffect(() => {
        console.log("The dates : ", dates)
    }, [dates])

    // Gestion des totaux
    const [totalAmount, setTotalAmount] = useState(0);
    const [resteAregler, setResteAregler] = useState(0);
    const [regler, setRegler] = useState(0);
    const [depenseAmount, setDepenseAmount] = useState(0);

    // les locations
    const getLocations = useCallback(async function () {
        try {
            const response = await axiosInstance.post(apiRoutes.locationStatistique, {})

            let data = response.data
            console.log("les datas après getLocations :", data)
            setLocations(data.locations)

            // synchronisation des totaux
            setTotalAmount(data?.totaux?.total_amount);
            setResteAregler(data?.totaux?.total_reste_a_regler);
            setRegler(data?.totaux?.total_regler);
            setResteAregler(data?.totaux?.total_reste_a_regler);
            setDepenseAmount(data?.totaux?.total_depense_amount);

            setStatus('success');
            dates.date ?
                setMessage(`Locations éffectuées pour la date du ${dates.date}`) :
                setMessage(`Locations éffectuées entre ${dates.debut} a ${dates.fin}`)
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

    // initialisation des données
    useEffect(function () {
        // chargements des clients
        getClients();
        //chargmeents des locations
        getLocations();
    }, [])

    // Call DataTable
    useDataTable('myTable', locations);

    // submit form
    const handleFilter = async (e) => {
        e.preventDefault();

        console.log('Données du filtre :', dates);
        setLoading(true);
        setStatus(null);

        try {

            const response = await axiosInstance.post(apiRoutes.locationStatistique, { dates });

            let data = response.data
            setLocations(data.locations)

            console.log("Les locations filtrées :", JSON.stringify(data.locations.length))

            setStatus('success');
            dates.date ?
                setMessage(`Locations éffectuées pour la date du ${dates.date}`) :
                setMessage(`Locations éffectuées entre ${dates.debut} a ${dates.fin}`)
            setStatusCode(200);

            // synchronisation des totaux
            setTotalAmount(data?.totaux?.total_amount);
            setRegler(data?.totaux?.total_regler);
            setResteAregler(data?.totaux?.total_reste_a_regler);
            setDepenseAmount(data?.totaux?.total_depense_amount);

            return navigate("/locations/statistiques");
        } catch (error) {
            console.log('Erreur lors de la modification de la location :', error);
            let errMessage = '';

            if (error.response?.status === 422) {
                // Erreurs de validation
                errMessage = `Des erreurs de validation sont survenues. Veuillez vérifier les champs `;
                setErrors(error.response?.data?.errors);
            } else {
                errMessage = `Une erreur inattendue est survenue. Veuillez réessayer. (${error.response?.data?.error || 'Erreure survenue'})`;
            }

            console.log(errMessage)
            setLoading(false);
            setStatus('error');
            setMessage(errMessage);
            setStatusCode(error.response?.status);
        }
    }

    return (
        <>
            <Card>
                <div className="row d-flex justify-content-center">
                    <div className="col-6">
                        <form onSubmit={(e) => handleFilter(e)} className="border shadow rounded p-3">
                            {/* Journalière */}
                            <div className="row">
                                <div className="col-12">
                                    <h5 className=""> <span className="badge bg-light border rounded shadow text-dark">Locations journalières</span> </h5>
                                    <div className="mb-3">
                                        <InputLabel
                                            htmlFor="date"
                                            text="Date" />
                                        <input type="date"
                                            name="debut"
                                            className="form-control"
                                            onChange={(e) => setDates({ ...dates, date: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Périodique */}
                            <h5 className=""> <span className="badge bg-light border rounded shadow text-dark">Locations périodiques</span> </h5>
                            <div className="row">
                                <div className="col-6">
                                    <div className="mb-3">
                                        <InputLabel
                                            htmlFor="debut"
                                            text="Date de debut" />
                                        <input type="date"
                                            name="debut"
                                            className="form-control"
                                            onChange={(e) => setDates({ ...dates, debut: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="mb-3">
                                        <InputLabel
                                            htmlFor="fin"
                                            text="Date de fin" />
                                        <input type="date"
                                            name="fin"
                                            className="form-control"
                                            onChange={(e) => setDates({ ...dates, debut: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="">
                                <CustomButton newClass={'_btn-dark'} type="submit"> <CIcon icon={cilSend} /> Enregistrer </CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
                <br />

                <h5 className="">
                    Montant total : <span className="badge bg-light border rounded shadow text-dark">{totalAmount}</span> |
                    Reglé : <span className="badge bg-light border rounded shadow text-success">{regler}</span> |
                    Dette : <span className="badge bg-light border rounded shadow text-danger">{resteAregler}</span> |
                    Montant depensé : <span className="badge bg-light border rounded shadow text-dark">{depenseAmount}</span>
                </h5>

                <table className="table table-striped bg-transparent" id="myTable">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Reference</th>
                            <th scope="col">Client</th>
                            <th scope="col">Type</th>
                            <th scope="col">Date</th>
                            <th scope="col">Montant</th>
                            <th scope="col">Réglé</th>
                            <th scope="col">Reste</th>
                            <th scope="col">Depense</th>
                            <th scope="col">Contrat</th>
                            <th scope="col">Inserée le</th>
                            <th scope="col">Inserée par</th>
                            <th scope="col">Validée le</th>
                            <th scope="col">Validée par</th>
                            <th scope="col">Commentaire</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            locations.length > 0 ? locations.map((location, key) => (
                                <tr key={key} id={`row-${location.id}`}>
                                    <th scope="row">{key + 1}</th>
                                    <td><span className="badge bg-light shadow border rounded text-dark"> {location.reference}</span></td>
                                    <td><span className="">{`${location.client?.nom} - ${location.client?.prenom}`}</span></td>
                                    <td>{location.type?.libelle || '---'}</td>
                                    <td>{location.date_location || '---'}</td>
                                    <td><span className="badge bg-light border rounded shadow text-success" readOnly>{location.montant} </span></td>
                                    <td><span className="badge bg-light border rounded shadow text-success" readOnly>{location.regle} </span></td>
                                    <td><span className="badge bg-light border rounded shadow text-danger" readOnly>{location.reste} </span></td>
                                    <td><span className="badge bg-light border rounded shadow text-danger" readOnly>{location.depenseAmount}</span></td>
                                    <td>{location.contrat ? <a href={location.contrat} target="_blank" className="btn btn-sm shadow text-dark"><CIcon icon={cilCloudDownload} /></a> : '---'}</td>
                                    <td>{location.createdAt || '---'}</td>
                                    <td>{location.createdBy?.name || '---'}</td>
                                    <td>{location.validatedAt || '---'}</td>
                                    <td>{location.validatedBy?.name || '---'}</td>
                                    <td><textarea className="form-control" rows="2" placeholder={location.commentaire || '---'}></textarea></td>
                                </tr>
                            )) : <tr><td colSpan="15" className="text-center">Aucune location n'a été trouvée</td></tr>
                        }
                    </tbody>
                </table>
            </Card>
        </>
    )
}

export default Statistiques;