import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import RouteApp from './routes';

function App() {
  useEffect(() => {
    if (!sessionStorage.getItem('maintenanceTabOpened')) {
      window.open('https://dx.hoangphucthanh.vn:3000', '_blank');
      sessionStorage.setItem('maintenanceTabOpened', '1');
    }
  }, []);

  return (
    <Routes>
      <Route path="*" element={<RouteApp />} />
    </Routes>
  );
}

export default App;