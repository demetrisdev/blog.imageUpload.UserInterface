const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    match: /^[a-zA-Z\s]+$/, // only letters and spaces allowed
    maxlength: 60 // max length of 50 characters
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: { type: Boolean, default: false }
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});


userSchema.index({ name: 1, surname: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);