const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    unique: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  icon: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(svg|png|webp)$/.test(v);
      },
      message: props => `${props.value} is not a valid icon URL!`
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure category name is indexed for faster lookups
categorySchema.index({ name: 1 });

module.exports = mongoose.model('Category', categorySchema);