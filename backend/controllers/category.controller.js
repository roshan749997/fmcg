import { Category } from '../models/Category.js';

// Get all categories with subcategories
export const getAllCategories = async (req, res) => {
  try {
    // Get all parent categories (where parentId is null)
    const parentCategories = await Category.find({ parentId: null, active: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Get all subcategories
    const subcategories = await Category.find({ parentId: { $ne: null }, active: true })
      .populate('parentId', 'name slug')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Group subcategories by parentId
    const subcategoriesByParent = {};
    subcategories.forEach(sub => {
      const parentId = sub.parentId ? String(sub.parentId._id || sub.parentId) : String(sub.parentId);
      if (!subcategoriesByParent[parentId]) {
        subcategoriesByParent[parentId] = [];
      }
      subcategoriesByParent[parentId].push(sub);
    });

    // Combine parent categories with their subcategories
    const categoriesWithSubs = parentCategories.map(parent => ({
      ...parent,
      subcategories: subcategoriesByParent[String(parent._id)] || []
    }));

    // Return all categories (parents with subs) and flat list
    return res.json({
      categories: categoriesWithSubs,
      allCategories: [
        ...parentCategories,
        ...subcategories
      ].sort((a, b) => {
        // Sort by name
        return a.name.localeCompare(b.name);
      })
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
};

