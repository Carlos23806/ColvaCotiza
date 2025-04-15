export const pdfStyles = {
  colors: {
    primary: '#0b3d93',
    secondary: '#ffffff',
    text: '#000000',
    border: '#cccccc',
    background: '#f9f9f9',
  },
  css: `
    body { 
      font-family: 'Helvetica'; 
      padding: 20px;
      line-height: 1.6;
      color: #000000;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 200px;
      margin-bottom: 20px;
    }
    .title {
      color: #0b3d93;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .info-section {
      margin-bottom: 30px;
      padding: 15px;
      border: 1px solid #cccccc;
      border-radius: 5px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 20px; 
    }
    th { 
      background-color: #0b3d93; 
      color: white;
      padding: 12px 8px;
      text-align: left;
    }
    td { 
      border: 1px solid #ddd; 
      padding: 12px 8px; 
    }
    .totals {
      margin-top: 30px;
      text-align: right;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 5px;
    }
    .total-amount {
      color: #0b3d93;
      font-size: 1.2em;
      font-weight: bold;
    }
  `
};
