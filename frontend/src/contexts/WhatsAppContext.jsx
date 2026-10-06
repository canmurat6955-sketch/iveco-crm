import React, { createContext, useContext, useState, useEffect } from 'react';
import WhatsAppActionModal from '../components/CRM/WhatsAppActionModal';

const WhatsAppContext = createContext(null);

export function WhatsAppProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    customer: null,
    vehicleTitle: '',
    interestId: null,
    defaultStatus: 'offer_given',
    defaultMessage: '',
    onSuccess: null,
  });

  const openWhatsAppModal = ({
    customer,
    vehicleTitle = '',
    interestId = null,
    defaultStatus = 'offer_given',
    defaultMessage = '',
    onSuccess = null
  }) => {
    // If customer is just a phone string or object without structure, normalize it
    let normCustomer = customer;
    if (typeof customer === 'string') {
      normCustomer = { phone: customer, company_name: '' };
    } else if (!customer) {
      normCustomer = { phone: '', company_name: '' };
    }

    setModalState({
      isOpen: true,
      customer: normCustomer,
      vehicleTitle,
      interestId,
      defaultStatus,
      defaultMessage,
      onSuccess
    });
  };

  const closeWhatsAppModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Global window event listener so any legacy code or utility can trigger it
  useEffect(() => {
    const handleCustomEvent = (e) => {
      if (e?.detail) {
        openWhatsAppModal(e.detail);
      }
    };
    window.addEventListener('open-whatsapp-modal', handleCustomEvent);
    return () => window.removeEventListener('open-whatsapp-modal', handleCustomEvent);
  }, []);

  return (
    <WhatsAppContext.Provider value={{ openWhatsAppModal, closeWhatsAppModal }}>
      {children}
      {modalState.isOpen && (
        <WhatsAppActionModal
          isOpen={modalState.isOpen}
          onClose={closeWhatsAppModal}
          customer={modalState.customer}
          vehicleTitle={modalState.vehicleTitle}
          interestId={modalState.interestId}
          defaultStatus={modalState.defaultStatus}
          onSuccess={(res) => {
            if (modalState.onSuccess) {
              modalState.onSuccess(res);
            }
          }}
        />
      )}
    </WhatsAppContext.Provider>
  );
}

export function useWhatsAppModal() {
  const context = useContext(WhatsAppContext);
  if (!context) {
    // Fallback if used outside provider: trigger via window event
    return {
      openWhatsAppModal: (params) => {
        window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: params }));
      },
      closeWhatsAppModal: () => {}
    };
  }
  return context;
}

export const useWhatsApp = useWhatsAppModal;
