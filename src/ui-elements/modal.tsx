import React from 'react';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

interface IPropTypes {
  isModalOpen: boolean,
  onClose:()=>void ,
  title: string,
  renderItems: object
}


const ModalComponent = ({
  isModalOpen,
  onClose,
  title,
  renderItems
}: IPropTypes) => {
  return (
    <div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={onClose}
        style={customStyles}
        contentLabel={title}
        ariaHideApp={false}
      >
        {renderItems}
      </Modal>
    </div>
  )
}

export default ModalComponent;

