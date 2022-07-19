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

function Modal({ modalType, modalContent, confirmFn, modalIsOpen, closeModal }) {
  return (
    <ReactModal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} contentLabel={modalType}>
      <div className="modal-content">
        <div className="title-bar">{modalType}</div>
        <div className="main-content">
          <h2 className="modal-text">{modalContent}</h2>
          <div className="buttons">
            <button className="btn btn-error btn-sm" onClick={confirmFn}>
              Confirm
            </button>
            <button className="btn btn-ghost btn-sm" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </ReactModal>
  );
}

export default Modal;
