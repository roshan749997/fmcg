import mongoose from 'mongoose';

const policySectionSchema = new mongoose.Schema({
  sectionNumber: {
    type: Number,
    required: true,
  },
  heading: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
}, { _id: false });

const policySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['privacy', 'terms', 'shipping', 'refund'],
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Support both old format (single content) and new format (sections)
    content: {
      type: String,
      default: '',
    },
    sections: {
      type: [policySectionSchema],
      default: [],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Policy = mongoose.models.Policy || mongoose.model('Policy', policySchema);

export default Policy;

