import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import { cibAddthis, cilCheckCircle, cilDelete, cilDialpad, cilList, cilPencil, cilTrash } from "@coreui/icons";
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

const List = () => {
    const { setStatus, setLoading, setMessage, setStatusCode, modalVisible, setModalVisible, modalTitle, setModalTitle, modalBody, setModalBody } = useApp();

    const navigate = useNavigate();

    const allPers = JSON.parse(localStorage.getItem("all_permissions") || "[]");
    const currentUser = JSON.parse(localStorage.getItem("user") || "[]");

    const [roles, setRoles] = useState([]);

    const [allPermissions, setAllPermissions] = useState([]);
    const submitFunction = useRef(() => { });
    const [currentRole, setCurrentRole] = useState({});
    const [actionText, setActionText] = useState("Enregistrer");

    const [searchTerm, setSearchTerm] = useState("");
    const [searchRoleTerm, setSearchRoleTerm] = useState("");

    const [modalPermissionsVisible, setModalPermissionsVisible] = useState(false);

    const getRoles = useCallback(async function () {
        try {
            console.log(`La route : ${apiRoutes.allRole}`)
            const response = await axiosInstance.get(apiRoutes.allRole)

            setRoles(response?.data);

            console.log(`Tous les roles : ${response.data.length}`)

            setStatus('success');
            setStatusCode(response.status);
            setMessage('Liste des rôles chargée avec succès!');

            return response.data;
        } catch (error) {
            setStatus('error');
            setStatusCode(error.response?.status);
            setMessage('Erreure lors du chargement des rôles!!');
        }
    }, [])

    useEffect(() => {
        getRoles();
    }, [])


    // formattage des permissions pour les afficher dans le modal de modification d'un rôle
    useEffect(() => {
        setAllPermissions(allPers.map(permission => ({
            id: permission.id,
            name: permission.name,
            description: permission.description,
            checked: currentRole?.permissions?.some(p => p.name === permission.name) || false
        })))

        console.log(`setAllPermissions role updated `)
    }, [currentRole]);

    useEffect(() => {
        // actualiser les données du rôle à modifier pour les afficher dans le modal de modification
        setDataRole({ name: currentRole?.name || '', permissions: currentRole?.permissions || [] });

        console.log(`setDataRole updated`)
        console.log(`Data current Role permissions updated `)
    }, [currentRole]);

    // 
    const [dataRole, setDataRole] = useState({ name: '', permissions: allPermissions.filter(p => p.checked) });
    const [errors, setErrors] = useState({ name: '', permissions: '' });

    // Call DataTable
    useDataTable('myTable', roles);

    useEffect(() => {
        setAllPermissions(allPers.map(permission => ({
            id: permission.id,
            name: permission.name,
            description: permission.description,
            checked: currentRole?.permissions?.some(p => p.name === permission.name) || false
        })))
    }, [!searchTerm, !searchRoleTerm])

    // chargement des rôles
    useEffect(function () {
        setStatus('success');
        setStatusCode(200);
        setMessage('Liste des rôles chargée avec succès!');
    }, [])

    // verification de permission
    const checkPermission = (name) => {
        return currentUser?.permissions?.some(per => per.name == name);
    }

    // rechercher une permission dans la liste des permissions d'un rôle
    const filteredAllPermissions = allPermissions.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRolePermissions = currentRole?.permissions?.filter(permission =>
        permission.name.toLowerCase().includes(searchRoleTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchRoleTerm.toLowerCase())
    );

    // Afficher les permissions d'un role
    const showPermissions = (role) => {

        setCurrentRole(role);

        setModalPermissionsVisible(true);
        setModalTitle(`Liste des permissions du rôle ## ${role.name} ##`);
    }

    /**
     * Modification du rôle d'un utilisateur
     */
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setStatus(null);

        try {
            const response = await axiosInstance.put(apiRoutes.updateRole(currentRole?.id), dataRole);

            console.log('Rôle modifié avec succès !');
            setErrors({ name: '', permissions: '' });

            getRoles(); // actualiser la liste des rôles
            setModalVisible(false);
            setStatus('success');
            setMessage(`Le rôle ${currentRole?.name} a été modifié avec succès!`);
            setStatusCode(response.status);

            return navigate("/roles/list");
        } catch (error) {
            setLoading(false);
            setStatus('error');
            setStatusCode(error.response?.status);

            let errorMessage = '';
            if (error.response?.status === 422) {
                errorMessage = `Erreure de validation lors de la modification du rôle ${currentRole?.name || 'inconnu'} : ${JSON.stringify(error.response?.data?.errors)}`;
                setMessage(errorMessage);
                setErrors(error.response?.data?.errors || { name: '', permissions: '' });
            } else {
                console.error('Erreur:', error);
                alert('Une erreur est survenue');
            }
        }
    }

    // modifier un rôle
    const updateRole = (e, role) => {
        e.preventDefault();

        setCurrentRole(role);

        setModalVisible(true);
        setModalTitle(`Modifier le rôle ## ${role.name} ##`);

        // preciser la fonction de submit du modal
        submitFunction.current = handleUpdateSubmit;

        // preciser le text du bouton d'action du modal
        setActionText("Modifier le rôle")
    }

    /**
     * Deleting a role
     */
    const deleteRole = async (e, role) => {
        e.preventDefault();

        ConfirmAlert({
            title: `Voulez-vous vraiment supprimer le rôle ${role.name || role.email} ?`,
            confirmButtonText: "Supprimer",
            denyButtonText: "Annuler",
            next: async () => {
                try {
                    setLoading(true);
                    setStatus(null);
                    const response = await axiosInstance.delete(apiRoutes.deleteRole(role?.id));

                    console.log('Rôle supprimé avec succès !');

                    const newRoles = await getRoles(); // actualiser la liste des rôles
                    console.log(`Rôles après suppression : ${JSON.stringify(newRoles)}`)
                    setRoles(newRoles);
                    setModalVisible(false);
                    setStatus('success');
                    setMessage(`Le rôle ${role.name || role.email} a été supprimé avec succès!`);
                    setStatusCode(response.status);

                    return navigate("/roles/list");
                } catch (error) {
                    setLoading(false);
                    setStatus('error');
                    setStatusCode(error.response?.status);

                    setMessage(`Erreure lors de la suppression du rôle ${role.name || role.email} : ${error.response?.data?.message || 'Une erreur est survenue'}`);
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
                                                {checkPermission("role.edit") && <li><a className="dropdown-item text-warning" onClick={(e) => updateRole(e, role)} ><CIcon className='me-2' icon={cilPencil} /> Modifier</a></li>}
                                                {checkPermission("role.delete") && <li><a className="dropdown-item text-danger" onClick={(e) => deleteRole(e, role)}><CIcon className='me-2' icon={cilTrash} /> Supprimer</a></li>}
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>

                {/* Modal de modification */}
                <CModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    aria-labelledby="LiveDemoExampleLabel"
                >
                    <form onSubmit={(e) => handleUpdateSubmit(e)}>
                        <CModalHeader>
                            <CModalTitle >{modalTitle || 'Modal par défaut'}</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
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
                                        id="name" placeholder={`Ex: ${currentRole?.name}`}
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
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="warning" onClick={() => setModalVisible(false)}>
                                <CIcon icon={cilDelete} /> Fermer
                            </CButton>
                            <CButton color="dark" type="submit"> <CIcon icon={cilCheckCircle} /> {actionText}</CButton>
                        </CModalFooter>
                    </form>
                </CModal>

                {/* Modal des permissions */}
                <CModal
                    visible={modalPermissionsVisible}
                    onClose={() => setModalPermissionsVisible(false)}
                    aria-labelledby="LiveDemoExampleLabel"
                >
                    <CModalHeader>
                        <CModalTitle >{modalTitle || 'Modal par défaut'}</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <div className="mb-3">
                            <input type="text" className="form-control rounded borded shadow my-2"
                                placeholder="Faire une rechercher ..."
                                onChange={(e) => setSearchRoleTerm(e.target.value)} />

                            <ol className="list-group list-group-numbered">
                                {
                                    filteredRolePermissions?.map((permission, key) => (
                                        <li key={key} className="list-group-item">{permission.description} - ({permission.name})</li>
                                    ))
                                }
                            </ol>
                        </div>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="warning" onClick={() => setModalPermissionsVisible(false)}>
                            <CIcon icon={cilDelete} /> Fermer
                        </CButton>
                    </CModalFooter>
                </CModal>
            </Card>
        </>
    )
}

export default List;