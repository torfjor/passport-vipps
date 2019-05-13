/**
 * Module dependencies
 */
const passport = require('passport-strategy')
const Vipps = require('./vipps')

/**
 * `Strategy` constructor.
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
class Strategy extends passport.Strategy {
  constructor (opts, verify) {
    if (!verify) {
      throw new Error('VippsStrategy requires a verify callback')
    }
    super(opts)
    this.vipps = new Vipps({
      clientId: opts.clientId,
      clientSecret: opts.clientSecret,
      tokenKey: opts.tokenKey,
      appKey: opts.appKey,
      merchantSerialNumber: opts.merchantSerialNumber,
      callbackUrl: opts.callbackUrl,
      consentRemovalUrl: opts.consentRemovalUrl,
      vippsCallback: opts.vippsCallback
    })
    this.name = 'vipps'
    this.verify = verify
  }

  async authenticate (req, options) {
    const verified = (err, user, info) => {
      if (err) {
        return this.error(err)
      }
      if (!user) {
        return this.fail(info)
      }
      return this.success(user, info)
    }

    if (req.session && req.session.vippsRequestID) {
      this.vipps
        .validate(req.session.vippsRequestID)
        .then(user => {
          return this.verify(user, verified)
        })
        .catch(() => {
          /* Destroy session and redirect back in case of failed validation */
          req.session.destroy(() => {
            return this.fail('Vipps authentication failed', 401)
          })
        })
    } else {
      try {
        const res = await this.vipps.initiateLogin()
        req.session.vippsRequestID = res.requestId
        this.redirect(res.url)
      } catch (error) {
        this.error(error)
      }
    }
  }
}

/**
 * Expose `Strategy`
 */
module.exports = Strategy
