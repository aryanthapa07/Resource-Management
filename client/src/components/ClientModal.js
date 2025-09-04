import React, { useState, useEffect } from 'react';
import { clientService } from '../services/clientService';
import { validateEmail } from '../utils/helpers';
import FileUpload from './FileUpload';
import toast from 'react-hot-toast';

const ClientModal = ({ client, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    currency: 'USD',
    description: '',
    contactInfo: {
      email: '',
      phone: '',
      website: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      }
    },
    primaryContact: {
      name: '',
      title: '',
      email: '',
      phone: ''
    },
    businessInfo: {
      industry: '',
      size: '',
      revenue: '',
      employees: ''
    },
    billing: {
      taxId: '',
      billingCycle: 'monthly',
      paymentTerms: 30,
      discount: 0
    },
    status: 'active',
    tags: []
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        code: client.code || '',
        currency: client.currency || 'USD',
        description: client.description || '',
        contactInfo: {
          email: client.contactInfo?.email || '',
          phone: client.contactInfo?.phone || '',
          website: client.contactInfo?.website || '',
          address: {
            street: client.contactInfo?.address?.street || '',
            city: client.contactInfo?.address?.city || '',
            state: client.contactInfo?.address?.state || '',
            country: client.contactInfo?.address?.country || '',
            postalCode: client.contactInfo?.address?.postalCode || ''
          }
        },
        primaryContact: {
          name: client.primaryContact?.name || '',
          title: client.primaryContact?.title || '',
          email: client.primaryContact?.email || '',
          phone: client.primaryContact?.phone || ''
        },
        businessInfo: {
          industry: client.businessInfo?.industry || '',
          size: client.businessInfo?.size || '',
          revenue: client.businessInfo?.revenue || '',
          employees: client.businessInfo?.employees || ''
        },
        billing: {
          taxId: client.billing?.taxId || '',
          billingCycle: client.billing?.billingCycle || 'monthly',
          paymentTerms: client.billing?.paymentTerms || 30,
          discount: client.billing?.discount || 0
        },
        status: client.status || 'active',
        tags: client.tags || []
      });
    }
  }, [client]);

  const handleChange = (path, value) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });

    if (errors[path]) {
      setErrors(prev => ({ ...prev, [path]: '' }));
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    } else if (formData.name.length > 200) {
      newErrors.name = 'Name cannot exceed 200 characters';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Client code is required';
    } else if (!/^[A-Z0-9]{2,20}$/.test(formData.code)) {
      newErrors.code = 'Code must be 2-20 uppercase letters/numbers';
    }

    if (formData.contactInfo.email && !validateEmail(formData.contactInfo.email)) {
      newErrors['contactInfo.email'] = 'Invalid email format';
    }

    if (formData.primaryContact.email && !validateEmail(formData.primaryContact.email)) {
      newErrors['primaryContact.email'] = 'Invalid email format';
    }

    if (formData.billing.paymentTerms && (formData.billing.paymentTerms < 0 || formData.billing.paymentTerms > 365)) {
      newErrors['billing.paymentTerms'] = 'Payment terms must be between 0 and 365 days';
    }

    if (formData.billing.discount && (formData.billing.discount < 0 || formData.billing.discount > 100)) {
      newErrors['billing.discount'] = 'Discount must be between 0 and 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      if (client) {
        await clientService.updateClient(client._id, formData, files);
        toast.success('Client updated successfully');
      } else {
        await clientService.createClient(formData, files);
        toast.success('Client created successfully');
      }
      onSave();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {client ? 'Edit Client' : 'Add New Client'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Client Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter client name"
                />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>

              <div>
                <label className="form-label">Client Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  className={`input-field ${errors.code ? 'border-red-500' : ''}`}
                  placeholder="e.g., ACME01"
                />
                {errors.code && <p className="form-error">{errors.code}</p>}
              </div>

              <div>
                <label className="form-label">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="input-field"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="JPY">JPY</option>
                  <option value="INR">INR</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="prospect">Prospect</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="input-field"
                placeholder="Brief description of the client..."
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleChange('contactInfo.email', e.target.value)}
                  className={`input-field ${errors['contactInfo.email'] ? 'border-red-500' : ''}`}
                  placeholder="client@company.com"
                />
                {errors['contactInfo.email'] && <p className="form-error">{errors['contactInfo.email']}</p>}
              </div>

              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleChange('contactInfo.phone', e.target.value)}
                  className="input-field"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="form-label">Website</label>
                <input
                  type="url"
                  value={formData.contactInfo.website}
                  onChange={(e) => handleChange('contactInfo.website', e.target.value)}
                  className="input-field"
                  placeholder="https://company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.street}
                  onChange={(e) => handleChange('contactInfo.address.street', e.target.value)}
                  className="input-field"
                  placeholder="123 Business St"
                />
              </div>

              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.city}
                  onChange={(e) => handleChange('contactInfo.address.city', e.target.value)}
                  className="input-field"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="form-label">State/Province</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.state}
                  onChange={(e) => handleChange('contactInfo.address.state', e.target.value)}
                  className="input-field"
                  placeholder="NY"
                />
              </div>

              <div>
                <label className="form-label">Country</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.country}
                  onChange={(e) => handleChange('contactInfo.address.country', e.target.value)}
                  className="input-field"
                  placeholder="United States"
                />
              </div>
            </div>
          </div>

          {/* Primary Contact */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Primary Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  value={formData.primaryContact.name}
                  onChange={(e) => handleChange('primaryContact.name', e.target.value)}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={formData.primaryContact.title}
                  onChange={(e) => handleChange('primaryContact.title', e.target.value)}
                  className="input-field"
                  placeholder="CEO"
                />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={formData.primaryContact.email}
                  onChange={(e) => handleChange('primaryContact.email', e.target.value)}
                  className={`input-field ${errors['primaryContact.email'] ? 'border-red-500' : ''}`}
                  placeholder="john@company.com"
                />
                {errors['primaryContact.email'] && <p className="form-error">{errors['primaryContact.email']}</p>}
              </div>

              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={formData.primaryContact.phone}
                  onChange={(e) => handleChange('primaryContact.phone', e.target.value)}
                  className="input-field"
                  placeholder="+1 (555) 987-6543"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Industry</label>
                <input
                  type="text"
                  value={formData.businessInfo.industry}
                  onChange={(e) => handleChange('businessInfo.industry', e.target.value)}
                  className="input-field"
                  placeholder="Technology"
                />
              </div>

              <div>
                <label className="form-label">Company Size</label>
                <select
                  value={formData.businessInfo.size}
                  onChange={(e) => handleChange('businessInfo.size', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select size</option>
                  <option value="startup">Startup (1-10)</option>
                  <option value="small">Small (11-50)</option>
                  <option value="medium">Medium (51-200)</option>
                  <option value="large">Large (201-1000)</option>
                  <option value="enterprise">Enterprise (1000+)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Annual Revenue</label>
                <input
                  type="text"
                  value={formData.businessInfo.revenue}
                  onChange={(e) => handleChange('businessInfo.revenue', e.target.value)}
                  className="input-field"
                  placeholder="$10M"
                />
              </div>

              <div>
                <label className="form-label">Number of Employees</label>
                <input
                  type="number"
                  value={formData.businessInfo.employees}
                  onChange={(e) => handleChange('businessInfo.employees', parseInt(e.target.value) || '')}
                  className="input-field"
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddTag} className="flex">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="input-field mr-2"
                  placeholder="Add a tag"
                />
                <button type="submit" className="btn-secondary">
                  Add
                </button>
              </form>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
            <FileUpload
              onFilesSelect={setFiles}
              acceptedTypes={allowedFileTypes}
              maxFiles={5}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {client ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                client ? 'Update Client' : 'Create Client'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;