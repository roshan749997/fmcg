import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';
import { FiClock, FiCheckCircle, FiXCircle, FiPackage, FiDollarSign, FiSearch, FiEye, FiUser, FiMapPin, FiShoppingBag } from 'react-icons/fi';
import ScrollToTop from '../../components/ScrollToTop';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [updatingId, setUpdatingId] = useState('');
  const [tempStatus, setTempStatus] = useState({});
  const [toast, setToast] = useState({ show: false, text: '', type: 'success' });
  const [viewingOrder, setViewingOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.admin.listOrders();
        if (mounted) setOrders(data || []);
      } catch (e) {
        setError(e.message || 'Failed to load orders');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const StatusBadge = ({ status: orderStatus, paymentStatus }) => {
    const s = String(orderStatus || '').toLowerCase();
    const statusConfig = {
      created: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: FiClock, label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: FiCheckCircle, label: 'Confirmed' },
      on_the_way: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', icon: FiPackage, label: 'On the Way' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: FiCheckCircle, label: 'Delivered' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: FiXCircle, label: 'Failed' },
      paid: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', icon: FiCheckCircle, label: 'Paid' },
    };
    const config = statusConfig[s] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: FiClock, label: 'Unknown' };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${config.border} border`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const PaymentBadge = ({ paymentStatus }) => {
    const paymentCls = paymentStatus === 'paid' 
      ? 'bg-green-100 text-green-700 border border-green-200'
      : paymentStatus === 'failed'
      ? 'bg-red-100 text-red-700 border border-red-200'
      : 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${paymentCls}`}>
        {paymentStatus === 'paid' ? <FiCheckCircle className="w-3 h-3" /> : paymentStatus === 'failed' ? <FiXCircle className="w-3 h-3" /> : <FiClock className="w-3 h-3" />}
        {paymentStatus || 'pending'}
      </span>
    );
  };

  const renderAddress = (a) => {
    if (!a) return <span className="text-gray-400">No address</span>;
    return (
      <div className="max-w-xs">
        <div className="font-medium">{a.fullName}</div>
        <div className="text-gray-600 text-xs">{a.mobileNumber || a.alternatePhone}</div>
        <div className="text-gray-700 text-sm line-clamp-2">{a.address}{a.landmark ? `, ${a.landmark}` : ''}</div>
        <div className="text-gray-500 text-xs">{a.city}, {a.state} - {a.pincode}</div>
      </div>
    );
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = orders;
    if (status !== 'all') arr = arr.filter(o => String(o.status || '').toLowerCase() === status);
    if (q) arr = arr.filter(o =>
      String(o.user?.name || '').toLowerCase().includes(q) ||
      String(o.user?.email || '').toLowerCase().includes(q) ||
      String(o._id || '').toLowerCase().includes(q)
    );
    return arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [orders, query, status]);
  
  const totalPages = Math.max(1, Math.ceil((filtered.length || 0) / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);
  useEffect(() => { setPage(1); }, [query, status, pageSize]);

  const statusOptions = [
    { value: 'created', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'on_the_way', label: 'On the way' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'failed', label: 'Failed' },
  ];

  const getTemp = (id, fallback) => (tempStatus[id] ?? fallback ?? 'created');
  const changeTemp = (id, v) => setTempStatus(prev => ({ ...prev, [id]: v }));
 
  const saveStatus = async (id) => {
    const order = orders.find(o => o._id === id);
    const newStatus = getTemp(id, order?.status);
    if (!order || String(order.status) === String(newStatus)) return;
    setUpdatingId(id);
    const prev = order.status;
    setOrders(os => os.map(o => o._id === id ? { ...o, status: newStatus } : o));
    try {
      await api.admin.updateOrderStatus(id, newStatus);
      setToast({ show: true, text: 'Order status updated successfully!', type: 'success' });
    } catch (e) {
      setOrders(os => os.map(o => o._id === id ? { ...o, status: prev } : o));
      setToast({ show: true, text: e.message || 'Failed to update status', type: 'error' });
    } finally {
      setUpdatingId('');
      setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
    }
  };

  const openViewModal = (order) => {
    setViewingOrder(order);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingOrder(null);
  };

  const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  // Calculate stats
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const pendingOrders = orders.filter(o => ['created', 'confirmed'].includes(o.status?.toLowerCase())).length;
    const deliveredOrders = orders.filter(o => o.status?.toLowerCase() === 'delivered').length;
    const paidOrders = orders.filter(o => o.razorpayPaymentId).length;
    return { totalRevenue, pendingOrders, deliveredOrders, paidOrders };
  }, [orders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-4 right-2 sm:right-4 z-50 px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-xl text-white text-xs sm:text-sm font-semibold transform transition-all max-w-[calc(100vw-1rem)] ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
          }`}>
            {toast.text}
          </div>
        )}

        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Order Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage and track customer orders</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-blue-200 shadow-md">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <FiDollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-600 uppercase truncate">Total Revenue</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{formatINR(stats.totalRevenue)}</div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-yellow-200 shadow-md">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <FiClock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-600 uppercase truncate">Pending</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pendingOrders}</div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-green-200 shadow-md">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <FiCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-600 uppercase truncate">Delivered</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.deliveredOrders}</div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-emerald-200 shadow-md">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <FiShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-600 uppercase truncate">Paid Orders</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.paidOrders}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-gray-200 shadow-md mb-4 sm:mb-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search orders..."
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                />
              </div>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
              >
                <option value={5}>5/page</option>
                <option value={10}>10/page</option>
                <option value={20}>20/page</option>
                <option value={50}>50/page</option>
              </select>
            </div>

            {/* Status Tabs */}
            <div className="mt-3 sm:mt-4 -mx-1 overflow-x-auto">
              <div className="flex gap-2 px-1 min-w-max whitespace-nowrap pb-2">
                {[
                  { label: 'All', value: 'all', count: orders.length },
                  { label: 'Pending', value: 'created', count: orders.filter(o => o.status?.toLowerCase() === 'created').length },
                  { label: 'Confirmed', value: 'confirmed', count: orders.filter(o => o.status?.toLowerCase() === 'confirmed').length },
                  { label: 'On Way', value: 'on_the_way', count: orders.filter(o => o.status?.toLowerCase() === 'on_the_way').length },
                  { label: 'Delivered', value: 'delivered', count: orders.filter(o => o.status?.toLowerCase() === 'delivered').length },
                  { label: 'Failed', value: 'failed', count: orders.filter(o => o.status?.toLowerCase() === 'failed').length },
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setStatus(tab.value)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold border-2 transition-all flex-shrink-0 ${
                      status === tab.value
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50 hover:border-amber-300'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FiXCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-900">Error Loading Orders</h3>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border-2 border-gray-200 shadow-md text-center">
            <FiShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <FiShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                    Orders ({filtered.length})
                  </h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Address</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">Items</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pageItems.map((o) => (
                      <tr key={o._id} className="hover:bg-amber-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900">#{String(o._id).slice(-6)}</div>
                          <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{o.user?.name || 'Customer'}</div>
                          <div className="text-xs text-gray-500">{o.user?.email || ''}</div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell max-w-xs">
                          {renderAddress(o.address)}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <FiPackage className="h-4 w-4 text-gray-400" />
                            <span className="font-semibold text-gray-900">{o.items?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900">{formatINR(o.amount)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-2">
                            <select
                              className="w-full border-2 border-gray-200 rounded-lg px-2 py-1 text-sm focus:border-amber-500 focus:outline-none"
                              value={getTemp(o._id, o.status)}
                              onChange={(e) => changeTemp(o._id, e.target.value)}
                            >
                              {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            <StatusBadge status={getTemp(o._id, o.status)} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <PaymentBadge paymentStatus={o.status === 'failed' ? 'failed' : o.razorpayPaymentId ? 'paid' : 'pending'} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openViewModal(o)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FiEye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => saveStatus(o._id)}
                              disabled={updatingId === o._id || String(getTemp(o._id, o.status)) === String(o.status)}
                              className={`px-3 py-1 rounded-lg text-white text-sm font-semibold transition-all ${
                                updatingId === o._id || String(getTemp(o._id, o.status)) === String(o.status)
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg'
                              }`}
                            >
                              {updatingId === o._id ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell whitespace-nowrap text-sm text-gray-600">
                          {new Date(o.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} orders
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
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 rounded-t-xl">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiShoppingBag className="h-5 w-5" />
                  Orders ({filtered.length})
                </h2>
              </div>
              {pageItems.map((o) => (
                <div key={o._id} className="bg-white border-2 border-gray-200 rounded-xl shadow-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 mb-1">#{String(o._id).slice(-6)}</div>
                        <div className="text-xs text-gray-500 mb-2">{new Date(o.createdAt).toLocaleString()}</div>
                        <div className="font-semibold text-gray-900 mb-1">{o.user?.name || 'Customer'}</div>
                        <div className="text-xs text-gray-500 truncate">{o.user?.email || ''}</div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="font-bold text-gray-900 text-lg">{formatINR(o.amount)}</div>
                        <div className="text-xs text-gray-500 flex items-center justify-end gap-1 mt-1">
                          <FiPackage className="h-3 w-3" />
                          {o.items?.length || 0} items
                        </div>
                      </div>
                    </div>
                    {o.address && (
                      <div className="mb-3 pt-3 border-t border-gray-200">
                        {renderAddress(o.address)}
                      </div>
                    )}
                    <div className="space-y-2 mb-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Order Status</label>
                        <select
                          className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
                          value={getTemp(o._id, o.status)}
                          onChange={(e) => changeTemp(o._id, e.target.value)}
                        >
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <div className="mt-1">
                          <StatusBadge status={getTemp(o._id, o.status)} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Payment Status</label>
                        <PaymentBadge paymentStatus={o.status === 'failed' ? 'failed' : o.razorpayPaymentId ? 'paid' : 'pending'} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => openViewModal(o)}
                        className="flex-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-semibold flex items-center justify-center gap-1"
                      >
                        <FiEye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => saveStatus(o._id)}
                        disabled={updatingId === o._id || String(getTemp(o._id, o.status)) === String(o.status)}
                        className={`flex-1 px-3 py-2 rounded-lg text-white text-sm font-semibold transition-all ${
                          updatingId === o._id || String(getTemp(o._id, o.status)) === String(o.status)
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg'
                        }`}
                      >
                        {updatingId === o._id ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-gray-50 px-4 py-3 border-2 border-gray-200 rounded-xl flex flex-col items-center justify-between gap-3">
                <div className="text-xs text-gray-600 text-center">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} orders
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

        {/* View Order Modal */}
        {isViewModalOpen && viewingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl shadow-2xl my-2 sm:my-4">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center rounded-t-xl sm:rounded-t-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-white truncate pr-2">Order #{String(viewingOrder._id).slice(-6)}</h3>
                <button onClick={closeViewModal} className="text-white hover:text-gray-200 flex-shrink-0">
                  <FiXCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border-2 border-gray-200">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                      <FiUser className="h-3 w-3 sm:h-4 sm:w-4" />
                      Customer Information
                    </h4>
                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                      <div><span className="text-gray-600">Name:</span> <span className="font-semibold text-gray-900 break-words">{viewingOrder.user?.name || 'N/A'}</span></div>
                      <div><span className="text-gray-600">Email:</span> <span className="font-semibold text-gray-900 break-all">{viewingOrder.user?.email || 'N/A'}</span></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border-2 border-gray-200">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                      <FiMapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                      Delivery Address
                    </h4>
                    {viewingOrder.address ? (
                      <div className="space-y-1 text-xs sm:text-sm">
                        <div className="font-semibold text-gray-900">{viewingOrder.address.fullName}</div>
                        <div className="text-gray-600 break-words">{viewingOrder.address.address}{viewingOrder.address.landmark ? `, ${viewingOrder.address.landmark}` : ''}</div>
                        <div className="text-gray-600">{viewingOrder.address.city}, {viewingOrder.address.state} - {viewingOrder.address.pincode}</div>
                        <div className="text-gray-600">{viewingOrder.address.mobileNumber || viewingOrder.address.alternatePhone}</div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs sm:text-sm">No address provided</div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                    <FiPackage className="h-3 w-3 sm:h-4 sm:w-4" />
                    Order Items ({viewingOrder.items?.length || 0})
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    {viewingOrder.items?.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 sm:p-4 rounded-lg border-2 border-gray-200 flex items-start gap-3 sm:gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-gray-300 flex-shrink-0">
                          <img
                            src={item.product?.images?.image1 || item.product?.image || 'https://via.placeholder.com/150'}
                            alt={item.product?.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">{item.product?.title || 'Product'}</div>
                          {item.size && <div className="text-xs sm:text-sm text-gray-600">Size: {item.size}</div>}
                          <div className="text-xs sm:text-sm text-gray-600">Quantity: {item.quantity || 1}</div>
                          <div className="text-sm sm:text-base font-bold text-gray-900 mt-1">
                            {formatINR((item.product?.price || item.product?.mrp || 0) * (item.quantity || 1))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 sm:p-4 rounded-lg border-2 border-amber-200">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">Order Summary</h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-gray-900">{formatINR(viewingOrder.amount)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                      <span className="text-gray-600">Order Status:</span>
                      <StatusBadge status={viewingOrder.status} />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                      <span className="text-gray-600">Payment Status:</span>
                      <PaymentBadge paymentStatus={viewingOrder.status === 'failed' ? 'failed' : viewingOrder.razorpayPaymentId ? 'paid' : 'pending'} />
                    </div>
                    {viewingOrder.razorpayPaymentId && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-600">Payment ID:</span>
                        <span className="font-mono text-xs text-gray-700 break-all">{viewingOrder.razorpayPaymentId}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-amber-300 flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total Amount:</span>
                      <span className="text-lg sm:text-xl font-bold text-gray-900">{formatINR(viewingOrder.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
};

export default AdminOrders;
