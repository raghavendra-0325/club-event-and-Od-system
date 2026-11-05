const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Club name is required'],
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Club code/acronym is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Club category is required'],
      enum: ['Technical', 'Cultural', 'Sports', 'Social Service', 'Literary', 'Entrepreneurship'],
      default: 'Technical'
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    facultyAdvisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty advisor is required']
    },
    studentLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    themeColor: {
      type: String,
      default: '#3b82f6'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Club', ClubSchema);
