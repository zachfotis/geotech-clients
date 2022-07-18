import { createContext, useState } from 'react';

const ModalContext = createContext();

// Component: ModalProvider
export const ModalProvider = ({ children }) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalId, setModalId] = useState(null);
  const [modalUserAnswer, setModalUserAnswer] = useState(null);

  function openModal(type, content, id) {
    setIsOpen(true);
    setModalType(type);
    setModalContent(content);
    setModalId(id);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function setStatus(status) {
    if (status === 'confirm') {
      setModalUserAnswer(true);
    } else {
      setModalUserAnswer(false);
      clearModal();
    }
  }

  function clearModal() {
    setModalType(null);
    setModalContent(null);
    setModalId(null);
    setModalUserAnswer(null);
    closeModal();
  }

  return (
    <ModalContext.Provider
      value={{
        modalIsOpen,
        openModal,
        closeModal,
        clearModal,
        modalContent,
        modalType,
        modalId,
        setModalUserAnswer,
        setStatus,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export default ModalContext;
