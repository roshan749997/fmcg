import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../utils/api';
import { getOrderById } from '../services/api';
import { CheckCircle, Package, Calendar, Receipt, Truck, FileText } from 'lucide-react';
import Invoice from '../components/Invoice';
import ScrollToTop from '../components/ScrollToTop';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartTotal } = useCart();
  const [user, setUser] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [showInvoice, setShowInvoice] = useState(false);
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const paymentMethod = searchParams.get('method') || 'COD';
  const orderId = searchParams.get('orderId') || '';
  
  // Generate order number from orderId or create a random one
  const orderNumber = orderId ? orderId.slice(-8).toUpperCase() : `ORD${Date.now().toString().slice(-8)}`;
  
  // Calculate estimated delivery date (5-7 days from now)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 3) + 5); // 5-7 days
  
  // Get order total from localStorage (stored before cart is cleared)
  const [orderTotal, setOrderTotal] = useState(0);
  
  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.me();
        if (userData?.user) {
          setUser(userData.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);
  
  // Fetch order details if orderId is available
  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        setLoadingOrder(true);
        try {
          const response = await getOrderById(orderId);
          if (response) {
            setOrder(response);
          }
        } catch (error) {
          console.error('Error fetching order:', error);
        } finally {
          setLoadingOrder(false);
        }
      };
      fetchOrder();
    }
  }, [orderId]);
  
  useEffect(() => {
    const storedTotal = localStorage.getItem('lastOrderTotal');
    if (storedTotal) {
      setOrderTotal(parseFloat(storedTotal));
      // Clear it after reading
      localStorage.removeItem('lastOrderTotal');
    } else if (cartTotal > 0) {
      setOrderTotal(cartTotal);
    }
  }, [cartTotal]);

  useEffect(() => {
    // Trigger fade-in animation
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/profile?tab=orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoToOrders = () => {
    navigate('/profile?tab=orders');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div 
        className={`w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 p-6 sm:p-8 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        
        {/* Header Section */}
        <div className="text-center mb-8">
          {/* Countdown Timer */}
          <div className="flex justify-end mb-4">
            <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5 flex items-center gap-2 animate-fadeIn">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-black font-medium">
                Redirecting in <span className="font-bold text-pink-500 animate-countdown">{countdown}</span>s
              </p>
            </div>
          </div>

          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center transition-all duration-700 ${
              isVisible ? 'scale-100 animate-bounce-once' : 'scale-0'
            }`}>
              <CheckCircle className={`w-12 h-12 text-pink-500 transition-all duration-500 ${
                isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`} style={{ animationDelay: '0.2s' }} />
            </div>
          </div>

          {/* Success Message */}
          <h1 className={`text-3xl font-bold text-black mb-3 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ animationDelay: '0.3s' }}>
            Order Placed Successfully! 🎉
          </h1>
          
          {/* Order Number */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-200 mb-4 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ animationDelay: '0.4s' }}>
            <Receipt className="w-4 h-4 text-black" />
            <span className="text-sm font-medium text-black">Order Number:</span>
            <span className="text-sm font-bold text-black">#{orderNumber}</span>
          </div>
          
          <p className={`text-base text-black transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ animationDelay: '0.5s' }}>
            Your order has been confirmed and will be processed shortly.
          </p>
        </div>

        {/* Order Details Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ animationDelay: '0.6s' }}>
          {/* Estimated Delivery */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-black" />
              <span className="text-sm font-semibold text-black">Estimated Delivery</span>
            </div>
            <p className="text-lg font-semibold text-black mb-1">
              {estimatedDelivery.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm text-black">5-7 business days</p>
          </div>
          
          {/* Payment Method */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-black" />
              <span className="text-sm font-semibold text-black">Payment Method</span>
            </div>
            <p className="text-lg font-semibold text-black mb-1">
              {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
            </p>
            {paymentMethod === 'COD' && (
              <p className="text-sm text-black">Pay on delivery</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        {orderTotal > 0 && (
          <div className={`bg-white border border-gray-200 rounded-lg p-4 mb-6 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ animationDelay: '0.7s' }}>
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="w-5 h-5 text-black" />
              <p className="text-base font-semibold text-black">Order Summary</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-black">Order Total</span>
                <span className="font-bold text-lg text-black">₹{orderTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black">Payment Method</span>
                <span className="font-medium text-black">{paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black">Order Date</span>
                <span className="font-medium text-black">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`space-y-3 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ animationDelay: '0.8s' }}>
          <button
            onClick={() => setShowInvoice(true)}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            <FileText className="w-5 h-5" />
            <span>View Invoice</span>
          </button>
          <button
            onClick={handleGoToOrders}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            <Package className="w-5 h-5" />
            <span>View My Orders</span>
          </button>
          <button
            onClick={handleContinueShopping}
            className="w-full bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-black py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Continue Shopping
          </button>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowInvoice(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-black">Invoice</h2>
              <button
                onClick={() => setShowInvoice(false)}
                className="text-black hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {order ? (
                <Invoice 
                  order={order} 
                  user={user}
                  onPrint={() => window.print()}
                />
              ) : loadingOrder ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                  <p className="text-black">Loading invoice...</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-black">Order details not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes bounce-once {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-bounce-once {
          animation: bounce-once 0.6s ease-out;
        }
        
        .animate-countdown {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      <ScrollToTop />
    </div>
  );
};

export default OrderSuccess;
