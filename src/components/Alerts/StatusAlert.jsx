import { useEffect } from 'react';
import Swal from 'sweetalert2';
import { useApp } from '../../AppContext';//../AppContext.jsx

const StatusAlert = () => {
    const { status, message, statusCode, clearStatus } = useApp();

    
    useEffect(() => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',   // top-end, top-start, bottom-end, bottom-start
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
        if (status && message) {
            let icon = 'info';
            let title = 'Notification';

            if (status === 'success') {
                icon = 'success';
                title = 'Succès!';
            } else if (status === 'error') {
                icon = 'error';
                title = 'Erreur!';
            }

            Toast.fire({
                title,
                text: message,
                icon,
                // timer: 3000,
                timerProgressBar: true,
                didClose: () => {
                    clearStatus();
                }
            });
        }
    }, [status, message, statusCode, clearStatus]);

    return null;
};

export default StatusAlert;
