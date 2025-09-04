import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import ProjectModal from '../components/ProjectModal';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [noteContent, setNoteContent] = useState('');
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'tasks', label: 'Tasks', icon: '✓' },
    { id: 'milestones', label: 'Milestones', icon: '🎯' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'files', label: 'Files', icon: '📎' }
  ];

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProject(projectId);
      if (response.success) {
        setProject(response.data.project);
      }
    } catch (error) {
      console.error('Fetch project error:', error);
      if (error.response?.status === 404) {
        setError('Project not found');
      } else if (error.response?.status === 403) {
        setError('Access denied to this project');
      } else {
        setError('Failed to fetch project details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSave = (savedProject) => {
    setProject(savedProject);
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    try {
      const response = await projectService.deleteProject(projectId);
      if (response.success) {
        navigate('/projects');
      }
    } catch (error) {
      console.error('Delete project error:', error);
      setError('Failed to delete project');
    }
    setConfirmDialog({ isOpen: false });
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await projectService.updateProjectStatus(projectId, newStatus);
      if (response.success) {
        setProject(response.data.project);
      }
    } catch (error) {
      console.error('Update status error:', error);
      setError('Failed to update project status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      setAddingNote(true);
      const response = await projectService.addProjectNote(projectId, {
        content: noteContent.trim(),
        isPrivate: isPrivateNote
      });
      
      if (response.success) {
        setProject(response.data.project);
        setNoteContent('');
        setIsPrivateNote(false);
      }
    } catch (error) {
      console.error('Add note error:', error);
      setError('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      planning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      on_hold: 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${priorityConfig[priority] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateProgress = () => {
    if (!project.tasks || project.tasks.length === 0) return project.progress || 0;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const calculateDaysRemaining = () => {
    if (!project.endDate || project.status === 'completed') return null;
    const today = new Date();
    const endDate = new Date(project.endDate);
    const timeDiff = endDate - today;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysRemaining;
  };

  const canEditProject = () => {
    return user.role === 'admin' || 
           project.projectManager._id === user._id || 
           project.createdBy._id === user._id;
  };

  const canDeleteProject = () => {
    return user.role === 'admin' || project.createdBy._id === user._id;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <Link
            to="/projects"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const daysRemaining = calculateDaysRemaining();
  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/projects" className="text-gray-500 hover:text-gray-700">
              Projects
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="flex-shrink-0 h-5 w-5 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-900 font-medium">{project.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                {getStatusBadge(project.status)}
                {getPriorityBadge(project.priority)}
              </div>
              
              {project.description && (
                <p className="text-gray-600 mb-4">{project.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">Client</span>
                  <span className="text-gray-900 font-medium">{project.client.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Project Manager</span>
                  <span className="text-gray-900 font-medium">{project.projectManager.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Start Date</span>
                  <span className="text-gray-900 font-medium">{formatDate(project.startDate)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">End Date</span>
                  <span className="text-gray-900 font-medium">{formatDate(project.endDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {canEditProject() && (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )}
              {canDeleteProject() && (
                <button
                  onClick={() => setConfirmDialog({ isOpen: true })}
                  className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Project Progress</span>
            <span>{progress}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {daysRemaining !== null && (
            <div className="mt-2 text-sm">
              {daysRemaining > 0 ? (
                <span className="text-gray-600">{daysRemaining} days remaining</span>
              ) : daysRemaining === 0 ? (
                <span className="text-orange-600 font-medium">Due today</span>
              ) : (
                <span className="text-red-600 font-medium">{Math.abs(daysRemaining)} days overdue</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-primary-600 truncate">Team Size</dt>
                  <dd className="mt-1 text-3xl font-semibold text-primary-900">
                    {project.teamMembers?.length || 0}
                  </dd>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-green-600 truncate">Completed Tasks</dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-900">
                    {project.tasks?.filter(t => t.status === 'completed').length || 0} / {project.tasks?.length || 0}
                  </dd>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-blue-600 truncate">Budget Allocated</dt>
                  <dd className="mt-1 text-3xl font-semibold text-blue-900">
                    {project.budget?.currency} {project.budget?.allocated?.toLocaleString() || '0'}
                  </dd>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-orange-600 truncate">Budget Spent</dt>
                  <dd className="mt-1 text-3xl font-semibold text-orange-900">
                    {project.budget?.currency} {project.budget?.spent?.toLocaleString() || '0'}
                  </dd>
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Name</span>
                    <p className="font-medium text-gray-900">{project.client.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Code</span>
                    <p className="font-medium text-gray-900">{project.client.code}</p>
                  </div>
                  {project.client.industry && (
                    <div>
                      <span className="text-sm text-gray-500">Industry</span>
                      <p className="font-medium text-gray-900">{project.client.industry}</p>
                    </div>
                  )}
                  {project.client.primaryContact && (
                    <div>
                      <span className="text-sm text-gray-500">Primary Contact</span>
                      <p className="font-medium text-gray-900">{project.client.primaryContact.name}</p>
                      <p className="text-sm text-gray-600">{project.client.primaryContact.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                {canEditProject() && (
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Member
                  </button>
                )}
              </div>
              
              {project.teamMembers && project.teamMembers.length > 0 ? (
                <div className="space-y-4">
                  {project.teamMembers.map((member) => (
                    <div key={member._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {member.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                          <p className="text-sm text-gray-500">{member.user.email}</p>
                          <p className="text-xs text-gray-400">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">
                          Joined: {formatDate(member.joinedAt)}
                        </p>
                        {member.hourlyRate && (
                          <p className="text-xs text-gray-500">
                            Rate: ${member.hourlyRate}/hr
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No team members assigned yet
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Tasks</h3>
                {canEditProject() && (
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Task
                  </button>
                )}
              </div>
              
              {project.tasks && project.tasks.length > 0 ? (
                <div className="space-y-3">
                  {project.tasks.map((task) => (
                    <div key={task._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded-full ${
                              task.status === 'completed' ? 'bg-green-100 text-green-800' :
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                            {task.assignedTo && (
                              <span>Assigned to: {task.assignedTo.name}</span>
                            )}
                            {task.dueDate && (
                              <span>Due: {formatDate(task.dueDate)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No tasks created yet
                </div>
              )}
            </div>
          )}

          {activeTab === 'milestones' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Milestones</h3>
                {canEditProject() && (
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Milestone
                  </button>
                )}
              </div>
              
              {project.milestones && project.milestones.length > 0 ? (
                <div className="space-y-4">
                  {project.milestones.map((milestone) => (
                    <div key={milestone._id} className="border-l-4 border-primary-500 pl-4 py-2">
                      <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                      {milestone.description && (
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded-full ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                          milestone.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {milestone.status}
                        </span>
                        <span>Due: {formatDate(milestone.dueDate)}</span>
                        {milestone.completedAt && (
                          <span>Completed: {formatDate(milestone.completedAt)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No milestones created yet
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Project Notes</h3>
              </div>
              
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="mb-4">
                  <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-2">
                    Add a note
                  </label>
                  <textarea
                    id="note-content"
                    rows={3}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your note..."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPrivateNote}
                      onChange={(e) => setIsPrivateNote(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Private note</span>
                  </label>
                  <button
                    type="submit"
                    disabled={!noteContent.trim() || addingNote}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingNote && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    Add Note
                  </button>
                </div>
              </form>

              {/* Notes List */}
              {project.notes && project.notes.length > 0 ? (
                <div className="space-y-4">
                  {project.notes.map((note) => (
                    <div key={note._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{note.author.name}</span>
                          {note.isPrivate && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Private
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{formatDateTime(note.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No notes added yet
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="text-center py-8 text-gray-500">
              File management coming soon
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <ProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={project}
        onSave={handleSave}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ isOpen: false })}
        type="danger"
      />
    </div>
  );
};

export default ProjectDetail;