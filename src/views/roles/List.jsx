import { cibAddthis, cilDialpad, cilLink, cilList, cilPencil, cilTrash } from "@coreui/icons";
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

const List = () => {
    const { setStatus, setLoading, setMessage, setStatusCode, modalVisible, setModalVisible, setModalTitle, setModalBody } = useApp();

    const navigate = useNavigate();

    const roles = JSON.parse(localStorage.getItem("all_roles") || "[]");
    const all_pers = JSON.parse(localStorage.getItem("all_permissions") || "[]");


    const [allPermissions, setAllPermissions] = useState([]);
    const submitFunction = useRef(() => { });
    const currentRole = useRef(null);
    const [actionText, setActionText] = useState("Enregistrer");

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredPermissions, setFilteredPermissions] = useState([]);

    useEffect(() => {
        setAllPermissions(
            all_pers.map(permission => ({
                id: permission.id,
                name: permission.name,
                description: permission.description,
                checked: currentRole.current?.permissions?.some(p => p.id === permission.id) || false
            }))
        );
    }, [all_pers, currentRole.current]);

    useEffect(() => {
        if (currentRole.current?.permissions) {
            setFilteredPermissions(currentRole.current.permissions);
        }
    }, [currentRole.current]);

    // 
    const [dataRole, setDataRole] = useState({ name: '', permissions: [] });
    const [errors, setErrors] = useState({ name: '' });

    // Call DataTable
    useDataTable('myTable', roles);

    useEffect(function () {
        // chargement des roles
        setStatus('success');
        setStatusCode(200);
        setMessage('Liste des rôles chargée avec succès!');
    }, [])

    useEffect(() => {
        setDataRole({ name: currentRole.current?.name || '' });
    }, [currentRole.current])


    // rechercher une permission dans la liste des permissions d'un rôle
    const searchPermission = (e) => {
        const value = e.target.value.toLowerCase();

        console.log(`Search term : ${value}`)

        const filtered = currentRole.current?.permissions?.filter(permission =>
            permission.name.toLowerCase().includes(value) ||
            permission.description.toLowerCase().includes(value)
        );

        setFilteredPermissions(filtered);
    };


    // Afficher les permissions d'un role
    const showPermissions = (role) => {

        currentRole.current = role;

        setFilteredPermissions(role.permissions || []); // réinitialiser la liste filtrée avant de faire le filtrage

        setModalVisible(true);
        setModalTitle(`Liste des permissions du rôle ## ${role.name} ##`);

        setModalBody(
            <div className="mb-3">
                <input type="text" className="form-control rounded borded shadow my-2" placeholder="Faire une rechercher ..."
                    // value={searchTerm}
                    onChange={(e) => searchPermission(e)} />
                <ul className="list-group">
                    {
                        role.permissions.map((permission, key) => (
                            <li key={key} className="list-group-item">{permission.description} - ({permission.name})</li>
                        ))
                    }
                </ul>
            </div>
        )
        // 
        setActionText("")
    }

    /**
     * Modification du rôle d'un utilisateur
     */
    const handleUpdateSubmit = async () => {

        setLoading(true);
        setStatus(null);

        try {
            const response = await axiosInstance.put(apiRoutes.updateUser(currentUser.current?.id), dataUser);

            console.log('Utilisateur modifié avec succès !');
            setErrors({ name: '', email: '', password: '', password_confirmation: '' });

            getUsers(); // actualiser la liste des utilisateurs
            setModalVisible(false);
            setStatus('success');
            setMessage(`L'utilisateur ${currentUser.current?.name || currentUser.current?.email} a été modifié avec succès!`);
            setStatusCode(response.status);

            return navigate("/roles/list");
        } catch (error) {
            setLoading(false);
            setStatus('error');
            setStatusCode(error.response?.status);

            let errorMessage = '';
            if (error.response?.status === 422) {
                errorMessage = `Erreure de validation lors de la modification de l'utilisateur ${currentUser.current?.name || currentUser.current?.email} : ${JSON.stringify(error.response?.data?.errors)}`;
                setMessage(errorMessage);
                setErrors(error.response?.data?.errors || { name: '', email: '', password: '', password_confirmation: '' });
            } else {
                console.error('Erreur:', error);
                alert('Une erreur est survenue');
            }
        }
    }

    // handle change
    const handleChange = (e) => {
        const { name, value } = e.target;
        dataUser[name] = value;
    }

    // modifier un rôle
    const updateRole = (e, role) => {
        e.preventDefault();

        currentRole.current = role;

        setModalVisible(true);
        setModalTitle(`Modifier le rôle ## ${role.name} ##`);

        setModalBody(
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
                        id="name" placeholder={`Ex: ${role.name}`}
                        onChange={(e) => handleChange(e)}
                        required />
                    {errors.name && <span className="text-danger">{errors.name}</span>}
                </div>

                {/* les permissions */}
                <InputLabel
                    htmlFor="name"
                    text="Les permissions"
                    required={true} />
                <div className="mb-3">
                    <input type="text" className="form-control rounded borded shadow my-2" placeholder="Faire une rechercher ..."
                        // value={searchTerm}
                        onChange={(e) => searchPermission(e)} />

                    <ul className="list-group ">
                        {
                            allPermissions.map((permission, key) => (
                                <li key={key} className="list-group-item d-flex justify-content-between align-items-start">
                                    <div className="">{permission.description} - ({permission.name})</div>
                                    <input type="checkbox"
                                        name={`permission_${permission.id}`}
                                        id={`permission_${permission.id}`}
                                        checked={permission.checked}
                                        onChange={(e) => {
                                            const updatedPermissions = [...allPermissions];
                                            updatedPermissions[key].checked = e.target.checked;
                                            setAllPermissions(updatedPermissions);
                                        }}
                                    />
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
        )

        // preciser la fonction de submit du modal
        // submitFunction.current = handleUpdateSubmit;

        // preciser le text du bouton d'action du modal
        setActionText("Modifier le rôle")
    }

    /**
     * Deleting a user
     */
    const deleteUser = async (e, user) => {
        e.preventDefault();

        ConfirmAlert({
            title: `Voulez-vous vraiment supprimer l'utilisateur ${user.name || user.email} ?`,
            confirmButtonText: "Supprimer",
            denyButtonText: "Annuler",
            next: async () => {
                try {
                    setLoading(true);
                    setStatus(null);
                    const response = await axiosInstance.delete(apiRoutes.deleteUser(user?.id));

                    console.log('Utilisateur supprimé avec succès !');

                    const newUsers = await getUsers(); // actualiser la liste des utilisateurs
                    console.log(`Users après suppression : ${JSON.stringify(newUsers)}`)
                    setUsers(newUsers);
                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`L'utilisateur ${user.name || user.email} a été supprimé avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/users/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la suppression de l'utilisateur ${user.name || user.email} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
                    console.log(`The error response : ${JSON.stringify(error.response)}`)
                }
            }
        });
    };

    return (
        <>
            <Card>
                <LinkButton route={"/roles/create"}>
                    <CIcon className='' icon={cibAddthis} /> Ajouter un rôle
                </LinkButton>

                <table className="table table-striped bg-transparent" id="myTable">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Nom</th>
                            <th scope="col">Crée le</th>
                            <th scope="col">Permissions</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            roles.map((role, key) => (
                                <tr key={key} id={`row-${role.id}`}>
                                    <th scope="row">{key + 1}</th>
                                    <td>{role.name}</td>
                                    <td>{new Date(role.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className="badge bg-light border border-2 border-dark text-dark mr-2 shadow btn"
                                            onClick={() => showPermissions(role)}><CIcon className="text-dark" icon={cilList} /> <strong>{role.permissions?.length}</strong> </span>
                                    </td>
                                    <td>
                                        <div className="dropdown">
                                            <a className="btn btn-dark w-100 dropdown-toggle btn-sm" role="button" data-bs-toggle="dropdown">
                                                <CIcon className='me-2' icon={cilDialpad} /> Gérer
                                            </a>
                                            <ul className="dropdown-menu w-100">
                                                <li><a className="dropdown-item text-warning" onClick={(e) => updateRole(e, role)} ><CIcon className='me-2' icon={cilPencil} /> Modifier</a></li>
                                                <li><a className="dropdown-item text-danger" onClick={(e) => deleteRole(e, role)}><CIcon className='me-2' icon={cilTrash} /> Supprimer</a></li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>

                {/*  */}
                <Modal
                    visible={modalVisible}
                    actionText={actionText}
                    handleSubmit={submitFunction.current}></Modal>
            </Card>
        </>
    )
}

export default List;