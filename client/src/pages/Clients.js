import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientService } from '../services/clientService';
import { formatSimpleDate, formatRole } from '../utils/helpers';
import ClientModal from '../components/ClientModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { PageLoader, TableSkeletonLoader } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState('table');
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    currency: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchClients();
  }, [filters]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClients(filters);
      setClients(response.data.clients);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSort = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleCreateClient = () => {
    setEditingClient(null);
    setShowClientModal(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowClientModal(true);
  };

  const handleDeleteClient = async (client) => {
    try {
      await clientService.deleteClient(client._id);
      toast.success('Client deleted successfully');
      setDeletingClient(null);
      fetchClients();
    } catch (error) {
      toast.error(error.message || 'Failed to delete client');
    }
  };

  const handleClientSaved = () => {
    setShowClientModal(false);
    setEditingClient(null);
    fetchClients();
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 bg-green-50',
      inactive: 'text-gray-600 bg-gray-50',
      prospect: 'text-blue-600 bg-blue-50',
      archived: 'text-red-600 bg-red-50'
    };
    return colors[status] || colors.active;
  };

  const getSortIcon = (column) => {
    if (filters.sortBy !== column) {
      return <span className="text-gray-400 ml-1 text-xs">↕️</span>;
    }
    return (
      <span className="text-primary-600 ml-1 text-xs">
        {filters.sortOrder === 'asc' ? '↗️' : '↘️'}
      </span>
    );
  };

  if (loading && clients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600">Manage your client relationships and documents</p>
          </div>
          <div className="animate-pulse bg-gray-200 h-10 w-28 rounded-lg"></div>
        </div>
        <div className="card p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 animate-pulse bg-gray-200 h-10 rounded-lg"></div>
            <div className="flex gap-4">
              <div className="animate-pulse bg-gray-200 h-10 w-32 rounded-lg"></div>
              <div className="animate-pulse bg-gray-200 h-10 w-32 rounded-lg"></div>
              <div className="animate-pulse bg-gray-200 h-20 w-32 rounded-lg"></div>
            </div>
          </div>
          <TableSkeletonLoader rows={5} columns={7} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage your client relationships and documents</p>
        </div>
        <button
          onClick={handleCreateClient}
          className="btn-primary"
        >
          ➕ Add Client
        </button>
      </div>

      <div className="card p-4 sm:p-6">
        <div className="space-y-4 mb-6">
          <div className="w-full">
            <input
              type="text"
              placeholder="Search clients..."
              value={filters.search}
              onChange={handleSearch}
              className="input-field w-full"
            />
          </div>
          <div className="mobile-stack">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input-field mobile-full"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="prospect">Prospect</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filters.currency}
              onChange={(e) => handleFilterChange('currency', e.target.value)}
              className="input-field mobile-full"
            >
              <option value="">All Currencies</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
            <div className="flex rounded-lg border border-gray-300 mobile-full">
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 sm:flex-none px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'table'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="hidden sm:inline">📋 Table</span>
                <span className="sm:hidden">📋</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex-1 sm:flex-none px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'cards'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="hidden sm:inline">🃏 Cards</span>
                <span className="sm:hidden">🃏</span>
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="desktop-table">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="sort-header px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name {getSortIcon('name')}
                    </div>
                  </th>
                  <th
                    className="sort-header px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center">
                      Code {getSortIcon('code')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th
                    className="sort-header px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Created {getSortIcon('createdAt')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client, index) => (
                  <tr 
                    key={client._id} 
                    className="table-row fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          <Link
                            to={`/clients/${client._id}`}
                            className="hover:text-primary-600"
                          >
                            {client.name}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {client.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {client.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      📄 {client.documents?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatSimpleDate(client.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/clients/${client._id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          👁️ View
                        </Link>
                        <button
                          onClick={() => handleEditClient(client)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setDeletingClient(client)}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Mobile Card View - Always show on mobile, show when cards selected on desktop */}
        {viewMode === 'cards' || true ? (
          <div className={`grid grid-cols-1 ${viewMode === 'cards' ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-4 sm:gap-6 ${viewMode === 'table' ? 'mobile-card' : ''}`}>
            {clients.map((client, index) => (
              <div 
                key={client._id} 
                className="card p-4 sm:p-6 zoom-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      <Link
                        to={`/clients/${client._id}`}
                        className="hover:text-primary-600"
                      >
                        {client.name}
                      </Link>
                    </h3>
                    <p className="text-sm font-mono text-gray-500">{client.code}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {client.description || 'No description available'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>💰 {client.currency}</span>
                  <span>📄 {client.documents?.length || 0} docs</span>
                  <span>{formatSimpleDate(client.createdAt)}</span>
                </div>
                
                <div className="flex justify-between">
                  <Link
                    to={`/clients/${client._id}`}
                    className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                  >
                    👁️ View Details
                  </Link>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEditClient(client)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setDeletingClient(client)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {clients.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.status || filters.currency
                ? 'Try adjusting your search filters'
                : 'Get started by adding your first client'}
            </p>
            {!(filters.search || filters.status || filters.currency) && (
              <button
                onClick={handleCreateClient}
                className="btn-primary"
              >
                ➕ Add Your First Client
              </button>
            )}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * filters.limit) + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.totalClients)} of {pagination.totalClients} clients
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {[...Array(Math.min(pagination.totalPages, 5))].map((_, idx) => {
                const page = Math.max(1, pagination.currentPage - 2) + idx;
                if (page > pagination.totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm border rounded-md ${
                      page === pagination.currentPage
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showClientModal && (
        <ClientModal
          client={editingClient}
          onClose={() => setShowClientModal(false)}
          onSave={handleClientSaved}
        />
      )}

      {deletingClient && (
        <ConfirmDialog
          title="Delete Client"
          message={`Are you sure you want to delete "${deletingClient.name}"? This action cannot be undone and will remove all associated documents.`}
          confirmText="Delete"
          confirmClass="bg-red-600 hover:bg-red-700"
          onConfirm={() => handleDeleteClient(deletingClient)}
          onCancel={() => setDeletingClient(null)}
        />
      )}
    </div>
  );
};

export default Clients;