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

const StatistiquesDate = () => {
    const { setStatus, setLoading, setMessage, setStatusCode } = useApp();

    const navigate = useNavigate();

    const [locations, setLocations] = useState([]);
    // 
    const [data, setData] = useState({});
    const [errors, setErrors] = useState('')

    useEffect(() => {
        console.log("The data : ", data)
    }, [data])

    // Gestion des totaux
    const [totalAmount, setTotalAmount] = useState(0);
    const [resteAregler, setResteAregler] = useState(0);
    const [regler, setRegler] = useState(0);
    const [depenseAmount, setDepenseAmount] = useState(0);

    // initialisation des données
    // useEffect(function () {
    //     //faire un filtre initiale
    //     if (locations.length > 0) {
    //         setLocations({ ...locations })
    //     } else {
    //         handleFilter();
    //     }
    // }, [])

    useEffect(function () {
        console.log("Locations updated : ", locations)
    }, [locations])

    // Call DataTable
    useDataTable('myTable', locations);

    // submit form
    const handleFilter = async (e = null) => {
        e?.preventDefault();

        console.log('Données du filtre :', data);
        setLoading(true);
        setStatus(null);

        try {
            const response = await axiosInstance.post(apiRoutes.locationStatistiqueDate, data);
            let responseData = response.data

            // set locations
            setLocations(responseData.locations || [])
            console.log("Les locations filtrées :", responseData.locations)

            setStatus('success');
            setMessage(`Locations éffectuées pour la date du ${data.date}`);
            setStatusCode(200);

            // synchronisation des totaux
            setTotalAmount(responseData?.totaux?.total_amount);
            setRegler(responseData?.totaux?.total_regler);
            setResteAregler(responseData?.totaux?.total_reste_a_regler);
            setDepenseAmount(responseData?.totaux?.total_depense_amount);

            return navigate("/locations/statistiques-date");
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
                    {/* Journalière */}
                    <div className="col-6">
                        <form onSubmit={(e) => handleFilter(e)} className="border shadow rounded p-3">
                            {/* Journalière */}

                            <h5 className=""> <span className="badge bg-light border rounded shadow text-dark">Locations journalières</span> </h5>
                            <div className="mb-3">
                                <InputLabel
                                    htmlFor="date"
                                    text="Date"
                                    required />
                                <input type="date"
                                    name="debut"
                                    className="form-control"
                                    required
                                    onChange={(e) => setData({ date: e.target.value })} />
                            </div>

                            <div className="">
                                <CustomButton newClass={'_btn-dark'} type="submit">
                                    <CIcon icon={cilSend} /> Filtrer </CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
                <br />

                <h5 className="my-3">
                    Montant total : <span className="badge bg-light border rounded shadow text-dark">{totalAmount}</span> |
                    Reglé : <span className="badge bg-light border rounded shadow text-success">{regler}</span> |
                    Dette : <span className="badge bg-light border rounded shadow text-danger">{resteAregler}</span> |
                    Dépense effectuées : <span className="badge bg-light border rounded shadow text-dark">{depenseAmount}</span>
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
                            locations?.length > 0 ? (locations.map((location, key) => (
                                <tr key={location.id}>
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
                            ))) : <tr><td colSpan="15" className="text-center">Aucune location n'a été trouvée</td></tr>
                        }
                    </tbody>
                </table>

                <br /><br /><br /><br />
            </Card>
        </>
    )
}

export default StatistiquesDate;