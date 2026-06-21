import mongoose from 'mongoose';

export const CATEGORIES = [
  'Pothole',
  'Garbage & Waste',
  'Streetlight',
  'Water Leakage/Logging',
  'Broken Road/Footpath',
  'Public Property Damage',
  'Stray Animals',
  'Other'
];

export const STATUSES = ['Reported', 'In Progress', 'Resolved'];

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: true
    },
    photoUrl: {
      type: String,
      required: true
    },
    photoPublicId: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator(value) {
            return value.length === 2 && value.every(Number.isFinite);
          },
          message: 'Coordinates must be [lng, lat].'
        }
      }
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Reported'
    },
    upvoteCount: {
      type: Number,
      default: 0,
      min: 0
    },
    upvotedDeviceIds: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

issueSchema.index({ location: '2dsphere' });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ upvoteCount: -1 });

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
