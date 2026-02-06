import Swal from "sweetalert2";

const ConfirmAlert = ({ title, confirmButtonText, denyButtonText,next }) => {
    Swal.fire({
        title: title || "Voulez-vous vraiment supprimer cet enregistrement ?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: confirmButtonText || "Supprimer",
        denyButtonText: denyButtonText || `Annuler`
    }).then((result) => {
        if (result.isConfirmed) {
            next();
        } else if (result.isDenied) {
            Swal.fire("Suppression annulée", "", "info");
        }
    });
}

export default ConfirmAlert;