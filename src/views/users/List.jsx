import { cibAddthis, cilCheckCircle, cilDelete, cilDialpad, cilLink, cilPencil, cilTrash } from "@coreui/icons";
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'

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
import Select from 'react-select'
import { useNavigate } from "react-router-dom";
import ConfirmAlert from "../../hooks/ConfirmAlert";

const List = () => {
    const { setStatus, setLoading, setMessage, setStatusCode, modalVisible, setModalVisible, modalTitle, setModalTitle, setModalBody } = useApp();
    // const { setStatus, setLoading, setMessage, setStatusCode, modalVisible, setModalVisible, modalTitle, setModalTitle, setModalBody } = useApp();

    const [modalUpdateVisible, setModalUpdateVisible] = useState(false)
    const navigate = useNavigate();

    const allRoles = JSON.parse(localStorage.getItem("all_roles") || "[]");

    const role_id = useRef(null);
    const submitFunction = useRef(() => { });
    const currentUser = useRef(null);
    const [users, setUsers] = useState([]);
    const [actionText, setActionText] = useState("Enregistrer");

    // 
    const [dataUser, setDataUser] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [errors, setErrors] = useState({ name: '', email: '', password: '', password_confirmation: '' });

    const getUsers = useCallback(async function () {
        try {
            console.log(`La route : ${apiRoutes.allUser}`)
            const response = await axiosInstance.get(apiRoutes.allUser)

            setUsers(response?.data);

            console.log(`Tous les utilisateurs : ${response.data.length}`)

            setStatus('success');
            setStatusCode(response.status);
            setMessage('Liste des utilisateurs chargée avec succès!');

            return response.data;
        } catch (error) {
            setStatus('error');
            setStatusCode(error.response?.status);
            setMessage('Erreure lors du chargement des utilisateures!!');
        }
    }, [])

    // Call DataTable
    useDataTable('myTable', users);

    useEffect(function () {
        // chargement des users
        getUsers()
    }, [])

    useEffect(() => {
        setDataUser({ name: currentUser.current?.name, email: currentUser.current?.email, password: '', password_confirmation: '' });
    }, [currentUser.current])

    /**
     * Affectation d'un rôle à un utilisateur
     */
    // handlesubmit
    const handleRoleAffectSubmit = async () => {

        setLoading(true);
        setStatus(null);

        try {
            const response = await axiosInstance.post(apiRoutes.affectRole, {
                user_id: currentUser.current?.id,
                role_id: role_id.current
            })

            setStatus('success');
            setMessage(`Le rôle a été affecté avec succès à l'utilisateur ${currentUser.current?.name || currentUser.current?.email}`);
            setStatusCode(response.status);
            setModalVisible(false);

            // actualiser la liste des utilisateurs
            getUsers();

            return navigate("/users/list");
        } catch (error) {
            setStatus('error');
            setStatusCode(error.response?.status);
            if (error.response?.status == 422) {
                setMessage(`Erreure de validation lors de l'affectation du rôle à l'utilisateur ${currentUser.current?.name || currentUser.current?.email} : ${JSON.stringify(error.response?.data?.errors)}`);
            }
            setMessage(`Erreure lors de l'affectation du rôle à l'utilisateur ${currentUser.current?.name || currentUser.current?.email}`);
        }
    }

    // affecter un rôle à un utilisateur
    const affectRole = (e, user) => {
        e.preventDefault();

        currentUser.current = user;
        setModalVisible(true);
        setModalTitle(`Affecter un rôle à l'utilisateur ## ${user.name || user.email} ##`);

        // preciser la fonction de submit du modal
        submitFunction.current = handleRoleAffectSubmit;

        console.log(`Selected user: ${user}`)
        console.log(`Current user: ${currentUser}`)

        let options = allRoles.map(role => ({ value: role.id, label: role.name }));
        setModalBody(
            <div className="mb-3">
                <Select
                    name="role_id"
                    options={options}
                    required={true}
                    onChange={(option) => role_id.current = option.value} // update state with id
                    placeholder="Selectionnez un rôle..." />
            </div>
        )

        // 
        setActionText("Affecter le rôle")
    }

    /**
     * Modification du rôle d'un utilisateur
     */
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

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

            return navigate("/users/list");
        } catch (error) {
            setLoading(false);
            setStatus('error');
            setStatusCode(error.response?.status);

            let errorMessage = '';
            if (error.response?.status === 422) {
                errorMessage = `Erreure de validation lors de la modification de l'utilisateur ${currentUser.current?.name || currentUser.current?.email} : ${JSON.stringify(error.response?.data?.errors)}`;
            } else {
                console.error('Erreur:', error);
                errorMessage = error.response?.data;
            }
            setMessage(errorMessage);
            setErrors(error.response?.data?.errors || { name: '', email: '', password: '', password_confirmation: '' });
        }
    }

    // handle change
    const handleChange = (e) => {
        const { name, value } = e.target;
        dataUser[name] = value;

        setDataUser((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    // modifier un rôle à un utilisateur
    const updateRole = (e, user) => {
        e.preventDefault();

        currentUser.current = user;
        setDataUser(user)

        setModalUpdateVisible(true);
        setModalTitle(`Modifier le rôle de l'utilisateur ## ${user.name || user.email} ##`);

        // console.log(`Data's user : ${JSON.stringify(dataUser)}`)

        // preciser la fonction de submit du modal
        // submitFunction.current = handleUpdateSubmit;

        // preciser le text du bouton d'action du modal
        setActionText("Modifier l'utilisateur")
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
                <LinkButton route={"/users/create"}>
                    <CIcon className='' icon={cibAddthis} /> Ajouter un utilisateur
                </LinkButton>

                <table className="table table-striped bg-transparent" id="myTable">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Nom</th>
                            <th scope="col">Email</th>
                            <th scope="col">Rôle</th>
                            <th scope="col">Crée le</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users.map((user, key) => (
                                <tr key={key} id={`row-${user.id}`}>
                                    <th scope="row">{key + 1}</th>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        {
                                            user.roles?.length > 0 ?
                                                user.roles.map((role, index) => (
                                                    <span key={index} className="m-1  bg-light text-dark border rounded">{role.name}</span>
                                                )) : '---'
                                        }
                                    </td>
                                    <td>{user.createdAt}</td>
                                    <td>
                                        <div className="dropdown">
                                            <a className="btn btn-dark w-100 dropdown-toggle btn-sm" role="button" data-bs-toggle="dropdown"
                                                disabled={user.id == 1}>
                                                <CIcon className='me-2' icon={cilDialpad} /> Gérer
                                            </a>
                                            <ul className="dropdown-menu w-100">
                                                <li><a className="dropdown-item btn-light" onClick={(e) => affectRole(e, user)}><CIcon className='me-2' icon={cilLink} /> Affecter un rôle</a></li>
                                                <li><a className="dropdown-item text-warning" onClick={(e) => updateRole(e, user)} ><CIcon className='me-2' icon={cilPencil} /> Modifier</a></li>
                                                <li><a className="dropdown-item text-danger" onClick={(e) => deleteUser(e, user)}><CIcon className='me-2' icon={cilTrash} /> Supprimer</a></li>
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

                {/* update modal */}
                <CModal
                    visible={modalUpdateVisible}
                    onClose={() => setModalUpdateVisible(false)}
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
                                        text="Nom & Prénom"
                                        required={true} />
                                    <input type="text"
                                        name="name"
                                        value={dataUser.name}
                                        className="form-control"
                                        id="name" placeholder={`Ex: ${dataUser.name}`}
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors.name && <span className="text-danger">{errors.name}</span>}
                                </div>
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="email"
                                        text="Email address"
                                        required={true} />
                                    <input type="email" name="email"
                                        className="form-control"
                                        value={dataUser.email}
                                        id="email" placeholder={`Ex: ${dataUser.email}`}
                                        onChange={(e) => handleChange(e)}
                                        required />
                                    {errors.email && <span className="text-danger">{errors.email}</span>}
                                </div>
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="password"
                                        text="Mot de passe"
                                        required={false} />
                                    <input type="password" name="password"
                                        className="form-control" id="password"
                                        placeholder="Ex : **************"
                                        onChange={(e) => handleChange(e)}
                                    />
                                    {errors.password && <span className="text-danger">{errors.password}</span>}
                                </div>
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        text="Confirmez le mot de passe"
                                        required={false} />
                                    <input type="password" name="password_confirmation" className="form-control" id="password_confirmation" placeholder="Ex : **************"
                                        onChange={(e) => handleChange(e)}
                                    />
                                    {errors.password && <span className="text-danger">{errors.password}</span>}
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
            </Card>
        </>
    )
}

export default List;