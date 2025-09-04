import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { clientService } from '../services/clientService';
import { formatSimpleDate, formatDate } from '../utils/helpers';
import ClientModal from '../components/ClientModal';
import FileUpload from '../components/FileUpload';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const ClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClient(clientId);
      setClient(response.data.client);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch client details');
      if (error.message?.includes('not found')) {
        navigate('/clients');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      const response = await clientService.downloadDocument(clientId, document._id);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = document.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started');
    } catch (error) {
      toast.error(error.message || 'Failed to download document');
    }
  };

  const handleDeleteDocument = async (document) => {
    try {
      await clientService.deleteDocument(clientId, document._id);
      toast.success('Document deleted successfully');
      setDeletingDocument(null);
      fetchClient();
    } catch (error) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const handleUploadDocuments = async (files) => {
    try {
      await clientService.uploadDocuments(clientId, files);
      toast.success('Documents uploaded successfully');
      setShowUploadModal(false);
      fetchClient();
    } catch (error) {
      toast.error(error.message || 'Failed to upload documents');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    
    try {
      setAddingNote(true);
      await clientService.addNote(clientId, noteContent.trim());
      setNoteContent('');
      toast.success('Note added successfully');
      fetchClient();
    } catch (error) {
      toast.error(error.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
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

  const getFileIcon = (mimetype) => {
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('sheet')) return '📊';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📽️';
    if (mimetype.includes('image')) return '🖼️';
    if (mimetype.includes('zip') || mimetype.includes('rar')) return '📦';
    if (mimetype.includes('text')) return '📃';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: `Documents (${client?.documents?.length || 0})` },
    { id: 'notes', label: `Notes (${client?.notes?.length || 0})` },
    { id: 'activity', label: 'Activity' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Client not found</h3>
        <Link to="/clients" className="text-primary-600 hover:text-primary-500">
          ← Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/clients"
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back to Clients
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600">{client.code}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client.status)}`}>
            {client.status}
          </span>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="btn-primary"
        >
          ✏️ Edit Client
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-4">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-2xl font-bold text-gray-900">{client.currency}</div>
          <div className="text-sm text-gray-500">Currency</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl mb-2">📄</div>
          <div className="text-2xl font-bold text-gray-900">{client.documents?.length || 0}</div>
          <div className="text-sm text-gray-500">Documents</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl mb-2">📝</div>
          <div className="text-2xl font-bold text-gray-900">{client.notes?.length || 0}</div>
          <div className="text-sm text-gray-500">Notes</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl mb-2">📅</div>
          <div className="text-2xl font-bold text-gray-900">{formatSimpleDate(client.createdAt)}</div>
          <div className="text-sm text-gray-500">Created</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{client.description || 'No description provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {client.tags?.length > 0 ? (
                      client.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No tags</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                {client.contactInfo?.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">
                      <a href={`mailto:${client.contactInfo.email}`} className="text-primary-600 hover:text-primary-500">
                        {client.contactInfo.email}
                      </a>
                    </p>
                  </div>
                )}
                {client.contactInfo?.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">
                      <a href={`tel:${client.contactInfo.phone}`} className="text-primary-600 hover:text-primary-500">
                        {client.contactInfo.phone}
                      </a>
                    </p>
                  </div>
                )}
                {client.contactInfo?.website && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <p className="text-gray-900">
                      <a href={client.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-500">
                        {client.contactInfo.website}
                      </a>
                    </p>
                  </div>
                )}
                {client.contactInfo?.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">
                      {[
                        client.contactInfo.address.street,
                        client.contactInfo.address.city,
                        client.contactInfo.address.state,
                        client.contactInfo.address.country,
                        client.contactInfo.address.postalCode
                      ].filter(Boolean).join(', ') || 'No address provided'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Contact */}
            {client.primaryContact?.name && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Contact</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{client.primaryContact.name}</p>
                  </div>
                  {client.primaryContact.title && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Title</label>
                      <p className="text-gray-900">{client.primaryContact.title}</p>
                    </div>
                  )}
                  {client.primaryContact.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">
                        <a href={`mailto:${client.primaryContact.email}`} className="text-primary-600 hover:text-primary-500">
                          {client.primaryContact.email}
                        </a>
                      </p>
                    </div>
                  )}
                  {client.primaryContact.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">
                        <a href={`tel:${client.primaryContact.phone}`} className="text-primary-600 hover:text-primary-500">
                          {client.primaryContact.phone}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Business Information */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              <div className="space-y-4">
                {client.businessInfo?.industry && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Industry</label>
                    <p className="text-gray-900">{client.businessInfo.industry}</p>
                  </div>
                )}
                {client.businessInfo?.size && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company Size</label>
                    <p className="text-gray-900 capitalize">{client.businessInfo.size}</p>
                  </div>
                )}
                {client.businessInfo?.revenue && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Annual Revenue</label>
                    <p className="text-gray-900">{client.businessInfo.revenue}</p>
                  </div>
                )}
                {client.businessInfo?.employees && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Employees</label>
                    <p className="text-gray-900">{client.businessInfo.employees}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary"
              >
                📤 Upload Documents
              </button>
            </div>

            {client.documents?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {client.documents.map((doc) => (
                  <div key={doc._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getFileIcon(doc.mimetype)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(doc.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      <p>Uploaded by {doc.uploadedBy?.name}</p>
                      <p>{formatDate(doc.uploadedAt)}</p>
                      {doc.category && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                          {doc.category}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                      >
                        📥 Download
                      </button>
                      <button
                        onClick={() => setDeletingDocument(doc)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents</h3>
                <p className="text-gray-500 mb-6">Upload documents related to this client</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary"
                >
                  📤 Upload First Document
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Notes</h3>
            
            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="mb-6">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={3}
                className="input-field w-full"
                placeholder="Add a note about this client..."
                required
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={addingNote || !noteContent.trim()}
                  className={`btn-primary ${(addingNote || !noteContent.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {addingNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </form>

            {/* Notes List */}
            {client.notes?.length > 0 ? (
              <div className="space-y-4">
                {client.notes.map((note, index) => (
                  <div key={index} className="border-l-4 border-primary-500 pl-4 py-2">
                    <p className="text-gray-900">{note.content}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      By {note.author?.name} on {formatDate(note.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📝</div>
                <p className="text-gray-500">No notes yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📊</div>
              <p className="text-gray-500">Activity tracking coming soon</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditModal && (
        <ClientModal
          client={client}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            fetchClient();
          }}
        />
      )}

      {showUploadModal && (
        <DocumentUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadDocuments}
        />
      )}

      {deletingDocument && (
        <ConfirmDialog
          title="Delete Document"
          message={`Are you sure you want to delete "${deletingDocument.originalName}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmClass="bg-red-600 hover:bg-red-700"
          onConfirm={() => handleDeleteDocument(deletingDocument)}
          onCancel={() => setDeletingDocument(null)}
        />
      )}
    </div>
  );
};

// Document Upload Modal Component
const DocumentUploadModal = ({ onClose, onUpload }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      await onUpload(files);
    } finally {
      setUploading(false);
    }
  };

  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <FileUpload
            onFilesSelect={setFiles}
            acceptedTypes={allowedFileTypes}
            maxFiles={10}
          />
        </div>
        
        <div className="p-6 border-t flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className={`btn-primary ${(files.length === 0 || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} Files`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;