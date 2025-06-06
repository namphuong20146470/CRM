import React from 'react';
import { Routes, Route, createBrowserRouter, RouterProvider } from 'react-router-dom';
import BaoTriPage from './pages/BaoTriPage';
import Suppliers from './pages/Suppliers';
import { future } from 'react-router';

// Create router with future flags
const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Home Page</div>,
  },
  {
    path: '/maintenance',
    element: <BaoTriPage />,
  },
  {
    path: '/suppliers',
    element: <Suppliers />,
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

function App() {
  return <RouterProvider router={router} />;
}

export default App; 