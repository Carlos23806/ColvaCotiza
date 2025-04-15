import React, { createContext, useContext, useRef } from 'react';
import FlashMessage, { showMessage } from 'react-native-flash-message';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const flashRef = useRef();

  const notify = ({ message, type = 'success', description }) => {
    showMessage({
      message,
      description,
      type,
      icon: type,
      duration: 4000,
      style: {
        padding: 20,
        height: 120
      },
      titleStyle: {
        marginTop: 20,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: description ? 5 : 0
      },
      textStyle: {
        fontSize: 14
      },
      iconProps: {
        size: 24,
        marginTop: 20
      }
    });
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <FlashMessage ref={flashRef} position="top" />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
