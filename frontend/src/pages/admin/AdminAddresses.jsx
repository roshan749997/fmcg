import React, { useEffect, useState, useMemo, useRef } from 'react';
import { api } from '../../utils/api';
import { FiUser, FiMapPin, FiMail, FiPhone, FiSearch, FiHome, FiBriefcase, FiEdit, FiX } from 'react-icons/fi';
import ScrollToTop from '../../components/ScrollToTop';

const AdminAddresses = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    fullName: '',
    mobileNumber: '',
    pincode: '',
    locality: '',
    address: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    landmark: '',
    alternatePhone: '',
    addressType: 'Home'
  });
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [filteredStates, setFilteredStates] = useState([]);
  const [stateSearchTerm, setStateSearchTerm] = useState('');
  const stateDropdownRef = useRef(null);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ].sort();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.admin.listAddresses();
        if (mounted) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'Failed to load addresses');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (showStateDropdown) {
      const filtered = indianStates.filter(state =>
        state.toLowerCase().includes(stateSearchTerm.toLowerCase())
      );
      setFilteredStates(filtered);
    }
  }, [stateSearchTerm, showStateDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target)) {
        setShowStateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openEditModal = (address) => {
    setEditingAddress(address);
    setAddressFormData({
      fullName: address.fullName || '',
      mobileNumber: address.mobileNumber || address.phoneNumber || '',
      pincode: address.pincode || '',
      locality: address.locality || '',
      address: address.address || address.addressLine1 || '',
      addressLine1: address.addressLine1 || address.address || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      landmark: address.landmark || '',
      alternatePhone: address.alternatePhone || '',
      addressType: address.addressType || 'Home'
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAddress(null);
    setAddressFormData({
      fullName: '',
      mobileNumber: '',
      pincode: '',
      locality: '',
      address: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      landmark: '',
      alternatePhone: '',
      addressType: 'Home'
    });
    setStateSearchTerm('');
    setShowStateDropdown(false);
  };

  const handleAddressFormChange = (e) => {
    const { name, value } = e.target;
    setAddressFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      setSavingAddress(true);
      const payload = {
        fullName: addressFormData.fullName.trim(),
        mobileNumber: addressFormData.mobileNumber.trim(),
        pincode: addressFormData.pincode.trim(),
        locality: addressFormData.locality.trim(),
        address: addressFormData.address.trim() || addressFormData.addressLine1.trim(),
        addressLine1: addressFormData.addressLine1.trim() || addressFormData.address.trim(),
        addressLine2: addressFormData.addressLine2.trim(),
        city: addressFormData.city.trim(),
        state: addressFormData.state.trim(),
        landmark: addressFormData.landmark.trim(),
        alternatePhone: addressFormData.alternatePhone.trim(),
        addressType: addressFormData.addressType === 'work' ? 'Work' : 'Home',
      };

      if (editingAddress && editingAddress._id) {
        await api.admin.updateAddress(editingAddress._id, payload);
        // Refresh the addresses list
        const data = await api.admin.listAddresses();
        setRows(Array.isArray(data) ? data : []);
        closeEditModal();
        alert('Address updated successfully!');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to update address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(a =>
      String(a.userId?.name || a.fullName || '').toLowerCase().includes(q) ||
      String(a.userId?.email || '').toLowerCase().includes(q) ||
      String(a.mobileNumber || a.alternatePhone || '').includes(q) ||
      String(a.address || '').toLowerCase().includes(q) ||
      String(a.city || '').toLowerCase().includes(q) ||
      String(a.pincode || '').includes(q)
    );
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil((filtered.length || 0) / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);
  useEffect(() => { setPage(1); }, [query, pageSize]);

  const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  // Calculate stats
  const stats = useMemo(() => {
    const totalAddresses = rows.length;
    const homeAddresses = rows.filter(a => a.addressType?.toLowerCase() === 'home').length;
    const workAddresses = rows.filter(a => a.addressType?.toLowerCase() === 'work').length;
    const uniqueUsers = new Set(rows.map(a => a.userId?._id || a.userId?.id).filter(Boolean)).size;
    return { totalAddresses, homeAddresses, workAddresses, uniqueUsers };
  }, [rows]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">User Addresses</h1>
            <p className="text-sm sm:text-base text-gray-600">View and manage customer delivery addresses</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-blue-200 shadow-md">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <FiMapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-600 uppercase truncate">Total</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalAddresses}</div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-green-200 shadow-md">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <FiHome className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-600 uppercase truncate">Home</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.homeAddresses}</div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-purple-200 shadow-md">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <FiBriefcase className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-600 uppercase truncate">Work</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.workAddresses}</div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-amber-200 shadow-md">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <FiUser className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-600 uppercase truncate">Users</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.uniqueUsers}</div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-gray-200 shadow-md mb-4 sm:mb-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search addresses..."
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value={5}>5/page</option>
                <option value={10}>10/page</option>
                <option value={20}>20/page</option>
                <option value={50}>50/page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Addresses List */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading addresses...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FiMapPin className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-900">Error Loading Addresses</h3>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border-2 border-gray-200 shadow-md text-center">
            <FiMapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Addresses Found</h3>
            <p className="text-gray-600">Try adjusting your search query</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <FiMapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    Addresses ({filtered.length})
                  </h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Address</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">City/State</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Pincode</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pageItems.map(a => (
                      <tr key={a._id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                              {(a.userId?.name || a.fullName || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{a.userId?.name || a.fullName || 'Unknown'}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <FiMail className="h-3 w-3" />
                                {a.userId?.email || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            <FiPhone className="h-4 w-4 text-gray-400" />
                            {a.mobileNumber || a.alternatePhone || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="text-sm text-gray-900 font-medium">{a.address || 'N/A'}</div>
                          {a.landmark && (
                            <div className="text-xs text-gray-500 mt-1">Landmark: {a.landmark}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="text-sm text-gray-700">{a.city || 'N/A'}, {a.state || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                            {a.pincode || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            a.addressType?.toLowerCase() === 'home'
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : a.addressType?.toLowerCase() === 'work'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : 'bg-gray-100 text-gray-800 border border-gray-300'
                          }`}>
                            {a.addressType?.toLowerCase() === 'home' ? <FiHome className="w-3 h-3" /> : <FiBriefcase className="w-3 h-3" />}
                            {a.addressType || 'Other'}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600">
                          {a.createdAt ? new Date(a.createdAt).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openEditModal(a)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                          >
                            <FiEdit className="w-4 h-4" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} addresses
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={`px-3 sm:px-4 py-2 rounded-lg border-2 text-xs sm:text-sm font-semibold transition-all ${
                      page <= 1
                        ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                        : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <div className="px-3 sm:px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-xs sm:text-sm font-semibold text-gray-700">
                    Page {page} of {totalPages}
                  </div>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={`px-3 sm:px-4 py-2 rounded-lg border-2 text-xs sm:text-sm font-semibold transition-all ${
                      page >= totalPages
                        ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                        : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 rounded-t-xl">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiMapPin className="h-5 w-5" />
                  Addresses ({filtered.length})
                </h2>
              </div>
              {pageItems.map(a => (
                <div key={a._id} className="bg-white border-2 border-gray-200 rounded-xl shadow-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {(a.userId?.name || a.fullName || 'U')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 mb-1">{a.userId?.name || a.fullName || 'Unknown'}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                          <FiMail className="h-3 w-3" />
                          <span className="truncate">{a.userId?.email || 'N/A'}</span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <FiPhone className="h-3 w-3" />
                          {a.mobileNumber || a.alternatePhone || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="mb-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-900 font-medium mb-1">{a.address || 'N/A'}</div>
                      {a.landmark && (
                        <div className="text-xs text-gray-500 mb-1">Landmark: {a.landmark}</div>
                      )}
                      <div className="text-xs text-gray-600">{a.city || 'N/A'}, {a.state || 'N/A'} - {a.pincode || 'N/A'}</div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        a.addressType?.toLowerCase() === 'home'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : a.addressType?.toLowerCase() === 'work'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-gray-100 text-gray-800 border border-gray-300'
                      }`}>
                        {a.addressType?.toLowerCase() === 'home' ? <FiHome className="w-3 h-3" /> : <FiBriefcase className="w-3 h-3" />}
                        {a.addressType || 'Other'}
                      </span>
                      {a.createdAt && (
                        <div className="text-xs text-gray-500">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <button
                        onClick={() => openEditModal(a)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                      >
                        <FiEdit className="w-4 h-4" />
                        Edit Address
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-gray-50 px-4 py-3 border-2 border-gray-200 rounded-xl flex flex-col items-center justify-between gap-3">
                <div className="text-xs text-gray-600 text-center">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} addresses
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={`px-3 py-2 rounded-lg border-2 text-xs font-semibold transition-all ${
                      page <= 1
                        ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                        : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Prev
                  </button>
                  <div className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-xs font-semibold text-gray-700">
                    {page}/{totalPages}
                  </div>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={`px-3 py-2 rounded-lg border-2 text-xs font-semibold transition-all ${
                      page >= totalPages
                        ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                        : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Address Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
              <h3 className="text-xl font-bold text-white">Edit Address</h3>
              <button onClick={closeEditModal} className="text-white hover:text-white">
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveAddress} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={addressFormData.fullName}
                    onChange={handleAddressFormChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={addressFormData.mobileNumber}
                    onChange={handleAddressFormChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    required
                    maxLength="10"
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Address Line 1 *</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={addressFormData.addressLine1}
                  onChange={handleAddressFormChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={addressFormData.addressLine2}
                  onChange={handleAddressFormChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Locality</label>
                <input
                  type="text"
                  name="locality"
                  value={addressFormData.locality}
                  onChange={handleAddressFormChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={addressFormData.city}
                    onChange={handleAddressFormChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    required
                  />
                </div>
                <div className="relative" ref={stateDropdownRef}>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={addressFormData.state}
                    onChange={(e) => {
                      handleAddressFormChange(e);
                      setStateSearchTerm(e.target.value);
                      setShowStateDropdown(true);
                    }}
                    onFocus={() => setShowStateDropdown(true)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    required
                  />
                  {showStateDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredStates.map((state) => (
                        <div
                          key={state}
                          onClick={() => {
                            setAddressFormData(prev => ({ ...prev, state }));
                            setShowStateDropdown(false);
                            setStateSearchTerm('');
                          }}
                          className="px-4 py-2 hover:bg-blue-100 hover:text-blue-900 cursor-pointer text-sm text-gray-900"
                        >
                          {state}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={addressFormData.pincode}
                    onChange={handleAddressFormChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    required
                    maxLength="6"
                    pattern="[0-9]{6}"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Address Type *</label>
                  <select
                    name="addressType"
                    value={addressFormData.addressType}
                    onChange={handleAddressFormChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    required
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={addressFormData.landmark}
                  onChange={handleAddressFormChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Alternate Phone</label>
                <input
                  type="tel"
                  name="alternatePhone"
                  value={addressFormData.alternatePhone}
                  onChange={handleAddressFormChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                  maxLength="10"
                  pattern="[0-9]{10}"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  disabled={savingAddress}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                  disabled={savingAddress}
                >
                  {savingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ScrollToTop />
    </div>
  );
};

export default AdminAddresses;
