import DataTable from 'datatables.net-bs5';

// CSS principal
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css';
import 'datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css';

// JS DataTables avec intégration Bootstrap
import 'datatables.net-buttons-bs5';
import 'datatables.net-responsive-bs5';

// Plugins boutons
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons/js/buttons.colVis';

// dépendances Excel / PDF
import jszip from 'jszip';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// JSZip est utilisé par Excel
window.JSZip = jszip;

pdfMake.vfs = pdfFonts.vfs; // ✅ not pdfFonts.pdfMake.vfs

import 'datatables.net-responsive';

import { useEffect, useRef } from 'react';

const useDataTable = (tableId = 'myTable', data = []) => {
    const tableRef = useRef(null);

    useEffect(() => {
        if (!data.length) return;

        const tableElement = document.getElementById(tableId);
        if (!tableElement) return;

        // destroy previous instance
        if (tableRef.current) {
            tableRef.current.destroy();
            tableRef.current = null;
        }

        tableRef.current = new DataTable(`#${tableId}`, {
            pagingType: 'full_numbers',
            responsive: true,
            dom: `
                <'dt-top d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-2'
                    <'dt-search mb-2 mb-sm-0'f>
                    <'dt-buttons text-sm-end'B>
                >
                <'table-responsive'tr>
                <'d-flex flex-column flex-sm-row justify-content-between align-items-center mt-2'
                    i
                    p
                >
            `,
            pageLength: 15,
            order: [[0, 'asc']],
            buttons: [
                { extend: 'copy', className: 'btn btn-sm btn-dark', text: '<i class="fas fa-copy"></i> Copier' },
                { extend: 'excel', className: 'btn btn-sm btn-success', text: '<i class="fas fa-file-excel"></i> Excel' },
                { extend: 'pdf', className: 'btn btn-sm btn-danger', text: '<i class="fas fa-file-pdf"></i> PDF' },
                { extend: 'print', className: 'btn btn-sm btn-warning', text: '<i class="fas fa-print"></i> Imprimer' }
            ],
            language: {
                decimal: ",",
                thousands: " ",
                emptyTable: "Aucune donnée disponible",
                info: "Affichage de _START_ à _END_ sur _TOTAL_ lignes",
                infoEmpty: "Affichage de 0 à 0 sur 0 lignes",
                infoFiltered: "(filtré de _MAX_ lignes au total)",
                lengthMenu: "Afficher _MENU_ lignes",
                loadingRecords: "Chargement...",
                processing: "Traitement...",
                search: "Rechercher :",
                zeroRecords: "Aucun enregistrement trouvé",
                paginate: { first: "<<", last: ">>", next: "Suivant", previous: "Précédent" },
                aria: {
                    sortAscending: ": activer pour trier par ordre croissant",
                    sortDescending: ": activer pour trier par ordre décroissant"
                },
                buttons: { copy: "Copier", excel: "Exporter Excel", pdf: "Exporter PDF", print: "Imprimer", colvis: "Visibilité colonnes" }
            }
        });

        return () => {
            if (tableRef.current) {
                tableRef.current.destroy();
                tableRef.current = null;
            }
        };
    }, [tableId, data]);

    return tableRef; // 🔥 expose it
};

export default useDataTable;

