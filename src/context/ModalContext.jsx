import { createContext, useContext, useState } from 'react';
import { JobCreationModal } from '../components/ui/JobCreationModal';
import { SupportModal } from '../components/ui/SupportModal';
import { AuthRequiredModal } from '../components/ui/AuthRequiredModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [jobModalData, setJobModalData] = useState(null);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const openJobModal = (initialData = null) => {
        setJobModalData(initialData);
        setIsJobModalOpen(true);
    };

    const closeJobModal = () => {
        setIsJobModalOpen(false);
        setJobModalData(null);
    };

    const openSupportModal = () => setIsSupportModalOpen(true);
    const closeSupportModal = () => setIsSupportModalOpen(false);

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    return (
        <ModalContext.Provider value={{
            isJobModalOpen, openJobModal, closeJobModal, jobModalData,
            isSupportModalOpen, openSupportModal, closeSupportModal,
            isAuthModalOpen, openAuthModal, closeAuthModal
        }}>
            {children}
            <JobCreationModal
                isOpen={isJobModalOpen}
                onClose={closeJobModal}
                initialData={jobModalData}
            />
            <SupportModal
                isOpen={isSupportModalOpen}
                onClose={closeSupportModal}
            />
            <AuthRequiredModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
            />
        </ModalContext.Provider>
    );
};
