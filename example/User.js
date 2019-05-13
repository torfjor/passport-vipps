const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  email: {
    type: String
  },
  userId: {
    type: String,
    unique: true
  },
  address: {
    addressLine1: {
      type: String
    },
    addressLine2: {
      type: String
    },
    city: {
      type: String
    },
    zipCode: {
      type: String
    },
    country: {
      type: String
    }
  }
})

userSchema.static('findOrCreate', async function (user) {
  if (!user) {
    throw new Error('No user supplied')
  }
  const _user = await this.findOneAndUpdate(
    {
      userId: user.userId
    },
    user,
    { new: true, upsert: true }
  )
  return _user
})

module.exports = mongoose.model('User', userSchema)
