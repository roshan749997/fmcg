import React from 'react';
import { useNavigate } from 'react-router-dom';
import { slugifyCategory } from '../data/categoryTree';
import { FaChevronRight } from 'react-icons/fa';

const ProductTypeSelector = ({
  activeSubNode,
  sidebarItems = [],
  mainNode,
  mainCategory,
  subCategoryName,
}) => {
  const navigate = useNavigate();

  if (!activeSubNode || !sidebarItems.length || !mainNode) return null;

  return (
    <section className="bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 py-4">
        <p className="text-[11px] tracking-[0.14em] uppercase font-semibold text-gray-500 mb-1">
          Browse Quickly
        </p>
        <h4 className="text-base font-bold text-gray-900 mb-1">Select Product Type</h4>
        <p className="text-xs text-gray-600">
          Now choose an item under <span className="font-semibold text-gray-900">{activeSubNode.name}</span>.
        </p>
      </div>

      <div className="p-3">
        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
        {sidebarItems.map((item) => {
          const itemPath = `/category/${slugifyCategory(mainNode.name)}/${slugifyCategory(activeSubNode.name)}/${slugifyCategory(item)}`;
          const isActiveItem = slugifyCategory(mainCategory ? subCategoryName : '') === slugifyCategory(item);

          return (
            <button
              key={item}
              type="button"
              onClick={() => navigate(itemPath)}
              className={`group w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 ${
                isActiveItem
                  ? 'bg-gray-100 border border-gray-300 text-gray-900 shadow-sm'
                  : 'text-gray-800 border border-transparent hover:bg-gray-50 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      isActiveItem ? 'bg-black' : 'bg-gray-300 group-hover:bg-gray-500'
                    }`}
                  />
                  <span className={`truncate ${isActiveItem ? 'font-semibold' : 'font-medium'}`}>{item}</span>
                </div>
                {isActiveItem ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black text-white font-semibold uppercase tracking-wide">
                    Active
                  </span>
                ) : (
                  <FaChevronRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
        </div>
      </div>
    </section>
  );
};

export default ProductTypeSelector;
