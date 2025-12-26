import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiBox, FiShoppingBag, FiLogOut, FiUser, FiHome, FiMenu, FiX, FiMapPin, FiFileText, FiMail, FiImage } from 'react-icons/fi';

const Title = () => {
  const { pathname } = useLocation();
  if (pathname === '/admin') return 'Dashboard';
  if (pathname.startsWith('/admin/products')) return 'Products';
  if (pathname.startsWith('/admin/orders')) return 'Orders';
  if (pathname.startsWith('/admin/addresses')) return 'Addresses';
  if (pathname.startsWith('/admin/policies')) return 'Policies';
  if (pathname.startsWith('/admin/contact-info')) return 'Contact Info';
  if (pathname.startsWith('/admin/logos')) return 'Logos';
  return 'Admin';
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState('Admin');

  // Check admin status on mount
  useEffect(() => {
    const checkAdmin = () => {
      const isAuth = localStorage.getItem('auth_token');
      const isAdmin = localStorage.getItem('auth_is_admin') === 'true';
      
      if (!isAuth) {
        navigate('/signin', { replace: true });
      } else if (!isAdmin) {
        navigate('/', { replace: true });
      } else {
        // Try to get user name from localStorage or API
        try {
          const userData = localStorage.getItem('user_data');
          if (userData) {
            const parsed = JSON.parse(userData);
            if (parsed.name) setUserName(parsed.name);
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    };
    
    checkAdmin();
  }, [navigate]);

  const logout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_is_admin');
        localStorage.removeItem('user_data');
      } catch {}
      navigate('/signin', { replace: true });
    }
  };

  const navItem = (to, label, Icon, description) => (
    <NavLink
      to={to}
      end={to === '/admin'}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        'group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ' +
        (isActive
          ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg transform scale-105'
          : 'text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:text-pink-700')
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
          <div className="flex-1">
            <div className="text-sm font-semibold">{label}</div>
            {description && <div className={`text-xs ${isActive ? 'opacity-90' : 'opacity-75'}`}>{description}</div>}
          </div>
        </>
      )}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 flex-col bg-white border-r-2 border-gray-200 shadow-xl z-30">
          {/* Logo/Brand */}
          <div className="p-6 border-b-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                A
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">Admin Panel</div>
                <div className="text-xs text-gray-500">Kidzoo Management</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItem('/admin', 'Dashboard', FiGrid, 'Overview & stats')}
            {navItem('/admin/products', 'Products', FiBox, 'Manage catalog')}
            {navItem('/admin/orders', 'Orders', FiShoppingBag, 'Track orders')}
            {navItem('/admin/addresses', 'Addresses', FiMapPin, 'User addresses')}
            {navItem('/admin/policies', 'Policies', FiFileText, 'Manage policies')}
            {navItem('/admin/contact-info', 'Contact Info', FiMail, 'Contact details')}
            {navItem('/admin/logos', 'Logos', FiImage, 'Manage logos')}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t-2 border-gray-200">
            <div className="flex items-center gap-3 mb-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-md">
                {userName[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{userName}</div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 font-semibold group"
            >
              <FiLogOut className="w-5 h-5 group-hover:transform group-hover:rotate-12 transition-transform" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col bg-white shadow-2xl">
              {/* Mobile Header */}
              <div className="p-4 sm:p-6 border-b-2 border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg flex-shrink-0">
                    A
                  </div>
                  <div className="min-w-0">
                    <div className="text-base sm:text-lg font-bold text-gray-900 truncate">Admin Panel</div>
                    <div className="text-xs text-gray-500 truncate">Kidzoo Management</div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 flex-shrink-0"
                  aria-label="Close menu"
                >
                  <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
                {navItem('/admin', 'Dashboard', FiGrid, 'Overview & stats')}
                {navItem('/admin/products', 'Products', FiBox, 'Manage catalog')}
                {navItem('/admin/orders', 'Orders', FiShoppingBag, 'Track orders')}
                {navItem('/admin/addresses', 'Addresses', FiMapPin, 'User addresses')}
                {navItem('/admin/policies', 'Policies', FiFileText, 'Manage policies')}
                {navItem('/admin/contact-info', 'Contact Info', FiMail, 'Contact details')}
                {navItem('/admin/logos', 'Logos', FiImage, 'Manage logos')}
              </nav>

              {/* Mobile User Section */}
              <div className="p-3 sm:p-4 border-t-2 border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md flex-shrink-0">
                    {userName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{userName}</div>
                    <div className="text-xs text-gray-500">Administrator</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 font-semibold text-sm sm:text-base"
                >
                  <FiLogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:ml-72">
          {/* Header */}
          <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b-2 border-gray-200 shadow-sm">
            <div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  <button
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors flex-shrink-0"
                    onClick={() => setOpen(true)}
                    aria-label="Open menu"
                  >
                    <FiMenu className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate"><Title /></h1>
                    <div className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 sm:hidden">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <FiUser className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700 hidden md:inline">{userName}</span>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                    {userName[0].toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="p-3 sm:p-4 lg:p-6 xl:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
