import { useEffect } from 'react';
import Swal from 'sweetalert2';
import { useApp } from '../../AppContext';

const LoadingAlert = () => {
    const { loading } = useApp();

    useEffect(() => {
        if (loading) {
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
        } else {
            Swal.close();
        }
    }, [loading]);

    return null;
};

export default LoadingAlert;
