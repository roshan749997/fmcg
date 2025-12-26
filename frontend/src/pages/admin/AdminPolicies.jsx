import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { FiFileText, FiSave, FiLoader, FiPlus, FiTrash2, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import ScrollToTop from '../../components/ScrollToTop';

const AdminPolicies = () => {
  const [policies, setPolicies] = useState({
    privacy: { title: '', sections: [] },
    terms: { title: '', sections: [] },
    shipping: { title: '', sections: [] },
    refund: { title: '', sections: [] },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getPolicies();
      
      const policiesMap = {
        privacy: { title: '', sections: [] },
        terms: { title: '', sections: [] },
        shipping: { title: '', sections: [] },
        refund: { title: '', sections: [] },
      };

      data.forEach((policy) => {
        if (policiesMap[policy.type]) {
          policiesMap[policy.type] = {
            title: policy.title || '',
            sections: policy.sections && Array.isArray(policy.sections) && policy.sections.length > 0
              ? policy.sections.sort((a, b) => (a.sectionNumber || 0) - (b.sectionNumber || 0))
              : [],
          };
        }
      });

      setPolicies(policiesMap);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type) => {
    try {
      setSaving((prev) => ({ ...prev, [type]: true }));
      setError('');
      setSuccess('');

      const policy = policies[type];
      if (!policy.title.trim()) {
        setError(`${type} policy requires a title`);
        return;
      }
      if (!policy.sections || policy.sections.length === 0) {
        setError(`${type} policy requires at least one section`);
        return;
      }

      await api.admin.updatePolicy(type, policy.title, '', policy.sections);
      setSuccess(`${type} policy updated successfully!`);
      setTimeout(() => setSuccess(''), 3000);
      await loadPolicies();
    } catch (err) {
      setError(err.message || `Failed to save ${type} policy`);
    } finally {
      setSaving((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleTitleChange = (type, value) => {
    setPolicies((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        title: value,
      },
    }));
  };

  const addSection = (type) => {
    const policy = policies[type];
    const maxSectionNumber = policy.sections.length > 0
      ? Math.max(...policy.sections.map(s => s.sectionNumber || 0))
      : 0;
    
    setPolicies((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        sections: [
          ...prev[type].sections,
          {
            sectionNumber: maxSectionNumber + 1,
            heading: '',
            content: '',
          },
        ],
      },
    }));
  };

  const removeSection = (type, index) => {
    setPolicies((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        sections: prev[type].sections.filter((_, i) => i !== index).map((section, idx) => ({
          ...section,
          sectionNumber: idx + 1,
        })),
      },
    }));
  };

  const updateSection = (type, index, field, value) => {
    setPolicies((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        sections: prev[type].sections.map((section, i) =>
          i === index ? { ...section, [field]: value } : section
        ),
      },
    }));
  };

  const moveSection = (type, index, direction) => {
    const policy = policies[type];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= policy.sections.length) return;

    const newSections = [...policy.sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    
    // Update section numbers
    newSections.forEach((section, idx) => {
      section.sectionNumber = idx + 1;
    });

    setPolicies((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        sections: newSections,
      },
    }));
  };

  const policyLabels = {
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    shipping: 'Shipping Policy',
    refund: 'Refund/Cancellation Policy',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="inline-block animate-spin h-12 w-12 text-pink-600 mb-4" />
          <p className="text-gray-600 font-medium">Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-pink-600 to-rose-600 text-white shadow-lg flex-shrink-0">
              <FiFileText className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Manage Policies</h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Edit Privacy Policy, Terms & Conditions, Shipping Policy, and Refund/Cancellation Policy topic-wise</p>
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

        {/* Policy Forms */}
        <div className="space-y-4 sm:space-y-6">
          {Object.keys(policies).map((type) => (
            <div key={type} className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <FiFileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">{policyLabels[type]}</span>
                </h2>
                <button
                  onClick={() => addSection(type)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FiPlus className="h-4 w-4" />
                  Add Section
                </button>
              </div>
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Policy Title *
                  </label>
                  <input
                    type="text"
                    value={policies[type].title}
                    onChange={(e) => handleTitleChange(type, e.target.value)}
                    className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                    placeholder={`Enter ${policyLabels[type]} title`}
                  />
                </div>

                {/* Sections */}
                <div className="space-y-3 sm:space-y-4">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Sections *
                  </label>
                  {policies[type].sections.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">No sections added yet</p>
                      <button
                        onClick={() => addSection(type)}
                        className="px-3 sm:px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-all flex items-center gap-2 mx-auto text-sm sm:text-base"
                      >
                        <FiPlus className="h-4 w-4" />
                        Add First Section
                      </button>
                    </div>
                  ) : (
                    policies[type].sections.map((section, index) => (
                      <div key={index} className="border-2 border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 sm:px-3 py-1 bg-pink-600 text-white rounded-lg font-semibold text-xs sm:text-sm">
                              Section {section.sectionNumber}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => moveSection(type, index, 'up')}
                                disabled={index === 0}
                                className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                title="Move up"
                              >
                                <FiArrowUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => moveSection(type, index, 'down')}
                                disabled={index === policies[type].sections.length - 1}
                                className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                title="Move down"
                              >
                                <FiArrowDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => removeSection(type, index)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded transition-all"
                            title="Delete section"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Section Heading */}
                        <div className="mb-2 sm:mb-3">
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                            Section Heading * (Don't include section number)
                          </label>
                          <input
                            type="text"
                            value={section.heading.replace(/^\d+\.\s*/, '')}
                            onChange={(e) => {
                              // Remove any leading numbers when user types
                              const cleanedHeading = e.target.value.replace(/^\d+\.\s*/, '');
                              updateSection(type, index, 'heading', cleanedHeading);
                            }}
                            className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                            placeholder="e.g., Introduction (number will be added automatically)"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Section number {section.sectionNumber} will be automatically added
                          </p>
                        </div>

                        {/* Section Content */}
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                            Section Content *
                          </label>
                          <textarea
                            value={section.content}
                            onChange={(e) => updateSection(type, index, 'content', e.target.value)}
                            rows={6}
                            className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all resize-none"
                            placeholder="Enter section content (HTML supported)"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-3 sm:pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleSave(type)}
                    disabled={saving[type]}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {saving[type] ? (
                      <>
                        <FiLoader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="h-4 w-4 sm:h-5 sm:w-5" />
                        Save {policyLabels[type]}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default AdminPolicies;
