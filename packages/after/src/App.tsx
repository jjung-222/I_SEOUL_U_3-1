import React from 'react'
import { Header } from './components/Header'
import { ManagementPage } from './pages/ManagementPage'
import './index.css'

export const App: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc' }}>
      <Header />
      <main>
        <ManagementPage />
      </main>
    </div>
  );
};
