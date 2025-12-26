import Policy from '../models/Policy.js';

// Get all policies (public endpoint)
export async function getPolicies(req, res) {
  try {
    const policies = await Policy.find({}).sort({ type: 1 }).lean();
    return res.json(policies);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch policies', error: err.message });
  }
}

// Get a specific policy by type (public endpoint)
export async function getPolicyByType(req, res) {
  try {
    const { type } = req.params;
    const policy = await Policy.findOne({ type }).lean();
    
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    
    return res.json(policy);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch policy', error: err.message });
  }
}

// Admin: Get all policies
export async function adminGetPolicies(req, res) {
  try {
    const policies = await Policy.find({}).sort({ type: 1 }).lean();
    return res.json(policies);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch policies', error: err.message });
  }
}

// Admin: Create or update a policy
export async function adminUpdatePolicy(req, res) {
  try {
    const { type } = req.params;
    const { title, content, sections } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Either content or sections should be provided
    if (!content && (!sections || !Array.isArray(sections) || sections.length === 0)) {
      return res.status(400).json({ message: 'Either content or sections are required' });
    }

    const validTypes = ['privacy', 'terms', 'shipping', 'refund'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid policy type', validTypes });
    }

    // Sort sections by sectionNumber
    const sortedSections = sections && Array.isArray(sections) 
      ? sections.sort((a, b) => (a.sectionNumber || 0) - (b.sectionNumber || 0))
      : [];

    const policy = await Policy.findOneAndUpdate(
      { type },
      {
        type,
        title,
        content: content || '',
        sections: sortedSections,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.json(policy);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update policy', error: err.message });
  }
}

