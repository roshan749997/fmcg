import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';
import { FiEdit, FiTrash2, FiX, FiPlus, FiSearch, FiImage, FiPackage, FiDollarSign, FiTag, FiEye } from 'react-icons/fi';
import ScrollToTop from '../../components/ScrollToTop';

const AdminProducts = () => {
  const [form, setForm] = useState({
    title: '',
    mrp: '',
    discountPercent: 0,
    description: '',
    category: '',
    images: { image1: '', image2: '', image3: '' },
    product_info: { 
      brand: '', 
      manufacturer: '', 
      clothingType: '', 
      gender: '', 
      ageGroup: '', 
      fabric: '', 
      color: '', 
      availableSizes: [],
      footwearType: '', 
      shoeMaterial: '', 
      soleMaterial: '', 
      accessoryType: '', 
      material: '', 
      babyCareType: '', 
      ageRange: '', 
      safetyStandard: '', 
      quantity: '', 
      toyType: '', 
      batteryRequired: false, 
      batteryIncluded: false, 
      includedComponents: '' 
    },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    _id: '',
    mrp: '',
    discountPercent: 0,
    price: ''
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, text: '', type: 'success' });
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.admin.listProducts();
      setList(data || []);
    } catch (e) {
      setError(e.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      if (data) {
        setCategories(data.categories || []);
        setAllCategories(data.allCategories || []);
      }
    } catch (e) {
      console.error('Failed to load categories:', e);
      // Fallback to hardcoded categories if API fails
      setAllCategories([
        { name: 'Kids Clothing', slug: 'kids-clothing' },
        { name: 'Kids Accessories', slug: 'kids-accessories' },
        { name: 'Footwear', slug: 'footwear' },
        { name: 'Baby Care', slug: 'baby-care' },
        { name: 'Toys', slug: 'toys' },
      ]);
    }
  };

  useEffect(() => {
    load();
    loadCategories();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onChangeNested = (section, key) => (e) => {
    const { value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ 
      ...prev, 
      [section]: { ...(prev[section] || {}), [key]: finalValue } 
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        mrp: Number(form.mrp),
        discountPercent: Number(form.discountPercent) || 0,
        description: form.description,
        category: form.category,
        images: form.images,
        product_info: form.product_info,
      };
      await api.admin.createProduct(payload);
      setToast({ show: true, text: 'Product created successfully!', type: 'success' });
      setIsCreateModalOpen(false);
      resetForm();
      await load();
    } catch (e) {
      setError(e.message || 'Failed to create product');
      setToast({ show: true, text: e.message || 'Failed to create product', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      mrp: '',
      discountPercent: 0,
      description: '',
      category: '',
      images: { image1: '', image2: '', image3: '' },
      product_info: { 
        brand: '', 
        manufacturer: '', 
        clothingType: '', 
        gender: '', 
        ageGroup: '', 
        fabric: '', 
        color: '', 
        availableSizes: [],
        footwearType: '', 
        shoeMaterial: '', 
        soleMaterial: '', 
        accessoryType: '', 
        material: '', 
        babyCareType: '', 
        ageRange: '', 
        safetyStandard: '', 
        quantity: '', 
        toyType: '', 
        batteryRequired: false, 
        batteryIncluded: false, 
        includedComponents: '' 
      },
    });
    setError('');
  };

  const remove = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.admin.deleteProduct(id);
      setToast({ show: true, text: 'Product deleted successfully!', type: 'success' });
      await load();
    } catch (e) {
      setToast({ show: true, text: e.message || 'Failed to delete product', type: 'error' });
    } finally {
      setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
    }
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setEditForm({
      _id: p._id,
      mrp: p.mrp || '',
      discountPercent: p.discountPercent || 0,
      price: Math.round((p.mrp || 0) - ((p.mrp || 0) * (p.discountPercent || 0) / 100))
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setEditForm({ _id: '', mrp: '', discountPercent: 0, price: '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const numValue = name === 'mrp' || name === 'discountPercent' ? Number(value) : value;
    const newForm = { ...editForm, [name]: numValue };
    if (name === 'mrp' || name === 'discountPercent') {
      const mrp = name === 'mrp' ? numValue : editForm.mrp;
      const discount = name === 'discountPercent' ? numValue : editForm.discountPercent;
      newForm.price = Math.round(mrp - (mrp * discount / 100));
    }
    setEditForm(newForm);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.admin.updateProduct(editForm._id, {
        mrp: editForm.mrp,
        discountPercent: editForm.discountPercent
      });
      setToast({ show: true, text: 'Product updated successfully!', type: 'success' });
      closeEditModal();
      await load();
    } catch (e) {
      setError(e.message || 'Failed to update product');
      setToast({ show: true, text: e.message || 'Failed to update product', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
    }
  };

  const openViewModal = (p) => {
    setViewingProduct(p);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingProduct(null);
  };

  const priceFor = (p) => Math.round((p.mrp || 0) - ((p.mrp || 0) * (p.discountPercent || 0) / 100));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = list;
    if (categoryFilter !== 'all') {
      arr = arr.filter(p => String(p.category || '').toLowerCase() === categoryFilter);
    }
    if (q) {
      arr = arr.filter(p => 
        String(p.title || '').toLowerCase().includes(q) ||
        String(p.category || '').toLowerCase().includes(q) ||
        String(p.description || '').toLowerCase().includes(q)
      );
    }
    return arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [list, query, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil((filtered.length || 0) / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);
  useEffect(() => { setPage(1); }, [query, categoryFilter, pageSize]);

  const filterCategories = ['all', 'kids-clothing', 'kids-accessories', 'footwear', 'baby-care', 'toys'];
  const categoryStats = useMemo(() => {
    const stats = {};
    filterCategories.forEach(cat => {
      stats[cat] = list.filter(p => cat === 'all' || String(p.category || '').toLowerCase() === cat).length;
    });
    return stats;
  }, [list]);

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
          <div className="flex flex-col gap-3 sm:gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Product Management</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your product catalog and inventory</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FiPlus className="h-4 w-4 sm:h-5 sm:w-5" />
              Add New Product
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-blue-200 shadow-md">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <FiPackage className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-600 uppercase truncate">Total</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{list.length}</div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-green-200 shadow-md">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <FiDollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-600 uppercase truncate">Avg Price</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                ₹{list.length > 0 ? Math.round(list.reduce((sum, p) => sum + priceFor(p), 0) / list.length).toLocaleString('en-IN') : '0'}
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-purple-200 shadow-md">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <FiTag className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-600 uppercase truncate">Categories</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{new Set(list.map(p => p.category).filter(Boolean)).size}</div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-amber-200 shadow-md">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <FiImage className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-600 uppercase truncate">With Images</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {list.filter(p => p.images?.image1 || p.image).length}
              </div>
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
                  placeholder="Search products..."
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
                >
                  <option value="all">All ({categoryStats.all})</option>
                  <option value="kids-clothing">Kids Clothing ({categoryStats['kids-clothing']})</option>
                  <option value="kids-accessories">Kids Accessories ({categoryStats['kids-accessories']})</option>
                  <option value="footwear">Footwear ({categoryStats.footwear})</option>
                  <option value="baby-care">Baby Care ({categoryStats['baby-care']})</option>
                  <option value="toys">Toys ({categoryStats.toys})</option>
                </select>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
                >
                  <option value={5}>5/page</option>
                  <option value={10}>10/page</option>
                  <option value={20}>20/page</option>
                  <option value={50}>50/page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading products...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FiX className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-900">Error Loading Products</h3>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border-2 border-gray-200 shadow-md text-center">
            <FiPackage className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">
              {query || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first product'}
            </p>
            {(!query && categoryFilter === 'all') && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <FiPackage className="h-4 w-4 sm:h-5 sm:w-5" />
                    Products ({filtered.length})
                  </h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Image</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">MRP</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Discount</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pageItems.map((p) => (
                      <tr key={p._id} className="hover:bg-pink-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                            <img
                              src={p?.images?.image1 || p?.image || 'https://via.placeholder.com/150'}
                              alt={p.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{p.title}</div>
                          <div className="text-xs text-gray-500 line-clamp-2 mt-1">{p.description}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {p.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900">₹{priceFor(p).toLocaleString('en-IN')}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-600 line-through">₹{(p.mrp || 0).toLocaleString('en-IN')}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            {p.discountPercent || 0}% OFF
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openViewModal(p)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FiEye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => remove(p._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} products
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
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-4 py-3 rounded-t-xl">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiPackage className="h-5 w-5" />
                  Products ({filtered.length})
                </h2>
              </div>
              {pageItems.map((p) => (
                <div key={p._id} className="bg-white border-2 border-gray-200 rounded-xl shadow-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex gap-3 mb-3">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                        <img
                          src={p?.images?.image1 || p?.image || 'https://via.placeholder.com/150'}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{p.title}</h3>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold mb-2">
                          {p.category || 'Uncategorized'}
                        </span>
                        {p.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3 pt-3 border-t border-gray-200">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Price</div>
                        <div className="font-bold text-gray-900">₹{priceFor(p).toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">MRP</div>
                        <div className="text-gray-600 line-through text-sm">₹{(p.mrp || 0).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        {p.discountPercent || 0}% OFF
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(p._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-gray-50 px-4 py-3 border-2 border-gray-200 rounded-xl flex flex-col items-center justify-between gap-3">
                <div className="text-xs text-gray-600 text-center">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} products
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

        {/* Create Product Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl my-2 sm:my-4">
              <div className="sticky top-0 bg-gradient-to-r from-pink-600 to-rose-600 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
                <h3 className="text-lg sm:text-xl font-bold text-white">Create New Product</h3>
                <button onClick={() => { setIsCreateModalOpen(false); resetForm(); }} className="text-white hover:text-gray-200 flex-shrink-0">
                  <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              
              <form onSubmit={submit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {error && <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700">{error}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Product Title *</label>
                    <input name="title" value={form.title} onChange={onChange} placeholder="Enter product title" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Category *</label>
                    <select name="category" value={form.category} onChange={onChange} className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" required>
                      <option value="">Select Category</option>
                      {categories.length > 0 ? (
                        // Render categories with subcategories grouped
                        categories.map((parent) => (
                          <optgroup key={parent._id || parent.slug} label={parent.name}>
                            <option value={parent.slug || parent.name.toLowerCase().replace(/\s+/g, '-')}>
                              {parent.name}
                            </option>
                            {parent.subcategories && parent.subcategories.length > 0 && parent.subcategories.map((sub) => (
                              <option key={sub._id || sub.slug} value={sub.slug || sub.name.toLowerCase().replace(/\s+/g, '-')}>
                                {parent.name} - {sub.name}
                              </option>
                            ))}
                          </optgroup>
                        ))
                      ) : allCategories.length > 0 ? (
                        // Fallback: render all categories flat
                        allCategories.map((cat) => (
                          <option key={cat._id || cat.slug} value={cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}>
                            {cat.name}
                          </option>
                        ))
                      ) : (
                        // Default fallback
                        <>
                          <option value="kids-clothing">Kids Clothing</option>
                          <option value="kids-accessories">Kids Accessories</option>
                          <option value="footwear">Footwear</option>
                          <option value="baby-care">Baby Care</option>
                          <option value="toys">Toys</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Description</label>
                  <textarea name="description" value={form.description} onChange={onChange} placeholder="Enter product description" rows="3" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none resize-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">MRP (₹) *</label>
                    <input name="mrp" type="number" value={form.mrp} onChange={onChange} placeholder="0.00" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" required min="0" step="0.01" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Discount (%)</label>
                    <input name="discountPercent" type="number" value={form.discountPercent} onChange={onChange} placeholder="0" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" min="0" max="100" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Selling Price</label>
                    <div className="w-full border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 bg-gray-50 font-bold text-gray-900 text-sm sm:text-base">
                      ₹{form.mrp ? Math.round(form.mrp - (form.mrp * (form.discountPercent || 0) / 100)).toLocaleString('en-IN') : '0.00'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Product Images</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Image 1 (Required) *</label>
                      <input value={form.images.image1} onChange={onChangeNested('images', 'image1')} placeholder="Image URL" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Image 2</label>
                      <input value={form.images.image2} onChange={onChangeNested('images', 'image2')} placeholder="Image URL" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Image 3</label>
                      <input value={form.images.image3} onChange={onChangeNested('images', 'image3')} placeholder="Image URL" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 sm:pt-4">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">Product Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <input value={form.product_info.brand} onChange={onChangeNested('product_info', 'brand')} placeholder="Brand" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.manufacturer} onChange={onChangeNested('product_info', 'manufacturer')} placeholder="Manufacturer" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.clothingType} onChange={onChangeNested('product_info', 'clothingType')} placeholder="Clothing Type" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.gender} onChange={onChangeNested('product_info', 'gender')} placeholder="Gender" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.ageGroup} onChange={onChangeNested('product_info', 'ageGroup')} placeholder="Age Group" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.fabric} onChange={onChangeNested('product_info', 'fabric')} placeholder="Fabric" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.color} onChange={onChangeNested('product_info', 'color')} placeholder="Color" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.footwearType} onChange={onChangeNested('product_info', 'footwearType')} placeholder="Footwear Type" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.shoeMaterial} onChange={onChangeNested('product_info', 'shoeMaterial')} placeholder="Shoe Material" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.soleMaterial} onChange={onChangeNested('product_info', 'soleMaterial')} placeholder="Sole Material" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.accessoryType} onChange={onChangeNested('product_info', 'accessoryType')} placeholder="Accessory Type" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.material} onChange={onChangeNested('product_info', 'material')} placeholder="Material" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.babyCareType} onChange={onChangeNested('product_info', 'babyCareType')} placeholder="Baby Care Type" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.ageRange} onChange={onChangeNested('product_info', 'ageRange')} placeholder="Age Range" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.safetyStandard} onChange={onChangeNested('product_info', 'safetyStandard')} placeholder="Safety Standard" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.quantity} onChange={onChangeNested('product_info', 'quantity')} placeholder="Quantity" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.toyType} onChange={onChangeNested('product_info', 'toyType')} placeholder="Toy Type" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <input value={form.product_info.includedComponents} onChange={onChangeNested('product_info', 'includedComponents')} placeholder="Included Components" className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-pink-500 focus:outline-none" />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 sm:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.product_info.batteryRequired} onChange={onChangeNested('product_info', 'batteryRequired')} className="w-4 h-4" />
                        <span className="text-xs sm:text-sm text-gray-700">Battery Required</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.product_info.batteryIncluded} onChange={onChangeNested('product_info', 'batteryIncluded')} className="w-4 h-4" />
                        <span className="text-xs sm:text-sm text-gray-700">Battery Included</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? 'Creating...' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-md shadow-2xl my-2 sm:my-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center rounded-t-xl sm:rounded-t-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-white">Edit Product</h3>
                <button onClick={closeEditModal} className="text-white hover:text-gray-200 flex-shrink-0">
                  <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateProduct} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {error && <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}
                
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">MRP (₹)</label>
                  <input
                    type="number"
                    name="mrp"
                    value={editForm.mrp}
                    onChange={handleEditChange}
                    className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-indigo-500 focus:outline-none"
                    required
                    min="1"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Discount (%)</label>
                  <input
                    type="number"
                    name="discountPercent"
                    value={editForm.discountPercent}
                    onChange={handleEditChange}
                    className="w-full text-sm sm:text-base border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 focus:border-indigo-500 focus:outline-none"
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
                
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-3 sm:p-4 rounded-lg border-2 border-indigo-200">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Selling Price:</div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    ₹{editForm.price ? editForm.price.toLocaleString('en-IN') : '0.00'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    (MRP - {editForm.discountPercent}% discount)
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Product Modal */}
        {isViewModalOpen && viewingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-3xl shadow-2xl my-2 sm:my-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center rounded-t-xl sm:rounded-t-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-white truncate pr-2">Product Details</h3>
                <button onClick={closeViewModal} className="text-white hover:text-gray-200 flex-shrink-0">
                  <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <img
                      src={viewingProduct?.images?.image1 || viewingProduct?.image || 'https://via.placeholder.com/400'}
                      alt={viewingProduct.title}
                      className="w-full h-48 sm:h-64 object-contain rounded-lg border-2 border-gray-200"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400'; }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">{viewingProduct.title}</h3>
                    <div className="mb-3 sm:mb-4">
                      <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-semibold">
                        {viewingProduct.category || 'Uncategorized'}
                      </span>
                    </div>
                    <div className="space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center justify-between text-sm sm:text-base">
                        <span className="text-gray-600">MRP:</span>
                        <span className="text-gray-400 line-through">₹{(viewingProduct.mrp || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm sm:text-base">
                        <span className="text-gray-600">Discount:</span>
                        <span className="text-green-600 font-semibold">{viewingProduct.discountPercent || 0}% OFF</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t text-sm sm:text-base">
                        <span className="font-semibold text-gray-900">Selling Price:</span>
                        <span className="text-xl sm:text-2xl font-bold text-gray-900">₹{priceFor(viewingProduct).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {viewingProduct.description && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">Description</h4>
                    <p className="text-sm sm:text-base text-gray-600">{viewingProduct.description}</p>
                  </div>
                )}
                
                {viewingProduct.product_info && Object.keys(viewingProduct.product_info).length > 0 && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">Product Information</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {Object.entries(viewingProduct.product_info).map(([key, value]) => {
                        if (!value || (typeof value === 'boolean' && !value)) return null;
                        return (
                          <div key={key} className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                            <div className="text-xs text-gray-500 uppercase mb-1 line-clamp-1">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                            <div className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2">{String(value)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
};

export default AdminProducts;
