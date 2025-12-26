import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { FiMail, FiPhone, FiMapPin, FiSave, FiLoader, FiHome } from 'react-icons/fi';
import ScrollToTop from '../../components/ScrollToTop';

const AdminContactInfo = () => {
  const [form, setForm] = useState({
    email: '',
    phone: '',
    address: '',
    companyName: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getContactInfo();
      setForm({
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        companyName: data.companyName || 'Kidzo',
      });
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load contact information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!form.email.trim() || !form.phone.trim() || !form.address.trim()) {
        setError('Email, phone, and address are required');
        return;
      }

      await api.admin.updateContactInfo(form);
      setSuccess('Contact information updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update contact information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="inline-block animate-spin h-12 w-12 text-pink-600 mb-4" />
          <p className="text-gray-600 font-medium">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg flex-shrink-0">
              <FiMail className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Contact Information</h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Manage company contact details displayed across the website</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <FiHome className="h-4 w-4 sm:h-5 sm:w-5" />
              Company Details
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-2">
                <FiHome className="h-3 w-3 sm:h-4 sm:w-4" />
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="Enter company name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-2">
                <FiMail className="h-3 w-3 sm:h-4 sm:w-4" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="support@kidzo.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-2">
                <FiPhone className="h-3 w-3 sm:h-4 sm:w-4" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-2">
                <FiMapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                rows={4}
                className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                placeholder="Enter full company address"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-3 sm:pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {saving ? (
                  <>
                    <FiLoader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="h-4 w-4 sm:h-5 sm:w-5" />
                    Save Contact Information
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-4 sm:mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-blue-800">
            <strong>Note:</strong> These contact details will be displayed across all policy pages and footer sections of the website.
          </p>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default AdminContactInfo;

