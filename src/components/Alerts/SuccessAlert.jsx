import Swal from 'sweetalert2'

const SuccessAlert = ({ text }) => {
    return Swal.fire({
        title: "Opération réussie! 😇",
        text: text,
        icon: "success"
    });
}

export default SuccessAlert;