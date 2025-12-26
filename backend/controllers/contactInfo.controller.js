import ContactInfo from '../models/ContactInfo.js';

// Get contact info (public endpoint)
export async function getContactInfo(req, res) {
  try {
    const contactInfo = await ContactInfo.getContactInfo();
    return res.json(contactInfo);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch contact info', error: err.message });
  }
}

// Admin: Get contact info
export async function adminGetContactInfo(req, res) {
  try {
    const contactInfo = await ContactInfo.getContactInfo();
    return res.json(contactInfo);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch contact info', error: err.message });
  }
}

// Admin: Update contact info
export async function adminUpdateContactInfo(req, res) {
  try {
    const { email, phone, address, companyName } = req.body;

    if (!email || !phone || !address) {
      return res.status(400).json({ message: 'Email, phone, and address are required' });
    }

    // Get existing contact info or create new one
    let contactInfo = await ContactInfo.findOne();
    
    if (contactInfo) {
      // Update existing
      contactInfo.email = email;
      contactInfo.phone = phone;
      contactInfo.address = address;
      if (companyName) contactInfo.companyName = companyName;
      await contactInfo.save();
    } else {
      // Create new
      contactInfo = await ContactInfo.create({
        email,
        phone,
        address,
        companyName: companyName || 'Kidzo',
      });
    }

    return res.json(contactInfo);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update contact info', error: err.message });
  }
}







