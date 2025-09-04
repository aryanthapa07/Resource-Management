import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatRole, formatSimpleDate, getAvailabilityColor, getRoleColor } from '../utils/helpers';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    profile: {
      skills: user?.profile?.skills || [],
      experience: user?.profile?.experience || 0,
      availability: user?.profile?.availability || 'available',
      phone: user?.profile?.phone || '',
      location: user?.profile?.location || '',
      bio: user?.profile?.bio || ''
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileChange = (field, value) => {
    if (field === 'name') {
      setProfileData(prev => ({ ...prev, name: value }));
    } else {
      setProfileData(prev => ({
        ...prev,
        profile: { ...prev.profile, [field]: value }
      }));
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !profileData.profile.skills.includes(skillInput.trim())) {
      setProfileData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          skills: [...prev.profile.skills, skillInput.trim()]
        }
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        skills: prev.profile.skills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const result = await updateProfile(profileData);
    if (result.success) {
      setIsEditing(false);
    }
    setIsSubmitting(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });

    if (result.success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
    setIsSubmitting(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information' },
    { id: 'security', label: 'Security' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <div className="flex space-x-2">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role)}`}>
            {formatRole(user?.role)}
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(user?.profile?.availability)}`}>
            {user?.profile?.availability || 'Not Set'}
          </div>
        </div>
      </div>

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

      {activeTab === 'profile' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-secondary"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={user?.email}
                    className="input-field bg-gray-50"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    value={profileData.profile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="input-field"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={profileData.profile.location}
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                    className="input-field"
                    placeholder="Enter location"
                  />
                </div>

                <div>
                  <label className="form-label">Experience (years)</label>
                  <input
                    type="number"
                    min="0"
                    value={profileData.profile.experience}
                    onChange={(e) => handleProfileChange('experience', parseInt(e.target.value) || 0)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="form-label">Availability</label>
                  <select
                    value={profileData.profile.availability}
                    onChange={(e) => handleProfileChange('availability', e.target.value)}
                    className="input-field"
                  >
                    <option value="available">Available</option>
                    <option value="partially_available">Partially Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profileData.profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <form onSubmit={handleAddSkill} className="flex">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="input-field mr-2"
                    placeholder="Add a skill"
                  />
                  <button type="submit" className="btn-secondary">
                    Add
                  </button>
                </form>
              </div>

              <div>
                <label className="form-label">Bio</label>
                <textarea
                  value={profileData.profile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  rows={4}
                  className="input-field"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Full Name</label>
                  <p className="text-gray-900">{user?.name}</p>
                </div>

                <div>
                  <label className="form-label">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>

                <div>
                  <label className="form-label">Phone</label>
                  <p className="text-gray-900">{user?.profile?.phone || 'Not provided'}</p>
                </div>

                <div>
                  <label className="form-label">Location</label>
                  <p className="text-gray-900">{user?.profile?.location || 'Not provided'}</p>
                </div>

                <div>
                  <label className="form-label">Experience</label>
                  <p className="text-gray-900">{user?.profile?.experience || 0} years</p>
                </div>

                <div>
                  <label className="form-label">Member Since</label>
                  <p className="text-gray-900">{formatSimpleDate(user?.createdAt)}</p>
                </div>
              </div>

              <div>
                <label className="form-label">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {user?.profile?.skills?.length > 0 ? (
                    user.profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No skills added yet</p>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">Bio</label>
                <p className="text-gray-900">{user?.profile?.bio || 'No bio provided'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
            <div>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="input-field"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                required
                minLength={6}
              />
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;