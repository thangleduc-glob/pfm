/**
 * Sidebar Component
 * Navigation sidebar for the main application layout
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle }) => {

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
    </div>
  );
};

export default Sidebar;