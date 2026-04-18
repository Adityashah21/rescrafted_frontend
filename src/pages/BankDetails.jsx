import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Save, ArrowLeft } from 'lucide-react';
import API from '../api';

function BankDetails() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        upiId: ''
    });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isSeller = user?.role === 'scrap_seller' || user?.role === 'craft_seller';

    useEffect(() => {
        if (!isSeller) { navigate('/dashboard'); return; }
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await API.get('/users/profile');
            if (data.bankDetails) {
                setForm({
                    accountHolderName: data.bankDetails.accountHolderName || '',
                    accountNumber: data.bankDetails.accountNumber || '',
                    ifscCode: data.bankDetails.ifscCode || '',
                    bankName: data.bankDetails.bankName || '',
                    upiId: data.bankDetails.upiId || ''
                });
            }
        } catch { } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await API.put('/users/bank-details', form);
            setSuccess('Bank details saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save details.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-lg mx-auto">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="bg-white rounded-3xl shadow-lg p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Payment Details</h1>
                            <p className="text-gray-500 text-sm">Add your bank info to receive payments</p>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                        <p className="text-amber-700 text-sm">
                            🔒 Your bank details are stored securely and only used for payment processing.
                        </p>
                    </div>

                    {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">{error}</div>}
                    {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-5 text-sm">✓ {success}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                            <input type="text" value={form.accountHolderName}
                                onChange={e => setForm({ ...form, accountHolderName: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                placeholder="As per bank records" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                            <input type="text" value={form.bankName}
                                onChange={e => setForm({ ...form, bankName: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                placeholder="e.g., State Bank of India" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input type="text" value={form.accountNumber}
                                    onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                    placeholder="XXXXXXXXXXXX" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                                <input type="text" value={form.ifscCode}
                                    onChange={e => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                    placeholder="SBIN0001234" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID (Optional)</label>
                            <input type="text" value={form.upiId}
                                onChange={e => setForm({ ...form, upiId: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                placeholder="yourname@upi" />
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-2">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <><Save className="w-4 h-4" /> Save Bank Details</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default BankDetails;