import React, { createContext, useContext, useState } from 'react';

const PDFContext = createContext();

export const PDFProvider = ({ children }) => {
  const [downloadedPDFs, setDownloadedPDFs] = useState({});

  const addDownloadedPDF = (cotizacionId, path) => {
    setDownloadedPDFs(prev => ({
      ...prev,
      [cotizacionId]: path
    }));
  };

  const removeDownloadedPDF = (cotizacionId) => {
    setDownloadedPDFs(prev => {
      const updated = { ...prev };
      delete updated[cotizacionId];
      return updated;
    });
  };

  return (
    <PDFContext.Provider value={{ 
      downloadedPDFs, 
      addDownloadedPDF, 
      removeDownloadedPDF 
    }}>
      {children}
    </PDFContext.Provider>
  );
};

export const usePDF = () => useContext(PDFContext);
