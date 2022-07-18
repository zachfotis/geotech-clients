import { useContext } from 'react';
import ModalContext from '../../context/modal/ModalContext';
import ReactModal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    maxWidth: '500px',
    padding: '0',
  },
};

ReactModal.setAppElement(document.getElementById('root'));

function Modal() {
  let { modalIsOpen, closeModal, modalContent, modalType, setStatus } = useContext(ModalContext);

  return (
    <ReactModal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} contentLabel={modalType}>
      <div className="modal-content">
        <div className="title-bar">{modalType}</div>
        <div className="main-content">
          <h2 className="modal-text">{modalContent}</h2>
          <div className="buttons">
            <button
              className="btn btn-error btn-sm"
              onClick={() => {
                setStatus('confirm');
              }}
            >
              Confirm
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setStatus('cancel');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </ReactModal>
  );
}

export default Modal;
