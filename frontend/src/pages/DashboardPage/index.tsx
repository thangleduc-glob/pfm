/**
 * DashboardPage Component
 * Main dashboard page that displays financial summary
 */

import React from 'react';
import DashboardSummary from '../../components/dashboard/DashboardSummary';
import './DashboardPage.css';

/**
 * DashboardPage component - main dashboard view
 */
const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard-page">
      <DashboardSummary />
    </div>
  );
};

export default DashboardPage;