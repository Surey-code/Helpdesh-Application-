import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Shield, KeyRound, Activity } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Profile() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [activity, setActivity] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    department: '',
    avatarUrl: '',
    city: '',
    state: '',
    country: '',
    phone: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

  const avatarSrc = useMemo(() => {
    if (!profile.avatarUrl) return null;
    return profile.avatarUrl; // Proxy will handle relative paths
  }, [profile.avatarUrl]);

  const fetchProfile = async () => {
    const r = await api.get('/users/me');
    const u = r.data.user;
    setProfile({
      name: u.name || '',
      department: u.department || '',
      avatarUrl: u.avatarUrl || '',
      city: u.city || '',
      state: u.state || '',
      country: u.country || '',
      phone: u.phone || '',
    });
  };

  const fetchActivity = async () => {
    try {
      const r = await api.get('/users/me/activity?limit=25');
      setActivity(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchProfile();
        await fetchActivity();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const r = await api.put('/users/me', {
        name: profile.name,
        department: profile.department,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        phone: profile.phone,
      });
      toast.success('Profile updated');
      // keep auth context in sync
      login(r.data.user, localStorage.getItem('token'));
      setIsEditing(false); // Toggle back to view mode after successful save
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file) => {
    const form = new FormData();
    form.append('avatar', file);
    const r = await api.post('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success('Avatar updated');
    setProfile((p) => ({ ...p, avatarUrl: r.data.user.avatarUrl || '' }));
    login(r.data.user, localStorage.getItem('token'));
  };

  const changePassword = async () => {
    setPwSaving(true);
    try {
      await api.put('/users/me/password', passwords);
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '' });
      await fetchActivity();
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="h-40 bg-slate-200 rounded" />
          <div className="h-64 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-slate-800 dark:text-white mb-2 uppercase italic">Profile</h1>
          <p className="text-brand-500 font-mono text-sm tracking-widest uppercase opacity-80">Personalize your space and settings</p>
        </div>
        <button
          onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
          className="btn-primary flex items-center gap-2 group"
        >
          {isEditing ? <Save size={18} /> : <motion.div animate={{ rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}><KeyRound size={18} /></motion.div>}
          {isEditing ? (saving ? 'Saving...' : 'Save Profile') : 'Edit Profile'}
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 relative overflow-hidden text-center group">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 to-brand-400" />

            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl font-bold overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-brand-500">{(user?.name?.[0] || '?').toUpperCase()}</span>
                )}
              </div>
              <label className="absolute bottom-1 right-1 cursor-pointer bg-brand-600 hover:bg-brand-500 text-white rounded-full p-2.5 shadow-xl border border-white dark:border-slate-800/50 transition-all opacity-0 group-hover:opacity-100">
                <Camera size={20} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadAvatar(f);
                  }}
                />
              </label>
              {/* "Update" tooltip style from mockup */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-950 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                Update
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{profile.name}</h2>
            <p className="text-slate-500 text-sm mb-4">{profile.city || 'Somewhere'}, {profile.state || 'Earth'}</p>

            <div className="flex justify-center gap-2 mb-8">
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                {user?.role}
              </span>
            </div>

          </div>


          {/* Security Card */}
          <div className="glass-card p-6 overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500">
                <KeyRound size={20} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Security</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Password</label>
                <input
                  type="password"
                  className="input-field py-2 text-sm"
                  placeholder="New password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                />
              </div>
              <button
                fullWidth
                onClick={changePassword}
                disabled={pwSaving || !passwords.newPassword}
                className="w-full btn-secondary text-sm py-2 disabled:opacity-50"
              >
                {pwSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Details Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 shadow-xl overflow-hidden min-h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {[
                { label: 'Email', value: user?.email, key: 'email', disabled: true },
                { label: 'Name', value: profile.name, key: 'name' },
                { label: 'City', value: profile.city, key: 'city' },
                { label: 'State', value: profile.state, key: 'state' },
                { label: 'Country', value: profile.country, key: 'country' },
                { label: 'Phone', value: profile.phone, key: 'phone' },
                { label: 'Department', value: profile.department, key: 'department' },
              ].map((field) => (
                <div key={field.label} className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover:text-brand-500 transition-colors">
                    {field.label}
                  </label>
                  {isEditing && !field.disabled ? (
                    <input
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:border-brand-500 outline-none transition-all"
                      value={profile[field.key]}
                      onChange={(e) => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 dark:text-white font-medium text-lg transition-all">
                        {field.value || 'Not specified'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Recent Activity Section */}
            <div className="mt-12 pt-12 border-t border-slate-200 dark:border-slate-800/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500">
                    <Activity size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Activity</h3>
                </div>
              </div>

              <div className="space-y-3">
                {activity.length === 0 ? (
                  <p className="text-slate-500 text-sm">No recent actions recorded.</p>
                ) : (
                  activity.slice(0, 5).map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/20 transition-colors">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{a.action}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{format(new Date(a.createdAt), 'MMM dd • HH:mm')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div >
  );
}

