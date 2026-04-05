import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import Navbar from './components/Navbar';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);