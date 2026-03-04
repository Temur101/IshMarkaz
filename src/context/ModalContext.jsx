import { createContext, useContext, useState } from 'react';
import { JobCreationModal } from '../components/ui/JobCreationModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [jobModalData, setJobModalData] = useState(null);

    const openJobModal = (initialData = null) => {
        setJobModalData(initialData);
        setIsJobModalOpen(true);
    };

    const closeJobModal = () => {
        setIsJobModalOpen(false);
        setJobModalData(null);
    };

    return (
        <ModalContext.Provider value={{ isJobModalOpen, openJobModal, closeJobModal, jobModalData }}>
            {children}
            <JobCreationModal
                isOpen={isJobModalOpen}
                onClose={closeJobModal}
                initialData={jobModalData}
            />
        </ModalContext.Provider>
    );
};
