import React, { createContext, useContext, useState, useEffect } from 'react';
import CallOutcomeModal from '../components/CRM/CallOutcomeModal';

const CallContext = createContext(null);

export function CallProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    customer: null,
    onSuccess: null,
  });

  const openCallModal = ({ customer, onSuccess = null }) => {
    if (!customer) return;
    setModalState({
      isOpen: true,
      customer,
      onSuccess,
    });
  };

  const closeCallModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    // 1. Custom event listener
    const handleCustomEvent = (e) => {
      if (e?.detail) {
        openCallModal(e.detail);
      }
    };
    window.addEventListener('open-call-modal', handleCustomEvent);

    // 2. Global interception of tel: links
    const handleTelClick = (e) => {
      const link = e.target.closest('a[href^="tel:"]');
      if (!link) return;

      // Check if dataset contains customer info
      const customerId = link.getAttribute('data-customer-id');
      const customerName = link.getAttribute('data-customer-name');

      if (customerId) {
        // Delay opening modal slightly so the OS telephone prompt triggers first
        setTimeout(() => {
          openCallModal({
            customer: {
              id: parseInt(customerId, 10),
              company_name: customerName || 'Müşteri',
            },
          });
        }, 500);
      }
    };

    document.addEventListener('click', handleTelClick, true);

    return () => {
      window.removeEventListener('open-call-modal', handleCustomEvent);
      document.removeEventListener('click', handleTelClick, true);
    };
  }, []);

  return (
    <CallContext.Provider value={{ openCallModal, closeCallModal }}>
      {children}
      <CallOutcomeModal
        isOpen={modalState.isOpen}
        onClose={closeCallModal}
        customer={modalState.customer}
        onSuccess={modalState.onSuccess}
      />
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) {
    return {
      openCallModal: (detail) => {
        window.dispatchEvent(new CustomEvent('open-call-modal', { detail }));
      },
      closeCallModal: () => {},
    };
  }
  return ctx;
}
