import { cilList, cilSend } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { useEffect, useState } from "react";
import Card from "src/components/Card";
import LinkButton from "src/components/LinkButton";
import InputLabel from "src/components/forms/InputLabel";
import { useApp } from "../../AppContext";
import { useNavigate } from "react-router-dom";
import apiRoutes from "../../api/routes"
import axiosInstance from "../../api/axiosInstance";
import CustomButton from "src/components/CustomButton";

const Create = () => {
    const { setStatus, setMessage, setStatusCode, setLoading } = useApp();

    const navigate = useNavigate();

    const allPers = JSON.parse(localStorage.getItem("all_permissions") || "[]");

    const [allPermissions, setAllPermissions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dataRole, setDataRole] = useState({ name: '', permissions: allPermissions?.filter(p => p.checked) });
    const [errors, setErrors] = useState({ name: '', permissions: '' });

    // formattage des permissions pour les afficher dans le modal de modification d'un rôle
    useEffect(() => {
        setAllPermissions(allPers.map(permission => ({
            id: permission.id,
            name: permission.name,
            description: permission.description,
            checked: false
        })));

        console.log(`setAllPermissions role updated `)
    }, []);

    /**
         * Création du rôle d'un utilisateur
         */
    const handleCreateSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setStatus(null);

        try {
            const response = await axiosInstance.post(apiRoutes.createRole, dataRole);

            console.log('Rôle créé avec succès !');
            setErrors({ name: '', permissions: '' });

            setStatus('success');
            setMessage(`Le rôle a été créé avec succès!`);
            setStatusCode(response.status);

            return navigate("/roles/list");
        } catch (error) {
            setLoading(false);
            setStatus('error');
            setStatusCode(error.response?.status);

            let errorMessage = '';
            if (error.response?.status === 422) {
                errorMessage = `Erreure de validation lors de la création du rôle : ${JSON.stringify(error.response?.data?.errors)}`;
                setMessage(errorMessage);
                setErrors(error.response?.data?.errors || { name: '', permissions: '' });
            } else {
                errorMessage = `Erreure lors de la crétion du rôle${JSON.stringify(error.response?.data?.error)}`;
                setMessage(errorMessage);
                setErrors({ name: '', permissions: '' });
            }
        }
    }

    // rechercher une permission dans la liste des permissions d'un rôle
    const filteredAllPermissions = allPermissions.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="row">
                <div className="col-md-2"></div>
                <div className="col-md-8">
                    <LinkButton route={"/roles/list"}>
                        <CIcon className='' icon={cilList} /> Liste des rôles
                    </LinkButton>

                    <Card>
                        <form onSubmit={(e) => handleCreateSubmit(e)}>
                            <div className="mb-3">
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="name"
                                        text="Nom complet"
                                        required={true} />
                                    <input type="text"
                                        name="name"
                                        value={dataRole.name}
                                        className="form-control"
                                        id="name" placeholder={`Ex: Superviseur, Chauffeur, etc...`}
                                        onChange={(e) => setDataRole({ ...dataRole, name: e.target.value })}
                                        required />
                                    {errors.name && <span className="text-danger">{errors.name}</span>}
                                </div>

                                {/* les permissions */}
                                <InputLabel
                                    htmlFor="name"
                                    text="Les permissions"
                                    required={true} />

                                <div className="mb-3">
                                    {/* barre de recherche */}
                                    <input type="text" className="form-control rounded borded shadow my-2" placeholder="Faire une rechercher ..."
                                        onChange={(e) => setSearchTerm(e.target.value)} />

                                    <ul className="list-group">
                                        {
                                            (filteredAllPermissions).map((permission, key) => (
                                                <li key={key} className="list-group-item d-flex justify-content-between align-items-start">
                                                    <div className="">{permission.description} - ({permission.name})</div>
                                                    <input type="checkbox"
                                                        checked={permission.checked}
                                                        onChange={(e) => {
                                                            const updatedPermissions = [...allPermissions];
                                                            updatedPermissions[key].checked = e.target.checked;
                                                            setDataRole({ ...dataRole, permissions: updatedPermissions.filter(p => p.checked) });
                                                        }}
                                                    />
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                            </div>

                            <CustomButton newClass={'_btn-dark'} type="submit"> <CIcon icon={cilSend} /> Enregistrer </CustomButton>
                        </form>
                        <br /><br /><br />
                    </Card>
                </div>
                <div className="col-md-2"></div>
            </div>
        </>
    )
}

export default Create;