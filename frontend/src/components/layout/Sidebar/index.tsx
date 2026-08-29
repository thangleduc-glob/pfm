/**
 * Sidebar Component
 * Navigation sidebar for the main application layout
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Show confirmation dialog
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    
    if (confirmLogout) {
      // Clear all localStorage
      localStorage.clear();
      
      // Navigate to login page
      navigate('/login');
    }
  };

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      path: '/transactions',
      label: 'Transactions',
      icon: '💰'
    },
    {
      path: '/categories',
      label: 'Categories',
      icon: '📁'
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: '📈'
    }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
      <div className="sidebar__header">
        <h2 className="sidebar__logo">
          <span className="sidebar__logo-icon">💳</span>
          {isOpen && <span className="sidebar__logo-text">PFM</span>}
        </h2>
        {onToggle && (
          <button 
            className="sidebar__toggle"
            onClick={onToggle}
            aria-label="Toggle sidebar"
          >
            {isOpen ? '◀' : '▶'}
          </button>
        )}
      </div>
      
      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems.map((item) => (
            <li key={item.path} className="sidebar__menu-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `sidebar__menu-link ${isActive ? 'sidebar__menu-link--active' : ''}`
                }
              >
                <span className="sidebar__menu-icon">{item.icon}</span>
                {isOpen && <span className="sidebar__menu-text">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Logout button */}
      <div className="sidebar__logout">
        <button 
          className="sidebar__logout-button"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <span className="sidebar__menu-icon">🚪</span>
          {isOpen && <span className="sidebar__menu-text">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;