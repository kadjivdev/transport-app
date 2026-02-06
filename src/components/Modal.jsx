import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import { useApp } from '../AppContext';
import CIcon from '@coreui/icons-react';
import { cilCheckCircle, cilDelete } from '@coreui/icons';

export const Modal = ({ actionText = "Enregistrer", handleSubmit }) => {
    const { modalVisible, setModalVisible, modalTitle, modalBody } = useApp();
    return (
        <>
            <CModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                aria-labelledby="LiveDemoExampleLabel"
            >
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
                    <CModalHeader>
                        <CModalTitle >{modalTitle || 'Modal par défaut'}</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        {modalBody || 'Contenu du modal par défaut'}
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="warning" onClick={() => setModalVisible(false)}>
                            <CIcon icon={cilDelete} /> Fermer
                        </CButton>
                        <CButton color="dark" type="submit"> <CIcon icon={cilCheckCircle} /> {actionText}</CButton>
                    </CModalFooter>
                </form>
            </CModal>
        </>
    )
}
