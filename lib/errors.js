class VippsErrorInvalidClient extends Error {
  constructor () {
    super('Supplied clientId is invalid')
    this.name = 'VippsErrorInvalidClient'
  }
}

class VippsErrorInvalidSecret extends Error {
  constructor () {
    super('Supplied clientSecret is invalid')
    this.name = 'VippsErrorInvalidSecret'
  }
}

class VippsErrorInternal extends Error {
  constructor () {
    super('Internal Vipps Error')
    this.name = 'VippsErrorInternal'
  }
}

module.exports = {
  VippsErrorInternal,
  VippsErrorInvalidClient,
  VippsErrorInvalidSecret
}
