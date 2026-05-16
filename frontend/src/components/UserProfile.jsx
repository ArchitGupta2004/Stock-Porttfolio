import { useState, useEffect } from 'react';
import { User as UserIcon, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function UserProfile({ user, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setProfileStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        onUpdateUser(data);
        setProfileStatus({ type: 'success', message: 'Profile updated successfully' });
      } else {
        setProfileStatus({ type: 'error', message: data.message || 'Failed to update profile' });
      }
    } catch (err) {
      setProfileStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setProfileStatus({ type: '', message: '' });
    setPasswordStatus({ type: '', message: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordStatus({ type: 'success', message: 'Password changed successfully' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordStatus({ type: 'error', message: data.message || 'Failed to change password' });
      }
    } catch (err) {
      setPasswordStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-dark-card border border-dark-border rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <div className="md:w-1/3 bg-dark-card border-b md:border-b-0 md:border-r border-dark-border p-6 flex flex-col">
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-16 w-16 bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-dark-muted text-sm">{user?.email}</p>
            </div>
          </div>

          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                activeTab === 'profile' 
                  ? 'bg-brand-primary/20 text-brand-primary font-medium border border-brand-primary/30' 
                  : 'text-dark-muted hover:bg-dark-hover hover:text-white'
              }`}
            >
              <UserIcon size={20} />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                activeTab === 'password' 
                  ? 'bg-brand-primary/20 text-brand-primary font-medium border border-brand-primary/30' 
                  : 'text-dark-muted hover:bg-dark-hover hover:text-white'
              }`}
            >
              <Lock size={20} />
              <span>Change Password</span>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="md:w-2/3 p-8">
          {activeTab === 'profile' ? (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Profile Details</h3>
              
              {profileStatus.message && (
                <div className={`p-4 rounded-lg mb-6 flex items-center space-x-3 ${
                  profileStatus.type === 'error' ? 'bg-brand-danger/10 text-brand-danger border border-brand-danger/20' : 'bg-brand-success/10 text-brand-success border border-brand-success/20'
                }`}>
                  {profileStatus.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                  <span>{profileStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-dark-muted mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border text-white px-4 py-3 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-muted mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border text-white px-4 py-3 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                    required
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-brand-primary hover:bg-brand-primary/80 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save size={20} />
                    <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Security</h3>
              
              {passwordStatus.message && (
                <div className={`p-4 rounded-lg mb-6 flex items-center space-x-3 ${
                  passwordStatus.type === 'error' ? 'bg-brand-danger/10 text-brand-danger border border-brand-danger/20' : 'bg-brand-success/10 text-brand-success border border-brand-success/20'
                }`}>
                  {passwordStatus.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-dark-muted mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border text-white px-4 py-3 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-muted mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border text-white px-4 py-3 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-muted mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border text-white px-4 py-3 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                    required
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-brand-primary hover:bg-brand-primary/80 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save size={20} />
                    <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
