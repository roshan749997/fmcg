import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { FiImage, FiSave, FiLoader } from 'react-icons/fi';
import ScrollToTop from '../../components/ScrollToTop';

const AdminLogos = () => {
  const [logos, setLogos] = useState({
    header: { url: '', alt: '', width: 'auto', height: 'auto' },
    footer: { url: '', alt: '', width: 'auto', height: 'auto' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadLogos();
  }, []);

  const loadLogos = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getLogos();
      
      const logosMap = {
        header: { url: '', alt: 'Logo', width: 'auto', height: 'auto' },
        footer: { url: '', alt: 'Logo', width: 'auto', height: 'auto' },
      };

      data.forEach((logo) => {
        if (logosMap[logo.type]) {
          logosMap[logo.type] = {
            url: logo.url || '',
            alt: logo.alt || 'Logo',
            width: logo.width || 'auto',
            height: logo.height || 'auto',
          };
        }
      });

      // Set defaults if not found
      if (!logosMap.header.url) {
        logosMap.header.url = 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765607037/Pink_and_Purple_Playful_Kids_Store_Logo_150_x_60_px_1_ex8w7m.svg';
        logosMap.header.alt = 'Kidzo';
        logosMap.header.width = 'auto';
        logosMap.header.height = 'auto';
      }
      if (!logosMap.footer.url) {
        logosMap.footer.url = 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765609203/2_qw44ed.svg';
        logosMap.footer.alt = 'Kidzo';
        logosMap.footer.width = 'auto';
        logosMap.footer.height = 'auto';
      }

      setLogos(logosMap);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load logos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type) => {
    try {
      setSaving((prev) => ({ ...prev, [type]: true }));
      setError('');
      setSuccess('');

      const logo = logos[type];
      if (!logo.url.trim()) {
        setError(`${type} logo URL is required`);
        return;
      }

      await api.admin.updateLogo(type, logo.url, logo.alt, logo.width, logo.height);
      setSuccess(`${type} logo updated successfully!`);
      setTimeout(() => setSuccess(''), 3000);
      // Reload logos after save
      await loadLogos();
      // Trigger custom event to refresh logos in Navbar and Footer
      window.dispatchEvent(new CustomEvent('logo:updated', { detail: { type } }));
    } catch (err) {
      setError(err.message || `Failed to save ${type} logo`);
    } finally {
      setSaving((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleChange = (type, field, value) => {
    setLogos((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const logoLabels = {
    header: 'Header Logo',
    footer: 'Footer Logo',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="inline-block animate-spin h-12 w-12 text-pink-600 mb-4" />
          <p className="text-gray-600 font-medium">Loading logos...</p>
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
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg flex-shrink-0">
              <FiImage className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Manage Logos</h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Update header and footer logos displayed across the website</p>
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

        {/* Logo Forms */}
        <div className="space-y-4 sm:space-y-6">
          {Object.keys(logos).map((type) => (
            <div key={type} className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <FiImage className="h-4 w-4 sm:h-5 sm:w-5" />
                  {logoLabels[type]}
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Logo Preview */}
                {logos[type].url && (
                  <div className="flex items-center justify-center p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <img
                      src={logos[type].url}
                      alt={logos[type].alt || 'Logo preview'}
                      style={{
                        width: logos[type].width === 'auto' ? 'auto' : logos[type].width,
                        height: logos[type].height === 'auto' ? 'auto' : logos[type].height,
                        maxWidth: '100%',
                        objectFit: 'contain',
                      }}
                      className="object-contain"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x100?text=Invalid+URL';
                      }}
                    />
                  </div>
                )}

                {/* Logo URL */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Logo URL *
                  </label>
                  <input
                    type="url"
                    value={logos[type].url}
                    onChange={(e) => handleChange(type, 'url', e.target.value)}
                    className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                {/* Alt Text */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={logos[type].alt}
                    onChange={(e) => handleChange(type, 'alt', e.target.value)}
                    className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    placeholder="Logo alt text"
                  />
                </div>

                {/* Size Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Width
                    </label>
                    <input
                      type="text"
                      value={logos[type].width}
                      onChange={(e) => handleChange(type, 'width', e.target.value)}
                      className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                      placeholder="auto, 150px, 200px, etc."
                    />
                    <p className="text-xs text-gray-500 mt-1">e.g., auto, 150px, 200px, 50%</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Height
                    </label>
                    <input
                      type="text"
                      value={logos[type].height}
                      onChange={(e) => handleChange(type, 'height', e.target.value)}
                      className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                      placeholder="auto, 60px, 80px, etc."
                    />
                    <p className="text-xs text-gray-500 mt-1">e.g., auto, 60px, 80px, 50%</p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSave(type)}
                    disabled={saving[type]}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {saving[type] ? (
                      <>
                        <FiLoader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="h-4 w-4 sm:h-5 sm:w-5" />
                        Save {logoLabels[type]}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-4 sm:mt-6 bg-purple-50 border-2 border-purple-200 rounded-xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-purple-800">
            <strong>Note:</strong> Logo URLs should be publicly accessible image links (e.g., Cloudinary, CDN, or direct image URLs). 
            Changes will be reflected immediately across the website.
          </p>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default AdminLogos;

