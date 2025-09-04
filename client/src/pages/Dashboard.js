import React from 'react';
import { useAuth } from '../context/AuthContext';
import { formatRole, formatSimpleDate, getRoleColor } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'resource_manager':
        return <ResourceManagerDashboard user={user} />;
      case 'engagement_manager':
        return <EngagementManagerDashboard user={user} />;
      default:
        return <DefaultDashboard user={user} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening in your resource management system today.
          </p>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role)}`}>
            {formatRole(user?.role)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Member since {formatSimpleDate(user?.createdAt)}
          </div>
        </div>
      </div>

      {getDashboardContent()}
    </div>
  );
};

const AdminDashboard = ({ user }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <StatCard
      title="Total Users"
      value="--"
      icon="👥"
      color="bg-blue-500"
    />
    <StatCard
      title="Departments"
      value="--"
      icon="🏢"
      color="bg-green-500"
    />
    <StatCard
      title="Active Projects"
      value="--"
      icon="📁"
      color="bg-purple-500"
    />
    
    <div className="lg:col-span-3">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            title="Manage Users"
            description="Add, edit, or deactivate user accounts"
            icon="👥"
            href="/users"
          />
          <ActionCard
            title="Department Setup"
            description="Configure departments and roles"
            icon="🏢"
            href="/departments"
          />
          <ActionCard
            title="System Reports"
            description="View comprehensive system analytics"
            icon="📊"
            href="/reports"
          />
          <ActionCard
            title="Settings"
            description="Configure system preferences"
            icon="⚙️"
            href="/settings"
          />
        </div>
      </div>
    </div>
  </div>
);

const ResourceManagerDashboard = ({ user }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <StatCard
      title="Team Members"
      value="--"
      icon="👥"
      color="bg-blue-500"
    />
    <StatCard
      title="Active Allocations"
      value="--"
      icon="📋"
      color="bg-green-500"
    />
    <StatCard
      title="Pending Requests"
      value="--"
      icon="⏳"
      color="bg-yellow-500"
    />
    
    <div className="lg:col-span-3">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Manager Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            title="Manage Team"
            description="View and manage your team members"
            icon="👥"
            href="/team"
          />
          <ActionCard
            title="Resource Allocation"
            description="Assign resources to projects"
            icon="📋"
            href="/allocations"
          />
          <ActionCard
            title="Review Requests"
            description="Process incoming resource requests"
            icon="📝"
            href="/requests"
          />
        </div>
      </div>
    </div>
  </div>
);

const EngagementManagerDashboard = ({ user }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <StatCard
      title="My Projects"
      value="--"
      icon="📁"
      color="bg-blue-500"
    />
    <StatCard
      title="Allocated Resources"
      value="--"
      icon="👨‍💼"
      color="bg-green-500"
    />
    <StatCard
      title="Request Status"
      value="--"
      icon="📤"
      color="bg-purple-500"
    />
    
    <div className="lg:col-span-3">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Manager Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            title="My Projects"
            description="View and manage your projects"
            icon="📁"
            href="/projects"
          />
          <ActionCard
            title="Request Resources"
            description="Submit new resource requests"
            icon="📤"
            href="/requests"
          />
          <ActionCard
            title="View Resources"
            description="Browse available resources"
            icon="👨‍💼"
            href="/resources"
          />
        </div>
      </div>
    </div>
  </div>
);

const DefaultDashboard = ({ user }) => (
  <div className="card p-6 text-center">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Welcome to the Resource Management System</h3>
    <p className="text-gray-600 mb-6">
      Your dashboard is being prepared. Please contact your administrator if you need access to specific features.
    </p>
  </div>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className="card p-6">
    <div className="flex items-center">
      <div className={`${color} p-3 rounded-lg text-white text-xl mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  </div>
);

const ActionCard = ({ title, description, icon, href }) => (
  <a
    href={href}
    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
  >
    <div className="text-2xl mb-2">{icon}</div>
    <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
    <p className="text-sm text-gray-600">{description}</p>
  </a>
);

export default Dashboard;