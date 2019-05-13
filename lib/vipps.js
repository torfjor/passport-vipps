/**
 * Module dependencies
 */
const got = require('got')
const nanoid = require('nanoid')

const {
  VippsErrorInternal,
  VippsErrorInvalidClient,
  VippsErrorInvalidSecret
} = require('./errors')

/**
 * `Vipps` constructor
 */
class Vipps {
  constructor (opts) {
    this.callbackUrl = opts.callbackUrl
    this.consentRemovalUrl = opts.consentRemovalUrl
    this.merchantSerialNumber = opts.merchantSerialNumber
    this.vippsCallback = opts.vippsCallback

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://api.vipps.no/'
        : 'https://apitest.vipps.no'

    this.client = got.extend({
      baseUrl,
      timeout: 5000,
      retry: 5,
      json: true
    })

    this.tokenClient = this.client.extend({
      headers: {
        client_id: opts.clientId,
        client_secret: opts.clientSecret,
        'Ocp-Apim-Subscription-Key': opts.tokenKey
      },
      method: 'POST'
    })

    this.vippsClient = this.client.extend({
      headers: {
        'Ocp-Apim-Subscription-Key': opts.appKey
      },
      hooks: {
        beforeRequest: [
          async options => {
            const token = await this.fetchToken()
            if (options.headers) {
              options.headers['X-Timestamp'] = new Date().toString()
              options.headers['X-Request-Id'] = nanoid()
              options.headers.Authorization = `${token.token_type} ${
                token.access_token
              }`
            }
          }
        ]
      }
    })
  }
  /**
   * Fetches a Vipps access token (JWT)
   */
  async fetchToken () {
    if (this.accessToken && this.accessToken.expires_on > Date.now() / 1000) {
      return this.accessToken
    }
    try {
      const { body } = await this.tokenClient('accessToken/get')
      this.accessToken = body
      return this.accessToken
    } catch (error) {
      if (error instanceof got.HTTPError) {
        if (error.statusCode === 400) {
          throw new VippsErrorInvalidClient()
        } else if (error.statusCode === 401) {
          throw new VippsErrorInvalidSecret()
        } else {
          throw new VippsErrorInternal()
        }
      } else {
        throw error
      }
    }
  }
  /**
   * Validates a Vipps login request
   */
  async validate (requestId) {
    const { body } = await this.vippsClient.get(
      `/signup/v1/loginRequests/${requestId}`
    )
    if (body.status && body.status === 'SUCCESS') {
      const { firstName, lastName, userId, email, address } = body.userDetails
      return {
        firstName,
        lastName,
        userId,
        email,
        address
      }
    } else {
      throw new Error()
    }
  }
  /**
   * Intiates a new Vipps login request
   */
  async initiateLogin () {
    const request = {
      merchantInfo: {
        callbackPrefix: this.vippsCallback,
        consentRemovalPrefix: this.consentRemovalUrl,
        fallBack: this.callbackUrl,
        isApp: false,
        merchantSerialNumber: this.merchantSerialNumber
      }
    }
    const { body } = await this.vippsClient.post('/signup/v1/loginRequests', {
      body: request
    })

    return body
  }
}

module.exports = Vipps
