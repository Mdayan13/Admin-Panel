import React, { createContext, useState, useCallback } from 'react';

// Create the Alert Context
export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Generate a unique ID for each alert
  const generateId = () => `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add a new alert
  const addAlert = useCallback((message, type = 'info', timeout = 5000) => {
    const id = generateId();
    
    // Add the new alert to the alerts array
    setAlerts(prevAlerts => [...prevAlerts, { id, message, type }]);
    
    // Remove the alert after the specified timeout
    if (timeout > 0) {
      setTimeout(() => removeAlert(id), timeout);
    }
    
    return id;
  }, []);

  // Remove an alert by ID
  const removeAlert = useCallback(id => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  }, []);

  // Helper functions for different alert types
  const success = useCallback((message, timeout) => addAlert(message, 'success', timeout), [addAlert]);
  const error = useCallback((message, timeout) => addAlert(message, 'error', timeout), [addAlert]);
  const warning = useCallback((message, timeout) => addAlert(message, 'warning', timeout), [addAlert]);
  const info = useCallback((message, timeout) => addAlert(message, 'info', timeout), [addAlert]);

  // Context value
  const value = {
    alerts,
    addAlert,
    removeAlert,
    success,
    error,
    warning,
    info
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};