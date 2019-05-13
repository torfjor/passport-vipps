const passport = require('passport')
const VippsStrategy = require('passport-vipps').Strategy
const session = require('express-session')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')

require('dotenv').config()

const User = require('./User')

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.redirect('/login')
}

const app = express()
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'public/')))
app.use(
  session({
    secret: 'lolcatz'
  })
)

passport.use(
  'vipps',
  new VippsStrategy(
    {
      clientId: process.env.VIPPS_CLIENT_ID,
      clientSecret: process.env.VIPPS_CLIENT_SECRET,
      tokenKey: process.env.VIPPS_TOKEN_KEY,
      appKey: process.env.VIPPS_APP_KEY,
      merchantSerialNumber: process.env.VIPPS_MERCHANT_SERIAL_NUMBER,
      callbackUrl: 'https://vipps.localtunnel.me/auth/callback',
      consentRemovalUrl: 'https://vipps.localtunnel.me/consentremoval',
      vippsCallback: 'http://vipps.localtunnel.me/auth/callback'
    },
    function (user, done) {
      User.findOrCreate(user)
        .then(user => {
          done(null, user)
        })
        .catch(error => {
          done(error, null)
        })
    }
  )
)
passport.serializeUser(function (user, done) {
  done(null, user._id)
})

passport.deserializeUser(async (uid, done) => {
  try {
    const user = await User.findById(uid).orFail(new Error('User not found'))
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})
app.use(bodyParser.json())
app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect('/welcome')
  } else {
    res.redirect('/login')
  }
})
app.get('/welcome', ensureAuthenticated, (req, res, next) => {
  res.render('welcome', { user: req.user })
})
app.get('/login', (req, res, next) => {
  res.render('login')
})
app.get('/logout', (req, res, next) => {
  req.logout()
  res.redirect('/login')
})
app.get('/auth/login', passport.authenticate('vipps'))
app.get(
  '/auth/callback',
  passport.authenticate('vipps', {
    failureRedirect: '/login',
    successRedirect: '/welcome'
  })
)

app.listen(8080, async () => {
  try {
    await mongoose.connect(process.env.DB, {
      useFindAndModify: false,
      useNewUrlParser: true,
      useCreateIndex: true
    })
  } catch (error) {
    console.error(error)
  }
})
