import { useState, useEffect } from 'react';
import { Save, Send, Shield, Mail, Bell, Ticket, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

function EmailSettings() {
    const [settings, setSettings] = useState({
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPass: '',
        smtpSecure: false,
        emailFrom: '',
        enableEmailAlerts: false,
        enableInAppAlerts: true,
        enableTicketAssign: true,
        enableSlaBreach: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sendingTest, setSendingTest] = useState(false);
    const [testEmail, setTestEmail] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings/email');
            // If empty object returned, keep defaults or merge
            if (response.data && response.data.id) {
                setSettings(prev => ({ ...prev, ...response.data }));
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/settings/email', settings);
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleSendTest = async () => {
        if (!testEmail) {
            toast.error('Please enter an email address for testing');
            return;
        }
        setSendingTest(true);
        try {
            await api.post('/settings/email/test', {
                ...settings,
                testEmailTo: testEmail
            });
            toast.success('Test email sent successfully');
        } catch (error) {
            console.error('Failed to send test email:', error);
            toast.error(error.response?.data?.error || 'Failed to send test email');
        } finally {
            setSendingTest(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Email & Alert Settings</h1>
                <p className="text-slate-600 dark:text-slate-400">Configure outgoing email server and notification preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-brand-500" />
                            SMTP Configuration
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    SMTP Host
                                </label>
                                <input
                                    type="text"
                                    name="smtpHost"
                                    value={settings.smtpHost || ''}
                                    onChange={handleChange}
                                    placeholder="smtp.example.com"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                                />
                            </div>

                            div className="col-span-2 md:col-span-1"
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    SMTP Port
                                </label>
                                <input
                                    type="number"
                                    name="smtpPort"
                                    value={settings.smtpPort || ''}
                                    onChange={handleChange}
                                    placeholder="587"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                                />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    SMTP Username
                                </label>
                                <input
                                    type="text"
                                    name="smtpUser"
                                    value={settings.smtpUser || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                                />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    SMTP Password
                                </label>
                                <input
                                    type="password"
                                    name="smtpPass"
                                    value={settings.smtpPass || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    From Email Address
                                </label>
                                <input
                                    type="email"
                                    name="emailFrom"
                                    value={settings.emailFrom || ''}
                                    onChange={handleChange}
                                    placeholder="support@company.com"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                                />
                            </div>

                            <div className="col-span-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="smtpSecure"
                                    name="smtpSecure"
                                    checked={settings.smtpSecure}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-brand-600 bg-slate-100 border-slate-300 rounded focus:ring-brand-500"
                                />
                                <label htmlFor="smtpSecure" className="text-sm text-slate-700 dark:text-slate-300">
                                    Use Secure Connection (SSL/TLS)
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>

                    {/* Alert Toggles */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-brand-500" />
                            Notification Triggers
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white">Email Alerts</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Master switch for sending email notifications</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.enableEmailAlerts}
                                        onChange={handleChange}
                                        name="enableEmailAlerts"
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-brand-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                        <Bell size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white">In-App Alerts</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Show notifications within the application</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.enableInAppAlerts}
                                        onChange={handleChange}
                                        name="enableInAppAlerts"
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-brand-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                                        <Ticket size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white">Ticket Assignment</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Notify agents when tickets are assigned to them</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.enableTicketAssign}
                                        onChange={handleChange}
                                        name="enableTicketAssign"
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-brand-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white">SLA Breach</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Notify admin/manager when tickets breach SLA</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.enableSlaBreach}
                                        onChange={handleChange}
                                        name="enableSlaBreach"
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-brand-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Test Email & Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Send className="w-4 h-4 text-brand-500" />
                            Test Configuration
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Send a test email to verify your SMTP settings are working correctly.
                        </p>
                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="Enter email address"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                            <button
                                onClick={handleSendTest}
                                disabled={sendingTest || !testEmail}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                            >
                                {sendingTest ? (
                                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Send Test Email
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 p-6">
                        <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Security Note
                        </h2>
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                            For Gmail, you might need to use an "App Password" if 2-Factor Authentication is enabled.
                        </p>
                        <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-200 mt-2 space-y-1">
                            <li>Use port 587 for TLS</li>
                            <li>Use port 465 for SSL</li>
                            <li>Ensure "Less secure apps" is allowed if not using App Passwords</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmailSettings;
