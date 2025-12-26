import Logo from '../models/Logo.js';

// Get all logos (public endpoint)
export async function getLogos(req, res) {
  try {
    const logos = await Logo.find({}).lean();
    return res.json(logos);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch logos', error: err.message });
  }
}

// Get a specific logo by type (public endpoint)
export async function getLogoByType(req, res) {
  try {
    const { type } = req.params;
    const logo = await Logo.findOne({ type }).lean();
    
    if (!logo) {
      return res.status(404).json({ message: 'Logo not found' });
    }
    
    return res.json(logo);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch logo', error: err.message });
  }
}

// Admin: Get all logos
export async function adminGetLogos(req, res) {
  try {
    const logos = await Logo.find({}).sort({ type: 1 }).lean();
    return res.json(logos);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch logos', error: err.message });
  }
}

// Admin: Create or update a logo
export async function adminUpdateLogo(req, res) {
  try {
    const { type } = req.params;
    const { url, alt, width, height } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'Logo URL is required' });
    }

    const validTypes = ['header', 'footer'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid logo type', validTypes });
    }

    const logo = await Logo.findOneAndUpdate(
      { type },
      {
        type,
        url: url.trim(),
        alt: alt || 'Logo',
        width: width || 'auto',
        height: height || 'auto',
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.json(logo);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update logo', error: err.message });
  }
}

