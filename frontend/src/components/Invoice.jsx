import React from 'react';
import { getProductImage } from '../utils/imagePlaceholder';

const Invoice = ({ order, user, onPrint }) => {
  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No order data available</p>
      </div>
    );
  }

  const formatINR = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const orderNumber = order._id ? order._id.slice(-8).toUpperCase() : 'N/A';
  
  // Calculate totals
  const subtotal = order.items?.reduce((sum, item) => {
    const itemPrice = item.price || item.product?.price || 0;
    const quantity = item.quantity || 1;
    return sum + (itemPrice * quantity);
  }, 0) || order.amount || 0;
  
  const total = order.amount || subtotal;
  const shippingAddress = order.shippingAddress || {};

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      {/* Header */}
      <div className="border-b-2 border-gray-200 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kidzo</h1>
            <p className="text-gray-600">Your trusted shopping partner</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h2>
            <p className="text-sm text-gray-600">Order #{orderNumber}</p>
          </div>
        </div>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase">Order Information</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Order Number:</span> #{orderNumber}</p>
            <p><span className="font-medium">Order Date:</span> {orderDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><span className="font-medium">Payment Method:</span> {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
            <p><span className="font-medium">Status:</span> <span className="capitalize">{order.status || 'Confirmed'}</span></p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase">Shipping Address</h3>
          <div className="text-sm text-gray-600">
            {shippingAddress.fullName && <p className="font-medium">{shippingAddress.fullName}</p>}
            {shippingAddress.address && <p>{shippingAddress.address}</p>}
            {shippingAddress.locality && <p>{shippingAddress.locality}</p>}
            <p>
              {shippingAddress.city && `${shippingAddress.city}, `}
              {shippingAddress.state && `${shippingAddress.state} `}
              {shippingAddress.pincode && `- ${shippingAddress.pincode}`}
            </p>
            {shippingAddress.mobileNumber && <p className="mt-1">Phone: {shippingAddress.mobileNumber}</p>}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase">Order Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Item</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Quantity</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Price</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => {
                const product = item.product || {};
                const productTitle = product.title || product.name || 'Product';
                const productImage = getProductImage(product, 'image1');
                const itemPrice = item.price || product.price || 0;
                const quantity = item.quantity || 1;
                const itemTotal = itemPrice * quantity;

                return (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={productImage} 
                          alt={productTitle}
                          className="w-16 h-16 object-cover rounded border border-gray-200"
                          onError={(e) => { e.target.src = getProductImage(null); }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{productTitle}</p>
                          {item.size && (
                            <p className="text-xs text-gray-500">Size: {item.size}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4 text-gray-600">{quantity}</td>
                    <td className="text-right py-4 px-4 text-gray-600">{formatINR(itemPrice)}</td>
                    <td className="text-right py-4 px-4 font-semibold text-gray-900">{formatINR(itemTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="border-t-2 border-gray-200 pt-4">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-900">Free</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900">{formatINR(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
        <p className="mb-2">Thank you for your order!</p>
        <p>For any queries, please contact our customer support.</p>
      </div>

      {/* Print Button */}
      {onPrint && (
        <div className="mt-6 text-center">
          <button
            onClick={onPrint}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Print Invoice
          </button>
        </div>
      )}
    </div>
  );
};

export default Invoice;


