import mongoose from 'mongoose';

const logoSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['header', 'footer'],
      unique: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      default: 'Logo',
      trim: true,
    },
    width: {
      type: String,
      default: 'auto',
      trim: true,
    },
    height: {
      type: String,
      default: 'auto',
      trim: true,
    },
  },
  { timestamps: true }
);

const Logo = mongoose.models.Logo || mongoose.model('Logo', logoSchema);

export default Logo;

