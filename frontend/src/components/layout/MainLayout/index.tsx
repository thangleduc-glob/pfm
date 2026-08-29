/**
 * MainLayout Component
 * Layout wrapper for authenticated pages with sidebar navigation
 */

import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="main-layout">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className={`main-content ${sidebarOpen ? 'main-content--sidebar-open' : 'main-content--sidebar-closed'}`}>
        <main className="main-content__body">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;