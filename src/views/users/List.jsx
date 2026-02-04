import { cibAddthis } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { useCallback, useEffect, useState } from "react";
import Card from "src/components/Card";
import LinkButton from "src/components/LinkButton";
import useDataTable from "src/hooks/useDataTable";
import axiosInstance from "../../api/axiosInstance";
import apiRoutes from "../../api/routes"
import { useApp } from "../../AppContext";
// import axios from "axios";

const List = () => {
    const { setStatus, setMessage, setStatusCode } = useApp();

    const [users, setUsers] = useState([]);

    const getUsers = useCallback(async function () {
        try {
            console.log(`La route : ${apiRoutes.allUser}`)
            const response = await axiosInstance.get(apiRoutes.allUser)
            console.log(`Les users : ${response}`)

            // setStatusCode(response.status);
            setUsers(response?.data);
        } catch (error) {
            setStatus('error');
            setStatusCode(response.status);
            setMessage('Erreure lors du chargement des utilisateures!!');
        }
    }, [])

    useEffect(function () {
        // chargement des users
        getUsers()
    }, [])


    // Call DataTable
    useDataTable('myTable');

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
                            <th scope="col">Crée le</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users.map((user, key) => (
                                <tr key={key}>
                                    <th scope="row">{key + 1}</th>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.createdAt}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </Card>
        </>
    )
}

export default List;