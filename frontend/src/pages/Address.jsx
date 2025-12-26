import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getMyAddress, saveMyAddress, deleteAddressById, updateAddressById, createPaymentOrder, verifyPayment, createCodOrder } from '../services/api';
import ScrollToTop from '../components/ScrollToTop';

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

export default function AddressForm() {
  const navigate = useNavigate();
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [filteredStates, setFilteredStates] = useState([...indianStates]);
  const [searchTerm, setSearchTerm] = useState('');
  const stateDropdownRef = useRef(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [addressId, setAddressId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Close dropdown when clicking outside
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
    if (searchTerm) {
      setFilteredStates(
        indianStates.filter(state =>
          state.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredStates([...indianStates]);
    }
  }, [searchTerm]);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
    alternatePhone: '',
    addressType: 'home'
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cod'
  const { cart, cartTotal: total, loadCart } = useCart();

  // Calculate price details
  const calculatePriceDetails = () => {
    const subtotal = total || 0;
    const shippingCharge = subtotal < 5000 ? 99 : 0;
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const totalPayable = subtotal + shippingCharge + tax;
    const savings = Math.round(subtotal * 0.35); // Assuming 35% savings
    const supercoins = Math.min(30, Math.floor(subtotal / 1000) * 10); // 10 supercoins per 1000 spent, max 30

    return {
      subtotal,
      shippingCharge,
      tax,
      total: totalPayable,
      savings,
      supercoins,
      items: cart?.length || 0,
      cartItems: cart || []
    };
  };

  const priceDetails = calculatePriceDetails();

  const handlePayment = async () => {
    if (!hasSavedAddress) {
      alert('Please save your delivery address first.');
      return;
    }
    
    // Handle Cash on Delivery
    if (paymentMethod === 'cod') {
      try {
        const result = await createCodOrder();
        if (result && result.success) {
          // Store order total before clearing cart
          localStorage.setItem('lastOrderTotal', priceDetails.total.toString());
          await loadCart();
          // Redirect to order success page
          const orderId = result.order?._id || result.order?.id || '';
          navigate(`/order-success?method=COD&orderId=${orderId}`);
        } else {
          const errorMsg = result?.error || 'Failed to place COD order. Please try again.';
          alert(errorMsg);
        }
      } catch (e) {
        console.error('COD order error:', e);
        const errorMsg = e?.message || e?.response?.error || 'Failed to place COD order. Please try again.';
        alert(errorMsg);
      }
      return;
    }
    
    // Handle Online Payment
    try {
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = resolve;
          s.onerror = reject;
          document.body.appendChild(s);
        });
      }
      const amount = priceDetails.total;
      const { order, key } = await createPaymentOrder(amount, {
        name: formData.name,
        mobile: formData.mobile,
        city: formData.city,
      });
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'Kidzo',
        description: 'Order Payment',
        order_id: order.id,
        prefill: { name: formData.name || '', contact: formData.mobile || '' },
        theme: { color: '#FF1493' },
        handler: async function (response) {
          try {
            console.log('[Razorpay] Payment response received:', response);
            
            // Ensure we send the correct field names
            const paymentData = {
              razorpay_order_id: response.razorpay_order_id || response.razorpayOrderId,
              razorpay_payment_id: response.razorpay_payment_id || response.razorpayPaymentId,
              razorpay_signature: response.razorpay_signature || response.razorpaySignature,
            };
            
            console.log('[Razorpay] Sending to backend:', paymentData);
            
            const r = await verifyPayment(paymentData);
            if (r && r.success) {
              // Store order total before clearing cart
              localStorage.setItem('lastOrderTotal', amount.toString());
              await loadCart();
              // Redirect to order success page
              const orderId = r.order?._id || r.order?.id || '';
              navigate(`/order-success?method=online&orderId=${orderId}`);
            } else {
              const errorMsg = r?.error || 'Payment verification failed';
              alert(errorMsg);
            }
          } catch (e) {
            console.error('[Razorpay] Payment verification error:', e);
            console.error('[Razorpay] Error details:', {
              message: e?.message,
              response: e?.response,
              stack: e?.stack,
            });
            const errorMsg = e?.message || e?.response?.error || 'Payment verification failed. Please contact support if amount was deducted.';
            alert(errorMsg);
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      alert('Unable to start payment');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      addressType: type
    }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await resp.json();
        const addr = data.address || {};
        const pincode = addr.postcode || '';
        const city = addr.city || addr.town || addr.village || addr.district || '';
        const state = addr.state || '';
        const locality = addr.suburb || addr.neighbourhood || addr.quarter || '';
        const road = addr.road || addr.residential || '';
        const house = addr.house_number ? `${addr.house_number}, ` : '';
        const composed = `${house}${road}`.trim();
        setFormData((prev) => ({
          ...prev,
          pincode,
          city,
          state,
          locality: locality || prev.locality,
          address: composed || prev.address,
        }));
      } catch (e) {
        console.error('Reverse geocoding failed', e);
        alert('Could not fetch address from location');
      }
    }, (err) => {
      alert('Unable to get your location');
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  const validateForm = () => {
    const errors = [];
    
    // Required fields validation
    if (!formData.name.trim()) errors.push('Name is required');
    if (!formData.mobile.trim()) errors.push('Mobile number is required');
    if (!formData.pincode.trim()) errors.push('Pincode is required');
    if (!formData.locality.trim()) errors.push('Locality is required');
    if (!formData.address.trim()) errors.push('Address is required');
    if (!formData.city.trim()) errors.push('City is required');
    if (!formData.state.trim()) errors.push('State is required');
    
    // Format validations
    if (formData.mobile.trim() && !/^\d{10}$/.test(formData.mobile.trim())) {
      errors.push('Mobile number must be 10 digits');
    }
    
    if (formData.pincode.trim() && !/^\d{6}$/.test(formData.pincode.trim())) {
      errors.push('Pincode must be 6 digits');
    }
    
    if (formData.alternatePhone.trim() && !/^\d{10}$/.test(formData.alternatePhone.trim())) {
      errors.push('Alternate phone must be 10 digits if provided');
    }
    
    return errors;
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n\n' + errors.join('\n'));
      return;
    }
    const payload = {
      fullName: formData.name.trim(),
      mobileNumber: formData.mobile.trim(),
      pincode: formData.pincode.trim(),
      locality: formData.locality.trim(),
      address: formData.address.trim(),
      addressLine1: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      landmark: formData.landmark.trim(),
      alternatePhone: formData.alternatePhone.trim(),
      addressType: formData.addressType === 'work' ? 'Work' : 'Home',
    };
    try {
      setSaving(true);
      if (editMode && addressId) {
        // Update existing address
        await updateAddressById(addressId, payload);
        // Reload addresses
        const addressData = await getMyAddress();
        if (Array.isArray(addressData)) {
          setAddresses(addressData);
        } else if (addressData && addressData._id) {
          setAddresses([addressData]);
        }
      } else {
        // Create new address
        const saved = await saveMyAddress(payload);
        // Reload addresses
        const addressData = await getMyAddress();
        if (Array.isArray(addressData)) {
          setAddresses(addressData);
          if (saved && saved._id) {
            setSelectedAddressId(saved._id);
            setAddressId(saved._id);
          }
        } else if (addressData && addressData._id) {
          setAddresses([addressData]);
          setSelectedAddressId(addressData._id);
          setAddressId(addressData._id);
        }
      }
      setHasSavedAddress(true);
      setShowSuccess(true);
      setEditMode(false);
      setShowForm(false);
      setShowAddForm(false);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save address. Please sign in and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    console.log('Cancel clicked');
  };

  // Load existing addresses on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingAddress(true);
        const addressData = await getMyAddress();
        if (addressData && Array.isArray(addressData) && addressData.length > 0) {
          setAddresses(addressData);
          setHasSavedAddress(true);
          setShowForm(false);
          setShowAddForm(false);
          // Select first address by default
          if (addressData[0] && addressData[0]._id) {
            setSelectedAddressId(addressData[0]._id);
            setAddressId(addressData[0]._id);
            const firstAddr = addressData[0];
            setFormData({
              name: firstAddr.fullName || '',
              mobile: firstAddr.mobileNumber || '',
              pincode: firstAddr.pincode || '',
              locality: firstAddr.locality || '',
              address: firstAddr.address || firstAddr.addressLine1 || '',
              city: firstAddr.city || '',
              state: firstAddr.state || '',
              landmark: firstAddr.landmark || '',
              alternatePhone: firstAddr.alternatePhone || '',
              addressType: (firstAddr.addressType || 'Home').toLowerCase(),
            });
          }
        } else if (addressData && addressData._id) {
          // Handle single address object (backward compatibility)
          setAddresses([addressData]);
          setAddressId(addressData._id);
          setSelectedAddressId(addressData._id);
          setHasSavedAddress(true);
          setShowForm(false);
          setShowAddForm(false);
          setFormData({
            name: addressData.fullName || '',
            mobile: addressData.mobileNumber || '',
            pincode: addressData.pincode || '',
            locality: addressData.locality || '',
            address: addressData.address || addressData.addressLine1 || '',
            city: addressData.city || '',
            state: addressData.state || '',
            landmark: addressData.landmark || '',
            alternatePhone: addressData.alternatePhone || '',
            addressType: (addressData.addressType || 'Home').toLowerCase(),
          });
        } else {
          setAddresses([]);
          setShowForm(true); // Show form if no address exists
          setShowAddForm(true);
        }
      } catch (e) {
        // no-op if unauthenticated
        setAddresses([]);
        setShowForm(true); // Show form if there's an error
        setShowAddForm(true);
      } finally {
        setLoadingAddress(false);
      }
    };
    load();
  }, []);

  const handleEditAddress = (addressToEdit = null) => {
    if (addressToEdit) {
      setAddressId(addressToEdit._id);
      setSelectedAddressId(addressToEdit._id);
      setFormData({
        name: addressToEdit.fullName || '',
        mobile: addressToEdit.mobileNumber || '',
        pincode: addressToEdit.pincode || '',
        locality: addressToEdit.locality || '',
        address: addressToEdit.address || addressToEdit.addressLine1 || '',
        city: addressToEdit.city || '',
        state: addressToEdit.state || '',
        landmark: addressToEdit.landmark || '',
        alternatePhone: addressToEdit.alternatePhone || '',
        addressType: (addressToEdit.addressType || 'Home').toLowerCase(),
      });
    }
    setShowForm(true);
    setEditMode(true);
    setShowAddForm(false);
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address._id);
    setAddressId(address._id);
    setFormData({
      name: address.fullName || '',
      mobile: address.mobileNumber || '',
      pincode: address.pincode || '',
      locality: address.locality || '',
      address: address.address || address.addressLine1 || '',
      city: address.city || '',
      state: address.state || '',
      landmark: address.landmark || '',
      alternatePhone: address.alternatePhone || '',
      addressType: (address.addressType || 'Home').toLowerCase(),
    });
    setShowForm(false);
    setShowAddForm(false);
  };

  const handleAddNewAddress = () => {
    setShowForm(true);
    setShowAddForm(true);
    setEditMode(false);
    setAddressId(null);
    setSelectedAddressId(null);
    setFormData({
      name: '',
      mobile: '',
      pincode: '',
      locality: '',
      address: '',
      city: '',
      state: '',
      landmark: '',
      alternatePhone: '',
      addressType: 'home'
    });
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    try {
      setLoadingAddress(true);
      await deleteAddressById(addrId);
      // Reload addresses
      const addressData = await getMyAddress();
      if (Array.isArray(addressData) && addressData.length > 0) {
        setAddresses(addressData);
        // Select first address if deleted was selected
        if (addrId === selectedAddressId) {
          const firstAddr = addressData[0];
          setSelectedAddressId(firstAddr._id);
          setAddressId(firstAddr._id);
          setFormData({
            name: firstAddr.fullName || '',
            mobile: firstAddr.mobileNumber || '',
            pincode: firstAddr.pincode || '',
            locality: firstAddr.locality || '',
            address: firstAddr.address || firstAddr.addressLine1 || '',
            city: firstAddr.city || '',
            state: firstAddr.state || '',
            landmark: firstAddr.landmark || '',
            alternatePhone: firstAddr.alternatePhone || '',
            addressType: (firstAddr.addressType || 'Home').toLowerCase(),
          });
        }
        setHasSavedAddress(true);
        setShowForm(false);
        setShowAddForm(false);
      } else {
        // No addresses left
        setAddresses([]);
        setAddressId(null);
        setSelectedAddressId(null);
        setHasSavedAddress(false);
        setShowForm(true);
        setShowAddForm(true);
        setEditMode(false);
        setFormData({
          name: '',
          mobile: '',
          pincode: '',
          locality: '',
          address: '',
          city: '',
          state: '',
          landmark: '',
          alternatePhone: '',
          addressType: 'home'
        });
      }
      alert('Address deleted successfully!');
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    } finally {
      setLoadingAddress(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          {addresses.length > 0 && !showForm && (
            <div className="bg-white shadow-lg rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 overflow-hidden mb-4 sm:mb-6">
              <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="font-semibold text-base sm:text-lg text-black">SELECT DELIVERY ADDRESS</span>
                <button
                  onClick={handleAddNewAddress}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm sm:text-base font-semibold transition-all"
                >
                  + Add New
                </button>
              </div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => handleSelectAddress(address)}
                      className={`border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer transition-all ${
                        selectedAddressId === address._id
                          ? 'border-pink-500 bg-white shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="radio"
                            checked={selectedAddressId === address._id}
                            onChange={() => handleSelectAddress(address)}
                            className="w-4 h-4 text-pink-500 flex-shrink-0"
                          />
                          <span className="font-semibold text-sm sm:text-base text-black">{address.fullName}</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-black">
                            {address.addressType || 'Home'}
                          </span>
                        </div>
                        <div className="flex gap-2 ml-6 sm:ml-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                            className="text-pink-500 hover:text-pink-600 text-xs sm:text-sm font-semibold px-2 py-1 rounded hover:bg-pink-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address._id);
                            }}
                            className="text-black hover:text-gray-700 text-xs sm:text-sm font-semibold px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-black space-y-1">
                        <p className="break-words">{address.addressLine1 || address.address}</p>
                        {address.addressLine2 && <p className="break-words">{address.addressLine2}</p>}
                        {address.landmark && <p className="italic">Landmark: {address.landmark}</p>}
                        <p className="font-semibold">{address.city}, {address.state} - {address.pincode}</p>
                        <p className="break-all">Mobile: {address.mobileNumber || address.alternatePhone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {showForm ? (
            <form onSubmit={handleSaveAddress} className="bg-white shadow-lg rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs sm:text-sm text-black">1</span>
                <span className="font-semibold text-sm sm:text-base lg:text-lg text-black">{editMode ? 'EDIT ADDRESS' : 'ADD NEW ADDRESS'}</span>
              </div>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setShowAddForm(false);
                    if (addresses.length > 0 && selectedAddressId) {
                      const selected = addresses.find(a => a._id === selectedAddressId);
                      if (selected) handleSelectAddress(selected);
                    }
                  }}
                  className="text-sm sm:text-base text-black hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="p-3 sm:p-4 md:p-6">
              {loadingAddress && (
                <div className="mb-4 text-sm text-black">Loading your saved address…</div>
              )}
              {hasSavedAddress && !editMode && (
                <div className="mb-4 sm:mb-6 border border-gray-200 rounded p-3 sm:p-4 bg-white">
                  <div className="font-medium text-sm sm:text-base text-black mb-2">{formData.name}</div>
                  <div className="text-xs sm:text-sm text-black break-words">{formData.address}</div>
                  <div className="text-xs sm:text-sm text-black">{formData.locality}, {formData.city} - {formData.pincode}</div>
                  <div className="text-xs sm:text-sm text-black">{formData.state}</div>
                  <div className="text-xs sm:text-sm text-black break-all">Mobile: {formData.mobile}</div>
                  {formData.landmark && <div className="text-xs sm:text-sm text-black">Landmark: {formData.landmark}</div>}
                  {formData.alternatePhone && <div className="text-xs sm:text-sm text-black break-all">Alt: {formData.alternatePhone}</div>}
                  <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button type="button" onClick={() => setEditMode(true)} className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm sm:text-base cursor-pointer font-semibold transition-all shadow-sm hover:shadow-md">Edit Address</button>
                    <button 
                      type="button" 
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this address?')) {
                          try {
                            await deleteAddressById(addressId);
                            setHasSavedAddress(false);
                            setEditMode(true);
                            setFormData({
                              name: '',
                              mobile: '',
                              pincode: '',
                              locality: '',
                              address: '',
                              city: '',
                              state: '',
                              landmark: '',
                              alternatePhone: '',
                              addressType: 'home'
                            });
                            setAddressId(null);
                            alert('Address deleted successfully');
                          } catch (error) {
                            console.error('Error deleting address:', error);
                            alert(error.message || 'Failed to delete address. Please try again.');
                          }
                        }
                      }}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 border-2 border-gray-300 hover:bg-gray-50 text-black cursor-pointer text-sm sm:text-base font-semibold transition-all shadow-sm hover:shadow-md rounded-lg"
                    >
                      Delete Address
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="mb-4 sm:mb-6 bg-pink-500 hover:bg-pink-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm sm:text-base font-medium shadow-md hover:shadow-lg cursor-pointer w-full sm:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="whitespace-nowrap">Use my current location</span>
              </button>

              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ${hasSavedAddress && !editMode ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                <div>
                  <label className="block text-xs sm:text-sm text-black mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-black bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-black mb-1">10-digit mobile number</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-black bg-white"
                  />
                </div>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ${hasSavedAddress && !editMode ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                <div>
                  <label className="block text-xs sm:text-sm text-black mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    maxLength={6}
                    placeholder="Enter 6-digit pincode"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-black bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-black mb-1">Locality</label>
                  <input
                    type="text"
                    name="locality"
                    value={formData.locality}
                    onChange={handleInputChange}
                    placeholder="Enter your locality"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-black bg-white"
                  />
                </div>
              </div>

              <div className={`${hasSavedAddress && !editMode ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                <label className="block text-xs sm:text-sm text-black mb-1">Address (Area and Street)</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter your complete address"
                  required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-black bg-white resize-none"
                />
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ${hasSavedAddress && !editMode ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                <div>
                  <label className="block text-xs sm:text-sm text-black mb-1">City/District/Town</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-black bg-white"
                  />
                </div>
                <div className="relative" ref={stateDropdownRef}>
                  <label className="block text-xs sm:text-sm text-black mb-1">State</label>
                  <div 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white cursor-pointer transition-all"
                    onClick={() => setShowStateDropdown(!showStateDropdown)}
                  >
                    {formData.state || 'Select State'}
                  </div>
                  
                  {showStateDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                        <input
                          type="text"
                          placeholder="Search state..."
                          className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredStates.length > 0 ? (
                          filteredStates.map((state) => (
                            <div
                              key={state}
                              className={`px-3 sm:px-4 py-2 text-sm sm:text-base hover:bg-gray-100 cursor-pointer transition-colors ${
                                formData.state === state ? 'bg-gray-100 text-black font-medium' : 'text-black'
                              }`}
                              onClick={() => {
                                setFormData({ ...formData, state });
                                setShowStateDropdown(false);
                                setSearchTerm('');
                              }}
                            >
                              {state}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-black">No states found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ${hasSavedAddress && !editMode ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                <div>
                  <label className="block text-xs sm:text-sm text-black mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    placeholder="E.g., Near Central Mall"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-black bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-black mb-1">Alternate Phone (Optional)</label>
                  <input
                    type="text"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleInputChange}
                    maxLength={10}
                    placeholder="Alternate phone (Optional)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-black bg-white"
                  />
                </div>
              </div>

              <div className={`${hasSavedAddress && !editMode ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                <label className="block text-xs sm:text-sm text-black mb-2">Address Type</label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="addressType"
                      checked={formData.addressType === 'home'}
                      onChange={() => handleAddressTypeChange('home')}
                      className="w-4 h-4 text-pink-500"
                    />
                    <span className="text-xs sm:text-sm text-black">Home (All day delivery)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="addressType"
                      checked={formData.addressType === 'work'}
                      onChange={() => handleAddressTypeChange('work')}
                      className="w-4 h-4 text-pink-500"
                    />
                    <span className="text-xs sm:text-sm text-black">Work (Delivery between 10 AM - 5 PM)</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 w-full">
                <button
                  type="submit"
                  disabled={saving}
                  className={`bg-pink-500 hover:bg-pink-600 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer w-full text-center transform hover:scale-105 active:scale-95 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {saving ? 'Saving...' : 'SAVE AND DELIVER HERE'}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-white border-2 border-gray-300 hover:bg-gray-50 text-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all cursor-pointer w-full text-center shadow-md hover:shadow-lg"
                >
                  CANCEL
                </button>
              </div>

              {showSuccess && (
                <div className="bg-white border-2 border-gray-300 text-black px-4 py-3 rounded-lg flex items-center gap-2 font-medium mt-4">
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Address saved successfully!
                </div>
              )}
            </div>
            </form>
          ) : addresses.length > 0 ? (
            <div className="bg-white shadow-lg rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs sm:text-sm text-black">1</span>
                  <span className="font-semibold text-sm sm:text-base lg:text-lg text-black">SELECTED ADDRESS</span>
                </div>
                <button
                  onClick={handleAddNewAddress}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm sm:text-base font-semibold transition-all"
                >
                  + Add New
                </button>
              </div>
              <div className="p-3 sm:p-4 md:p-6">
                {selectedAddressId && addresses.find(a => a._id === selectedAddressId) && (() => {
                  const selected = addresses.find(a => a._id === selectedAddressId);
                  return (
                    <div className="mb-4 p-3 sm:p-4 border-2 border-gray-200 bg-white rounded-lg sm:rounded-xl">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm sm:text-base text-black mb-1">{selected.fullName}</h3>
                          <p className="text-xs sm:text-sm text-black break-words">
                            {selected.addressLine1 || selected.address}, {selected.locality},<br />
                            {selected.city}, {selected.state} - {selected.pincode}
                          </p>
                          {selected.addressLine2 && <p className="text-xs sm:text-sm text-black break-words">{selected.addressLine2}</p>}
                          <p className="mt-2 text-xs sm:text-sm text-black break-all">
                            <span className="font-medium">Mobile:</span> {selected.mobileNumber}
                            {selected.alternatePhone && `, ${selected.alternatePhone}`}
                          </p>
                          {selected.landmark && (
                            <p className="text-xs sm:text-sm text-black"><span className="font-medium">Landmark:</span> {selected.landmark}</p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => handleEditAddress(selected)}
                              className="flex-1 sm:flex-none text-pink-500 hover:text-pink-600 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              EDIT
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(selected._id)}
                              className="flex-1 sm:flex-none text-black hover:text-gray-700 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              DELETE
                            </button>
                          </div>
                          <div className="text-xs text-black">
                            {(selected.addressType || 'Home').toUpperCase()} ADDRESS
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white shadow-lg rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 p-4 sm:p-5 md:p-6 sticky top-2 sm:top-4">
            <h3 className="text-black text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <span className="w-1 h-4 sm:h-6 bg-pink-500 rounded-full"></span>
              <span className="text-sm sm:text-base lg:text-lg">PRICE DETAILS</span>
            </h3>

            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
              <div className="flex justify-between text-xs sm:text-sm text-black">
                <span className="break-words">Price ({priceDetails.items} {priceDetails.items === 1 ? 'item' : 'items'})</span>
                <span className="font-semibold ml-2 whitespace-nowrap">₹{priceDetails.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-black">
                <span>Shipping</span>
                <span className="font-semibold whitespace-nowrap">
                  {priceDetails.shippingCharge > 0 ? `₹${priceDetails.shippingCharge.toLocaleString()}` : 'Free ✓'}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-black">
                <span>Tax (5%)</span>
                <span className="font-semibold whitespace-nowrap">₹{priceDetails.tax.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-base sm:text-lg mb-3 sm:mb-4 pb-3 sm:pb-4 border-b-2 border-gray-200">
              <span className="text-black">Total Payable</span>
              <span className="text-black whitespace-nowrap">₹{priceDetails.total.toLocaleString()}</span>
            </div>

            {/* Payment Method Selection */}
            {hasSavedAddress && (
              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b-2 border-gray-200">
                <h4 className="text-black font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">Select Payment Method</h4>
                <div className="space-y-2">
                  <label className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'online' 
                      ? 'border-pink-500 bg-white' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-pink-500 focus:ring-pink-500 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs sm:text-sm text-black">Online Payment</div>
                      <div className="text-xs text-black">Pay securely with Razorpay</div>
                    </div>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </label>
                  
                  <label className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod' 
                      ? 'border-pink-500 bg-white' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-pink-500 focus:ring-pink-500 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs sm:text-sm text-black">Cash on Delivery</div>
                      <div className="text-xs text-black">Pay when you receive your order</div>
                    </div>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </label>
                </div>
              </div>
            )}

            <button 
              onClick={handlePayment}
              disabled={!hasSavedAddress}
              className={`w-full mt-3 sm:mt-4 py-3 sm:py-4 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-all text-sm sm:text-base font-bold cursor-pointer shadow-lg ${
                hasSavedAddress 
                  ? 'bg-pink-500 hover:bg-pink-600 text-white hover:shadow-xl transform hover:scale-105 active:scale-95' 
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              {paymentMethod === 'cod' ? 'PLACE ORDER (COD)' : 'PROCEED TO PAYMENT'}
            </button>
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
}