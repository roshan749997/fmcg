import { Address } from '../models/Address.js';

export const createOrUpdateAddress = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const payload = sanitize(req.body);
    payload.userId = userId;

    // Always create a new address (support multiple addresses per user)
    const doc = await Address.create(payload);
    return res.status(201).json(doc);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to save address', error: err.message });
  }
};

export const getMyAddress = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    // Return all addresses for the user, sorted by creation date (newest first)
    const docs = await Address.find({ userId }).sort({ createdAt: -1 });
    return res.json(docs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch addresses', error: err.message });
  }
};

export const getAddressByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const doc = await Address.findOne({ userId });
    return res.json(doc || null);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch address', error: err.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const payload = sanitize(req.body);
    const doc = await Address.findOneAndUpdate({ _id: id, userId }, { $set: payload }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Address not found' });
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update address', error: err.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const result = await Address.findOneAndDelete({ _id: id, userId });
    if (!result) return res.status(404).json({ message: 'Address not found' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete address', error: err.message });
  }
};

function sanitize(body) {
  const {
    fullName,
    mobileNumber,
    pincode,
    locality,
    address,
    addressLine1,
    addressLine2,
    city,
    state,
    landmark,
    alternatePhone,
    addressType,
  } = body || {};
  return {
    ...(fullName !== undefined ? { fullName } : {}),
    ...(mobileNumber !== undefined ? { mobileNumber } : {}),
    ...(pincode !== undefined ? { pincode } : {}),
    ...(locality !== undefined ? { locality } : {}),
    ...(address !== undefined ? { address } : {}),
    ...(addressLine1 !== undefined ? { addressLine1 } : {}),
    ...(addressLine2 !== undefined ? { addressLine2 } : {}),
    ...(city !== undefined ? { city } : {}),
    ...(state !== undefined ? { state } : {}),
    ...(landmark !== undefined ? { landmark } : {}),
    ...(alternatePhone !== undefined ? { alternatePhone } : {}),
    ...(addressType !== undefined ? { addressType } : {}),
  };
}
