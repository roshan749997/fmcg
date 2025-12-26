import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { getMyAddress, getMyOrders, updateAddressById, saveMyAddress, getOrderById, deleteAddressById } from '../services/api';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiSettings, FiPackage, FiUser, FiMapPin, FiLogOut, FiMenu, FiX, FiEdit, FiEye, FiShoppingBag, FiDollarSign, FiClock, FiCheckCircle, FiTrendingUp, FiHeart, FiHome, FiBriefcase, FiTrash2, FiSave, FiFileText, FiTruck, FiCreditCard, FiMap, FiCamera, FiUpload } from 'react-icons/fi';
import ScrollToTop from '../components/ScrollToTop';
import { getProductImage } from '../utils/imagePlaceholder';
import Invoice from '../components/Invoice';

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

export default function FlipkartAccountSettings() {
  const initialTab = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      return tab && ['orders', 'profile', 'addresses'].includes(tab) ? tab : 'profile';
    } catch {
      return 'profile';
    }
  })();
  const [activeSection, setActiveSection] = useState(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: 'male',
    avatar: ''
  });
  const [profilePicture, setProfilePicture] = useState('');
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
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
  const [filteredStates, setFilteredStates] = useState([...indianStates]);
  const [stateSearchTerm, setStateSearchTerm] = useState('');
  const stateDropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const StatusBadge = ({ status }) => {
    const s = String(status || '').toLowerCase();
    const statusConfig = {
      created: { bg: 'bg-pink-100', text: 'text-black', border: 'border-pink-100', icon: FiClock, label: 'Pending' },
      confirmed: { bg: 'bg-pink-100', text: 'text-black', border: 'border-pink-100', icon: FiCheckCircle, label: 'Confirmed' },
      on_the_way: { bg: 'bg-pink-100', text: 'text-black', border: 'border-pink-100', icon: FiPackage, label: 'On the Way' },
      delivered: { bg: 'bg-pink-100', text: 'text-black', border: 'border-pink-100', icon: FiCheckCircle, label: 'Delivered' },
      failed: { bg: 'bg-pink-100', text: 'text-black', border: 'border-pink-100', icon: FiX, label: 'Failed' },
      paid: { bg: 'bg-pink-100', text: 'text-black', border: 'border-pink-100', icon: FiCheckCircle, label: 'Paid' },
    };
    const config = statusConfig[s] || { bg: 'bg-pink-100', text: 'text-black', border: 'border-pink-100', icon: FiClock, label: 'Unknown' };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${config.border} border`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log('Fetching user data...');
      const userData = await api.me();
      console.log('User data received:', userData);
      console.log('Full user object:', JSON.stringify(userData?.user, null, 2));
      console.log('Phone number from API (phone):', userData?.user?.phone);
      console.log('Phone number from API (mobile):', userData?.user?.mobile);
      console.log('Phone number from API (phoneNumber):', userData?.user?.phoneNumber);
      
      if (!userData || !userData.user) {
        throw new Error('No user data received');
      }
      
      const fullName = userData.user?.name || '';
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const adminStatus = userData.user?.isAdmin || localStorage.getItem('auth_is_admin') === 'true';
      
      // Try multiple possible fields for phone number
      const phoneNumber = userData.user?.phone || 
                         userData.user?.mobile || 
                         userData.user?.phoneNumber || 
                         '';
      
      console.log('Final mobile number to set:', phoneNumber);
      console.log('Mobile number type:', typeof phoneNumber);
      console.log('Mobile number length:', phoneNumber?.length);
      
      setUser({
        firstName: firstName,
        lastName: lastName,
        email: userData.user?.email || '',
        mobile: phoneNumber,
        gender: 'male',
        avatar: userData.user?.avatar || ''
      });
      setProfilePicture(userData.user?.avatar || '');
      setProfilePicturePreview(userData.user?.avatar || '');
      setImageError(false);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('Failed to load profile. Please try logging in again.');
      navigate('/signin');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const addressData = await getMyAddress();
      if (addressData && addressData._id) {
        setAddresses([addressData]);
      } else if (Array.isArray(addressData)) {
        setAddresses(addressData);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const openEditModal = (address = null) => {
    if (address) {
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
    } else {
      // Add new address mode
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
    }
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
        await updateAddressById(editingAddress._id, payload);
      } else {
        await saveMyAddress(payload);
      }
      
      await fetchAddresses();
      closeEditModal();
      alert('Address saved successfully!');
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  useEffect(() => {
    if (stateSearchTerm) {
      setFilteredStates(
        indianStates.filter(state =>
          state.toLowerCase().includes(stateSearchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredStates([...indianStates]);
    }
  }, [stateSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target)) {
        setShowStateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchAddresses();
  }, []);

  // Debug: Log user state whenever it changes
  useEffect(() => {
    console.log('User state updated:', user);
    console.log('Mobile number in state:', user.mobile);
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['orders', 'profile', 'addresses'].includes(tab)) {
      setActiveSection(tab);
    }
  }, [location.search]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingOrders(true);
        const data = await getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    if (activeSection === 'orders') load();
  }, [activeSection]);

  const refreshOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_is_admin');
        localStorage.removeItem('user_data');
        window.location.href = '/signin';
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Reset image error when selecting new image
    setImageError(false);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPicture = async () => {
    if (!profilePicturePreview && !profilePicture) {
      alert('Please select an image first');
      return;
    }

    try {
      setUploadingPicture(true);
      const avatarUrl = profilePicturePreview || profilePicture;
      
      // Check if base64 image is too large
      if (avatarUrl.startsWith('data:image')) {
        const base64Length = avatarUrl.length;
        // Base64 increases size by ~33%, so calculate original size
        // Remove data URL prefix to get actual base64 length
        const base64Data = avatarUrl.includes(',') ? avatarUrl.split(',')[1] : avatarUrl;
        const base64SizeKB = base64Data.length * 3 / 4 / 1024; // Approximate original size in KB
        const base64SizeMB = base64SizeKB / 1024;
        
        console.log('Image size check:', {
          base64Length,
          estimatedOriginalSizeKB: base64SizeKB.toFixed(2),
          estimatedOriginalSizeMB: base64SizeMB.toFixed(2)
        });
        
        // Warn if original image is > 3MB (base64 would be ~4MB)
        if (base64SizeMB > 3) {
          const proceed = window.confirm(
            `The image is quite large (approximately ${base64SizeMB.toFixed(1)}MB). ` +
            `This may take longer to upload. Continue?`
          );
          if (!proceed) {
            setUploadingPicture(false);
            return;
          }
        }
      }
      
      console.log('Uploading profile picture...', { 
        hasPreview: !!profilePicturePreview, 
        hasPicture: !!profilePicture,
        urlLength: avatarUrl.length,
        isBase64: avatarUrl.startsWith('data:image')
      });
      
      // If it's a data URL (base64), you might want to upload to Cloudinary first
      // For now, we'll accept both URLs and base64 data URLs
      const result = await api.updateProfile({ avatar: avatarUrl });
      console.log('Profile picture update result:', result);
      
      setProfilePicture(avatarUrl);
      setUser(prev => ({ ...prev, avatar: avatarUrl }));
      setImageError(false);
      
      // Update localStorage
      try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed.user) {
            parsed.user.avatar = avatarUrl;
          } else {
            parsed.avatar = avatarUrl;
          }
          localStorage.setItem('user_data', JSON.stringify(parsed));
        }
      } catch (err) {
        console.error('Error updating localStorage:', err);
      }
      
      // Dispatch event to notify Navbar
      window.dispatchEvent(new CustomEvent('profilePictureUpdated', { detail: { avatar: avatarUrl } }));
      window.dispatchEvent(new Event('storage'));
      
      alert('Profile picture updated successfully!');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      
      let errorMessage = 'Unknown error';
      if (error.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.status === 413) {
        errorMessage = 'Image is too large. Please use a smaller image (max 2MB recommended).';
      } else if (error.response?.message) {
        errorMessage = error.response.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Failed to update profile picture: ${errorMessage}. Please try again.`);
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleRemovePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    try {
      setUploadingPicture(true);
      await api.updateProfile({ avatar: '' });
      setProfilePicture('');
      setProfilePicturePreview('');
      setImageError(false);
      setUser(prev => ({ ...prev, avatar: '' }));
      
      // Update localStorage
      try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed.user) {
            parsed.user.avatar = '';
          } else {
            parsed.avatar = '';
          }
          localStorage.setItem('user_data', JSON.stringify(parsed));
        }
      } catch (err) {
        console.error('Error updating localStorage:', err);
      }
      
      // Dispatch event to notify Navbar
      window.dispatchEvent(new CustomEvent('profilePictureUpdated', { detail: { avatar: '' } }));
      window.dispatchEvent(new Event('storage'));
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      alert('Profile picture removed successfully!');
    } catch (error) {
      console.error('Error removing profile picture:', error);
      alert('Failed to remove profile picture. Please try again.');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    const url = new URL(window.location);
    url.searchParams.set('tab', section);
    window.history.pushState({}, '', url);
  };

  const MenuItem = ({ icon: Icon, label, section, isLogout = false, isAdmin = false }) => (
    <div 
      onClick={isLogout ? handleLogout : () => handleSectionChange(section)}
      className={`flex items-center justify-between px-4 lg:px-6 py-3.5 cursor-pointer transition-all duration-200 rounded-lg mx-2 lg:mx-3 mb-1 ${
        activeSection === section && !isLogout
          ? 'bg-pink-100 text-black shadow-lg transform scale-105' 
          : isLogout
          ? 'bg-pink-100 text-black hover:bg-pink-100'
          : isAdmin
          ? 'bg-pink-100 text-black hover:bg-pink-100'
          : 'text-black hover:bg-pink-100 hover:text-black'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {!isLogout && <span className={activeSection === section ? 'text-white' : 'text-black'}>›</span>}
    </div>
  );

  const AdminButton = () => (
    <Link to="/admin" className="block">
      <MenuItem
        icon={FiSettings}
        label="Admin Dashboard"
        section="admin"
        isAdmin={true}
      />
    </Link>
  );

  // Calculate statistics
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const pendingOrders = orders.filter(o => ['created', 'confirmed', 'on_the_way'].includes(o.status?.toLowerCase())).length;
  const deliveredOrders = orders.filter(o => o.status?.toLowerCase() === 'delivered').length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
  const recentOrders = orders.slice(0, 3);

  const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleViewInvoice = async (orderId) => {
    setLoadingInvoice(true);
    setShowInvoiceModal(true);
    try {
      const orderData = await getOrderById(orderId);
      setSelectedOrder(orderData);
    } catch (error) {
      console.error('Error fetching order for invoice:', error);
      alert('Failed to load invoice. Please try again.');
      setShowInvoiceModal(false);
    } finally {
      setLoadingInvoice(false);
    }
  };

  const getOrderStatusInfo = (status) => {
    const s = String(status || '').toLowerCase();
    const statusInfo = {
      created: { 
        label: 'Order Placed', 
        description: 'Your order has been placed successfully',
        color: 'text-black',
        bgColor: 'bg-white',
        borderColor: 'border-gray-200'
      },
      confirmed: { 
        label: 'Confirmed', 
        description: 'Order confirmed and being prepared',
        color: 'text-black',
        bgColor: 'bg-white',
        borderColor: 'border-gray-200'
      },
      on_the_way: { 
        label: 'On the Way', 
        description: 'Your order is out for delivery',
        color: 'text-black',
        bgColor: 'bg-white',
        borderColor: 'border-gray-200'
      },
      delivered: { 
        label: 'Delivered', 
        description: 'Order has been delivered',
        color: 'text-black',
        bgColor: 'bg-white',
        borderColor: 'border-gray-200'
      },
      paid: { 
        label: 'Paid', 
        description: 'Payment received',
        color: 'text-black',
        bgColor: 'bg-white',
        borderColor: 'border-gray-200'
      },
      failed: { 
        label: 'Failed', 
        description: 'Order could not be processed',
        color: 'text-black',
        bgColor: 'bg-white',
        borderColor: 'border-gray-200'
      },
    };
    return statusInfo[s] || { 
      label: 'Unknown', 
      description: 'Status information not available',
      color: 'text-black',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    };
  };

  return (
    <div className="min-h-screen bg-white">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-pink-100 border-t-transparent"></div>
            <p className="mt-4 text-black font-medium">Loading your profile...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row w-full min-h-screen">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white shadow-lg px-4 py-4 flex items-center justify-between sticky z-40 top-0 border-b-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-black text-lg font-bold shadow-lg overflow-hidden">
                  {(profilePicture || user.avatar) && !imageError ? (
                    <img 
                      src={profilePicturePreview || profilePicture || user.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {(user.firstName || user.email || user.mobile || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center shadow-lg"
                  title="Change profile picture"
                >
                  <FiCamera className="w-3 h-3 text-black" />
                </button>
              </div>
              <div>
                <div className="text-xs text-black font-medium">Hello,</div>
                <div className="font-bold text-black text-sm">{user.firstName || user.email || user.mobile || 'User'}</div>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-pink-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6 text-black" />
              ) : (
                <FiMenu className="w-6 h-6 text-black" />
              )}
            </button>
          </div>

          {/* Sidebar */}
          <div className={`
            fixed lg:static inset-0 z-40 lg:z-0
            transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            transition-transform duration-300 ease-in-out
            w-full lg:w-72 xl:w-80 bg-white shadow-xl lg:shadow-lg flex-shrink-0
            overflow-y-auto border-r-2 border-gray-200
          `}>
            {/* Overlay for mobile */}
            {mobileMenuOpen && (
              <div 
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 -z-10"
                onClick={() => setMobileMenuOpen(false)}
              />
            )}

            {/* User Profile - Desktop only */}
            <div className="hidden lg:block p-6 border-b-2 border-gray-200 bg-white">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-black text-2xl font-bold shadow-lg overflow-hidden">
                    {(profilePicture || user.avatar) && !imageError ? (
                      <img 
                        src={profilePicturePreview || profilePicture || user.avatar} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {(user.firstName || user.email || user.mobile || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Change profile picture"
                  >
                    <FiCamera className="w-3 h-3 text-black" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-black font-medium">Hello,</div>
                  <div className="font-bold text-black text-lg truncate">
                    {user.firstName || user.email || user.mobile || 'User'} {user.lastName}
                  </div>
                  <div className="text-xs text-black mt-1 truncate">{user.email}</div>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="py-4">
              <MenuItem 
                icon={FiShoppingBag}
                label="MY ORDERS"
                section="orders"
              />
              <MenuItem 
                icon={FiUser}
                label="Profile Information"
                section="profile"
              />
              <MenuItem 
                icon={FiMapPin}
                label="Manage Addresses"
                section="addresses"
              />
              {isAdmin && <AdminButton />}
              <div className="my-4 mx-5 border-t border-gray-200"></div>
              <MenuItem 
                icon={FiLogOut}
                label="Logout"
                isLogout={true}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              {/* Mobile Quick Tabs */}
              <div className="lg:hidden mb-6">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSectionChange('orders')}
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      activeSection === 'orders' 
                        ? 'bg-pink-100 text-black shadow-lg' 
                        : 'bg-pink-100 text-black hover:bg-pink-100'
                    }`}
                  >
                    Orders
                  </button>
                  <button
                    onClick={() => handleSectionChange('profile')}
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      activeSection === 'profile' 
                        ? 'bg-pink-100 text-black shadow-lg' 
                        : 'bg-pink-100 text-black hover:bg-pink-100'
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => handleSectionChange('addresses')}
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      activeSection === 'addresses' 
                        ? 'bg-pink-100 text-black shadow-lg' 
                        : 'bg-pink-100 text-black hover:bg-pink-100'
                    }`}
                  >
                    Addresses
                  </button>
                </div>
              </div>

              {activeSection === 'profile' && (
                <div className="space-y-6">
                  {/* Profile Picture Section */}
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-2 border-gray-200">
                    <div className="p-4 sm:p-6 border-b-2 border-gray-200 bg-white">
                      <h2 className="text-lg sm:text-xl font-bold text-black flex items-center gap-2">
                        <FiCamera className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                        Profile Picture
                      </h2>
                      <p className="text-xs text-black mt-1">Upload or change your profile picture</p>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Profile Picture Preview */}
                        <div className="relative">
                          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-pink-100 flex items-center justify-center text-black text-3xl sm:text-4xl font-bold shadow-lg overflow-hidden border-4 border-gray-200">
                            {(profilePicturePreview || profilePicture || user.avatar) && !imageError ? (
                              <img 
                                src={profilePicturePreview || profilePicture || user.avatar} 
                                alt="Profile Preview" 
                                className="w-full h-full object-cover"
                                onError={() => setImageError(true)}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {(user.firstName || user.email || user.mobile || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1 space-y-4">
                          <div className="space-y-3">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-pink-100 text-black border-2 border-pink-200 hover:bg-pink-100 transition-all flex items-center justify-center gap-2"
                              >
                                <FiUpload className="w-4 h-4" />
                                {profilePicturePreview ? 'Change Picture' : 'Choose Picture'}
                              </button>
                              {profilePicturePreview && (
                                <button
                                  onClick={handleUploadPicture}
                                  disabled={uploadingPicture}
                                  className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-pink-100 text-black border-2 border-pink-200 hover:bg-pink-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  {uploadingPicture ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <FiSave className="w-4 h-4" />
                                      Save Picture
                                    </>
                                  )}
                                </button>
                              )}
                              {(profilePicture || user.avatar) && !profilePicturePreview && (
                                <button
                                  onClick={handleRemovePicture}
                                  disabled={uploadingPicture}
                                  className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-white text-black border-2 border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                  Remove
                                </button>
                              )}
                              {profilePicturePreview && (
                                <button
                                  onClick={() => {
                                    setProfilePicturePreview('');
                                    fileInputRef.current && (fileInputRef.current.value = '');
                                  }}
                                  className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-white text-black border-2 border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                >
                                  <FiX className="w-4 h-4" />
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-black space-y-1">
                            <p className="flex items-center gap-1">
                              <FiCheckCircle className="w-3 h-3" />
                              Supported formats: JPG, PNG, GIF
                            </p>
                            <p className="flex items-center gap-1">
                              <FiCheckCircle className="w-3 h-3" />
                              Maximum file size: 5MB
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-black mb-1 uppercase">Total Orders</p>
                          <p className="text-2xl sm:text-3xl font-bold text-black">{totalOrders}</p>
                          <p className="text-[10px] text-black mt-1">All time orders</p>
                        </div>
                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center shadow-md">
                          <FiShoppingBag className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-black mb-1 uppercase">Total Spent</p>
                          <p className="text-2xl sm:text-3xl font-bold text-black">{formatINR(totalSpent)}</p>
                          <p className="text-[10px] text-black mt-1">Lifetime value</p>
                        </div>
                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center shadow-md">
                          <FiDollarSign className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-black mb-1 uppercase">Pending Orders</p>
                          <p className="text-2xl sm:text-3xl font-bold text-black">{pendingOrders}</p>
                          <p className="text-[10px] text-black mt-1">In progress</p>
                        </div>
                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center shadow-md">
                          <FiClock className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-black mb-1 uppercase">Delivered</p>
                          <p className="text-2xl sm:text-3xl font-bold text-black">{deliveredOrders}</p>
                          <p className="text-[10px] text-black mt-1">Successfully completed</p>
                        </div>
                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center shadow-md">
                          <FiCheckCircle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  {totalOrders > 0 && (
                    <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-md mb-6">
                      <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                        <FiTrendingUp className="w-5 h-5 text-black" />
                        Order Statistics
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                          <div className="text-2xl font-bold text-black">{formatINR(averageOrderValue)}</div>
                          <div className="text-xs text-black mt-1">Average Order Value</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                          <div className="text-2xl font-bold text-black">{Math.round((deliveredOrders / totalOrders) * 100)}%</div>
                          <div className="text-xs text-black mt-1">Delivery Success Rate</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                          <div className="text-2xl font-bold text-black">{recentOrders.length}</div>
                          <div className="text-xs text-black mt-1">Recent Orders</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Personal Information */}
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-2 border-gray-200">
                    <div className="p-4 sm:p-6 border-b-2 border-gray-200 bg-white">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg sm:text-xl font-bold text-black flex items-center gap-2">
                          <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                          Personal Information
                        </h2>
                        <span className="text-xs text-black bg-white px-3 py-1 rounded-full font-semibold border border-gray-200">Read Only</span>
                      </div>
                      <p className="text-xs text-black mt-2">Your account details are managed securely</p>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-xs font-bold text-black mb-2 flex items-center gap-1">
                            First Name
                            <span className="text-black text-[10px]">(Required)</span>
                          </label>
                          <input 
                            type="text" 
                            value={user.firstName || 'Not provided'}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 transition-all text-black"
                            readOnly
                          />
                          <p className="text-[10px] text-black mt-1">Your first name as registered</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-black mb-2 flex items-center gap-1">
                            Last Name
                            <span className="text-black text-[10px]">(Optional)</span>
                          </label>
                          <input 
                            type="text" 
                            value={user.lastName || 'Not provided'}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 transition-all text-black"
                            readOnly
                          />
                          <p className="text-[10px] text-black mt-1">Your last name or surname</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-2 border-gray-200">
                    <div className="p-4 sm:p-6 border-b-2 border-gray-200 bg-white">
                      <h2 className="text-lg sm:text-xl font-bold text-black flex items-center gap-2">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                        Email Address
                      </h2>
                      <p className="text-xs text-black mt-1">Primary contact email for your account</p>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <input 
                          type="text" 
                          value={user.email || 'Not provided'}
                          className="flex-1 w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 transition-all text-black"
                          readOnly
                        />
                        {user.email && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-pink-100 border-2 border-pink-200 rounded-lg">
                            <FiCheckCircle className="w-4 h-4 text-white" />
                            <span className="text-xs font-semibold text-white">Verified</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-black flex items-center gap-1">
                          <FiCheckCircle className="w-3 h-3 text-black" />
                          Used for account login and authentication
                        </p>
                        <p className="text-xs text-black flex items-center gap-1">
                          <FiCheckCircle className="w-3 h-3 text-black" />
                          Order confirmations and shipping updates
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-2 border-gray-200">
                    <div className="p-4 sm:p-6 border-b-2 border-gray-200 bg-white">
                      <h2 className="text-lg sm:text-xl font-bold text-black flex items-center gap-2">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                        </svg>
                        Mobile Number
                      </h2>
                      <p className="text-xs text-black mt-1">Contact number for delivery and updates</p>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <input 
                          type="text" 
                          value={user.mobile && user.mobile.trim() !== '' ? user.mobile : 'Not provided'}
                          placeholder="Mobile number"
                          className="flex-1 w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 transition-all text-black"
                          readOnly
                        />
                        {user.mobile && user.mobile.trim() !== '' ? (
                          <div className="flex items-center gap-2 px-3 py-2 bg-pink-100 border-2 border-pink-200 rounded-lg">
                            <FiCheckCircle className="w-4 h-4 text-white" />
                            <span className="text-xs font-semibold text-white">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2 bg-pink-100 border-2 border-pink-200 rounded-lg">
                            <FiClock className="w-4 h-4 text-white" />
                            <span className="text-xs font-semibold text-white">Not Added</span>
                          </div>
                        )}
                      </div>
                      {user.mobile && user.mobile.trim() !== '' && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-xs text-black font-semibold mb-1">Mobile Number:</p>
                          <p className="text-sm text-black font-mono">{user.mobile}</p>
                        </div>
                      )}
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-black flex items-center gap-1">
                          <FiCheckCircle className="w-3 h-3 text-black" />
                          Receive SMS updates for order status
                        </p>
                        <p className="text-xs text-black flex items-center gap-1">
                          <FiCheckCircle className="w-3 h-3 text-black" />
                          Delivery partner will contact you on this number
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FAQs */}
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-2 border-gray-200">
                    <div className="p-4 sm:p-6 border-b-2 border-gray-200 bg-white">
                      <h2 className="text-lg sm:text-xl font-bold text-black flex items-center gap-2">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
                        </svg>
                        Frequently Asked Questions
                      </h2>
                      <p className="text-xs text-black mt-1">Common questions about your account</p>
                    </div>
                    <div className="p-4 sm:p-6 space-y-4">
                      {[
                        {
                          q: 'What happens when I update my email address or mobile number?',
                          a: 'Your login credentials will change accordingly. You\'ll receive all account-related communications, including order confirmations and shipping updates, on your updated contact information.'
                        },
                        {
                          q: 'When will my account be updated with the new email or mobile number?',
                          a: 'Your account will be updated immediately after you verify the new contact information using the verification code sent to your email or mobile number.'
                        },
                        {
                          q: 'What happens to my existing account when I update my contact information?',
                          a: 'Your account remains fully functional. All your order history, saved addresses, wishlist items, and personal details will be preserved. Only your login credentials will change.'
                        },
                        {
                          q: 'How can I change my profile information?',
                          a: 'Currently, profile information is managed through your account settings. For security reasons, some information may require verification before changes can be made.'
                        }
                      ].map((faq, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 sm:p-5 border-2 border-gray-200 hover:shadow-md transition-all">
                          <div className="font-bold text-black mb-2 text-sm sm:text-base flex items-start gap-2">
                            <span className="text-black mt-0.5">Q:</span>
                            <span>{faq.q}</span>
                          </div>
                          <div className="text-xs sm:text-sm text-black leading-relaxed ml-6">
                            <span className="text-black font-semibold">A:</span> {faq.a}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'orders' && (
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 border-2 border-gray-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-black mb-1 flex items-center gap-2">
                        <FiShoppingBag className="w-6 h-6 text-black" />
                        Your Orders
                      </h2>
                      <p className="text-xs sm:text-sm text-black">Track and manage all your orders in one place</p>
                    </div>
                    <button 
                      onClick={refreshOrders} 
                      className="px-4 py-2.5 rounded-lg text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 bg-pink-100 text-black border-2 border-pink-200"
                    >
                      Refresh
                    </button>
                  </div>
                  {loadingOrders ? (
                    <div className="flex justify-center py-12">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-100 border-t-transparent"></div>
                        <p className="mt-4 text-black">Loading orders...</p>
                      </div>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map((order) => {
                        const isExpanded = expandedOrders.has(order._id);
                        const statusInfo = getOrderStatusInfo(order.status);
                        const orderDate = new Date(order.createdAt);
                        const estimatedDelivery = new Date(orderDate);
                        estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
                        
                        return (
                          <div key={order._id} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-400 hover:shadow-lg transition-all duration-300 bg-white">
                            {/* Order Header */}
                            <div className="p-4 sm:p-5">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="text-sm font-semibold text-black">Order ID:</div>
                                    <span className="font-mono font-bold text-black text-base">#{String(order._id).slice(-8).toUpperCase()}</span>
                                  </div>
                                  <div className="text-xs text-black flex items-center gap-2 mb-2">
                                    <FiClock className="w-3 h-3" />
                                    <span>Placed on {orderDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    <span className="text-black">•</span>
                                    <span>{orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <StatusBadge status={order.status} />
                                    {order.paymentMethod && (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-black border border-pink-200">
                                        <FiCreditCard className="w-3 h-3" />
                                        {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg sm:text-xl font-bold text-black mb-1">{formatINR(order.amount)}</div>
                                  <div className="text-xs text-black">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</div>
                                </div>
                              </div>

                              {/* Order Status Info */}
                              <div className="bg-white border-gray-200 border-2 rounded-lg p-3 mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-2 h-2 rounded-full bg-black"></div>
                                  <span className="font-semibold text-black">{statusInfo.label}</span>
                                </div>
                                <p className="text-xs text-black ml-4">{statusInfo.description}</p>
                              </div>

                              {/* Order Items Preview */}
                              <div className="space-y-2 mb-4">
                                {order.items?.slice(0, isExpanded ? order.items.length : 2).map((it, idx) => {
                                  const productImage = getProductImage(it.product, 'image1');
                                  const productTitle = it.product?.title || it.product?.name || 'Product';
                                  const productPrice = it.price || it.product?.price || it.product?.mrp || 0;
                                  
                                  return (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-white transition-colors border border-gray-200">
                                      <img 
                                        src={productImage} 
                                        alt={productTitle} 
                                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0" 
                                        onError={(e) => { e.target.src = getProductImage(null); }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm sm:text-base font-semibold text-black mb-1 truncate">{productTitle}</div>
                                        <div className="text-xs text-black flex items-center gap-2 flex-wrap">
                                          <span className="bg-pink-100 text-black px-2 py-0.5 rounded font-semibold">Qty: {it.quantity}</span>
                                          {it.size && <span className="bg-pink-100 text-black px-2 py-0.5 rounded font-semibold">Size: {it.size}</span>}
                                        </div>
                                      </div>
                                      <div className="text-sm sm:text-base font-bold text-black">{formatINR(productPrice * (it.quantity || 1))}</div>
                                    </div>
                                  );
                                })}
                                {order.items?.length > 2 && !isExpanded && (
                                  <div className="text-center py-2">
                                    <button
                                      onClick={() => toggleOrderExpansion(order._id)}
                                      className="text-sm text-black hover:text-black font-semibold"
                                    >
                                      +{order.items.length - 2} more item{(order.items.length - 2) !== 1 ? 's' : ''}
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Expanded Details */}
                              {isExpanded && (
                                <div className="border-t-2 border-gray-200 pt-4 mt-4 space-y-4">
                                  {/* Shipping Address */}
                                  {order.shippingAddress && (
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <div className="flex items-center gap-2 mb-2">
                                        <FiMap className="w-4 h-4 text-black" />
                                        <span className="font-semibold text-black text-sm">Delivery Address</span>
                                      </div>
                                      <div className="text-sm text-black space-y-1 ml-6">
                                        <p className="font-medium">{order.shippingAddress.fullName}</p>
                                        <p>{order.shippingAddress.address || order.shippingAddress.addressLine1}</p>
                                        {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                        {order.shippingAddress.locality && <p>{order.shippingAddress.locality}</p>}
                                        <p>
                                          {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                        </p>
                                        {order.shippingAddress.mobileNumber && (
                                          <p className="mt-2 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                                            </svg>
                                            {order.shippingAddress.mobileNumber}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Order Timeline */}
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center gap-2 mb-3">
                                      <FiTruck className="w-4 h-4 text-black" />
                                      <span className="font-semibold text-black text-sm">Order Timeline</span>
                                    </div>
                                    <div className="space-y-2 ml-6">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-black"></div>
                                        <span className="text-xs text-black">Order Placed</span>
                                        <span className="text-xs text-black ml-auto">{orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-black"></div>
                                        <span className="text-xs text-black">Confirmed</span>
                                        <span className="text-xs text-black ml-auto">Within 24hrs</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-black"></div>
                                        <span className="text-xs text-black">Shipped</span>
                                        <span className="text-xs text-black ml-auto">2-3 days</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-black"></div>
                                        <span className="text-xs text-black">Delivered</span>
                                        <span className="text-xs text-black ml-auto">{estimatedDelivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Order Summary */}
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center gap-2 mb-3">
                                      <FiDollarSign className="w-4 h-4 text-black" />
                                      <span className="font-semibold text-black text-sm">Order Summary</span>
                                    </div>
                                    <div className="space-y-2 ml-6 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-black">Subtotal ({order.items?.length || 0} items)</span>
                                        <span className="font-medium text-black">{formatINR(order.amount)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-black">Shipping</span>
                                        <span className="font-medium text-black">Free</span>
                                      </div>
                                      <div className="flex justify-between pt-2 border-t border-gray-300">
                                        <span className="font-bold text-black">Total Amount</span>
                                        <span className="font-bold text-lg text-black">{formatINR(order.amount)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t-2 border-gray-200">
                                <button
                                  onClick={() => toggleOrderExpansion(order._id)}
                                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-pink-100 text-black border-2 border-pink-200 hover:bg-pink-100 transition-all"
                                >
                                  <FiEye className="w-4 h-4 inline mr-2" />
                                  {isExpanded ? 'Show Less' : 'View Details'}
                                </button>
                                <button
                                  onClick={() => handleViewInvoice(order._id)}
                                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-pink-100 text-black hover:bg-pink-100 transition-all shadow-md hover:shadow-lg"
                                >
                                  <FiFileText className="w-4 h-4 inline mr-2" />
                                  View Invoice
                                </button>
                                {order.status?.toLowerCase() === 'delivered' && (
                                  <button
                                    onClick={() => navigate(`/product/${order.items?.[0]?.product?._id || order.items?.[0]?.product?.id}`)}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-pink-100 text-black border-2 border-pink-200 hover:bg-pink-100 transition-all"
                                  >
                                    Buy Again
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16">
                      <div className="relative inline-block mb-6">
                        <FiShoppingBag className="w-24 h-24 sm:w-32 sm:h-32 text-black" />
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center shadow-lg">
                          <FiShoppingBag className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">No Orders Yet</h3>
                      <p className="text-black text-sm sm:text-base mb-6">You haven't placed any orders yet. Start shopping now!</p>
                      <button 
                        onClick={() => navigate('/shop')} 
                        className="px-6 sm:px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 bg-pink-100 text-black border-2 border-pink-200"
                      >
                        Start Shopping
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'addresses' && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200">
                  <div className="p-4 sm:p-6 border-b-2 border-gray-200 bg-white">
                    <h2 className="text-lg sm:text-xl font-bold text-black flex items-center gap-2">
                      <FiMapPin className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                      My Addresses
                    </h2>
                    <p className="text-xs text-black mt-1">Manage your delivery addresses</p>
                  </div>
                  <div className="p-4 sm:p-6">
                    {loadingAddresses ? (
                      <div className="flex justify-center py-12">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-100 border-t-transparent"></div>
                          <p className="mt-4 text-black">Loading addresses...</p>
                        </div>
                      </div>
                    ) : addresses.length > 0 ? (
                      <>
                        <div className="mb-4 flex justify-end">
                          <button
                            onClick={() => openEditModal(null)}
                            className="px-4 py-2 bg-pink-100 text-black rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                          >
                            <FiMapPin className="w-4 h-4" />
                            Add New Address
                          </button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {addresses.map((address, index) => (
                            <div key={address._id || index} className="border-2 border-gray-200 rounded-xl p-4 sm:p-5 hover:border-gray-400 hover:shadow-lg transition-all duration-300 bg-white">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-black text-base sm:text-lg flex items-center gap-2">
                                  {address.addressType?.toLowerCase() === 'home' ? (
                                    <FiHome className="w-5 h-5 text-black" />
                                  ) : (
                                    <FiBriefcase className="w-5 h-5 text-black" />
                                  )}
                                  {address.fullName}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {address.isDefault && (
                                    <span className="px-3 py-1 text-xs font-bold bg-pink-100 text-black rounded-full shadow-md">
                                      Default
                                    </span>
                                  )}
                                  <button
                                    onClick={() => openEditModal(address)}
                                    className="p-2 bg-pink-100 text-black rounded-lg transition-colors hover:bg-pink-200"
                                    title="Edit Address"
                                  >
                                    <FiEdit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (window.confirm('Are you sure you want to delete this address?')) {
                                        try {
                                          await deleteAddressById(address._id);
                                          await fetchAddresses();
                                          alert('Address deleted successfully!');
                                        } catch (error) {
                                          console.error('Error deleting address:', error);
                                          alert('Failed to delete address. Please try again.');
                                        }
                                      }
                                    }}
                                    className="p-2 bg-red-100 text-red-700 rounded-lg transition-colors hover:bg-red-200"
                                    title="Delete Address"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-1.5 text-sm text-black">
                                <p className="leading-relaxed">{address.addressLine1 || address.address}</p>
                                {address.addressLine2 && (
                                  <p className="leading-relaxed">{address.addressLine2}</p>
                                )}
                                {address.landmark && (
                                  <p className="text-black italic">Landmark: {address.landmark}</p>
                                )}
                                <p className="font-semibold text-black mt-2">
                                  {address.city}, {address.state} - {address.pincode}
                                </p>
                                <div className="flex items-center gap-2 pt-2 mt-2 border-t border-gray-200">
                                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                                  </svg>
                                  <span className="font-medium text-black">{address.phoneNumber || address.mobileNumber || address.alternatePhone}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 sm:py-16">
                        <div className="relative inline-block mb-6">
                          <FiMapPin className="w-24 h-24 sm:w-32 sm:h-32 text-black" />
                          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center shadow-lg">
                            <FiMapPin className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">No Addresses Saved</h3>
                        <p className="text-black text-sm sm:text-base mb-6">You haven't added any addresses yet. Add your first address to get started with faster checkout.</p>
                        <button 
                          onClick={() => openEditModal(null)}
                          className="px-6 sm:px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 bg-pink-100 text-black border-2 border-pink-200"
                        >
                          Add New Address
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-pink-100 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
              <h3 className="text-xl font-bold text-white">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={closeEditModal} className="text-white hover:text-white">
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveAddress} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={addressFormData.fullName}
                    onChange={handleAddressFormChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={addressFormData.mobileNumber}
                    onChange={handleAddressFormChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none text-black"
                    required
                    maxLength="10"
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Address Line 1 *</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={addressFormData.addressLine1}
                  onChange={handleAddressFormChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={addressFormData.addressLine2}
                  onChange={handleAddressFormChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Locality</label>
                <input
                  type="text"
                  name="locality"
                  value={addressFormData.locality}
                  onChange={handleAddressFormChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none text-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={addressFormData.city}
                    onChange={handleAddressFormChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none text-black"
                    required
                  />
                </div>
                <div className="relative" ref={stateDropdownRef}>
                  <label className="block text-sm font-semibold text-black mb-2">State *</label>
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
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none text-black"
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
                          className="px-4 py-2 hover:bg-pink-100 hover:text-black cursor-pointer text-sm text-black"
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
                  <label className="block text-sm font-semibold text-black mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={addressFormData.pincode}
                    onChange={handleAddressFormChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none text-black"
                    required
                    maxLength="6"
                    pattern="[0-9]{6}"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Address Type *</label>
                  <select
                    name="addressType"
                    value={addressFormData.addressType}
                    onChange={handleAddressFormChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none text-black"
                    required
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={addressFormData.landmark}
                  onChange={handleAddressFormChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Alternate Phone</label>
                <input
                  type="tel"
                  name="alternatePhone"
                  value={addressFormData.alternatePhone}
                  onChange={handleAddressFormChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none text-black"
                  maxLength="10"
                  pattern="[0-9]{10}"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-2 border-2 border-gray-300 rounded-lg text-black font-semibold hover:bg-white transition-all"
                  disabled={savingAddress}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-pink-100 text-black rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                  disabled={savingAddress}
                >
                  <FiSave className="w-4 h-4" />
                  {savingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowInvoiceModal(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
              <h2 className="text-xl font-bold text-black">Invoice</h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-black hover:text-black transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {loadingInvoice ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-100 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-black">Loading invoice...</p>
                </div>
              ) : selectedOrder ? (
                <Invoice 
                  order={selectedOrder} 
                  user={user}
                  onPrint={() => window.print()}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-black">Order details not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ScrollToTop />
    </div>
  );
}
