/*
 * Copyright (c) 2018 Chuanqi Sun
 *
 * original code https://github.com/chuanqisun/figma-development-kit
 */

const storageKeyForAuthorizationCodeData = 'figma-authorization-code-data'
const storageKeyForAccessTokenData = 'figma-access-token-data'
const authorizationEndpoint = 'https://www.figma.com/oauth'
const accessTokenEndpoint = 'https://www.figma.com/api/oauth/token'

export const checkCode = () => {
  const parsedUrl = new URL(window.location.href)
  const code = parsedUrl.searchParams.get('code')
  const state = parsedUrl.searchParams.get('state')
  if (code && state) {
    const codeData = JSON.stringify({ code, state })
    window.localStorage.setItem(storageKeyForAuthorizationCodeData, codeData)
    window.close()
  }
}

export class FigmaApi {
  constructor({ clientId, clientSecret, redirectUri }) {
    if (!clientId) throw Error('clientId is required')
    if (!clientSecret) throw Error('clientSecret is required')
    if (!redirectUri) throw Error('redirectUri is required')
    this.config = { clientId, clientSecret, redirectUri }
  }

  hasLocalToken() {
    const existingTokenData = JSON.parse(
      window.localStorage.getItem(storageKeyForAccessTokenData)
    )
    return existingTokenData && existingTokenData.expireOnEpoch > Date.now()
  }

  async getOAuth2Token() {
    /* if a token exists and hasn't expired, re-use it */
    const existingTokenData = JSON.parse(
      window.localStorage.getItem(storageKeyForAccessTokenData)
    )
    if (existingTokenData && existingTokenData.expireOnEpoch > Date.now()) {
      return existingTokenData.token
    }

    /* if no token exists, request access code first */
    const state = Math.random().toString() // TODO randomize

    const tokenPromise = this.getAuthorizationCode(state)
      .then(code => this.getAccessTokenData(code))
      .then(accessTokenData => this.storeAccessTokenData(accessTokenData))
      .catch(error => console.error(error))

    const url = `${authorizationEndpoint}?client_id=${
      this.config.clientId
    }&redirect_uri=${
      this.config.redirectUri
    }&scope=file_read&state=${state}&response_type=code`
    popupwindow(url, 'Figma Login', window, 520, 600)

    return tokenPromise
  }

  async getAuthorizationCode(trueState) {
    return new Promise((resolve, reject) => {
      let storageEventHandler = null
      window.addEventListener(
        'storage',
        (storageEventHandler = event => {
          if (event.key === storageKeyForAuthorizationCodeData) {
            const { code, state } = JSON.parse(event.newValue)
            window.removeEventListener('storage', storageEventHandler)
            window.localStorage.removeItem(storageKeyForAuthorizationCodeData)
            if (state !== trueState) {
              reject('STATE_MISMATCH')
            } else {
              resolve(code)
            }
          }
        })
      )
    })
  }

  async getAccessTokenData(authorizationCode) {
    return fetch(
      `${accessTokenEndpoint}?client_id=${this.config.clientId}&client_secret=${
        this.config.clientSecret
      }&redirect_uri=${
        this.config.redirectUri
      }&code=${authorizationCode}&grant_type=authorization_code`,
      { method: 'POST' }
    )
      .then(response => response.json())
      .then(responseObject => {
        const { access_token, expires_in } = responseObject
        const expireOnEpoch = Date.now() + expires_in * 1000
        return { token: access_token, expireOnEpoch }
      })
  }

  storeAccessTokenData(accessTokenData) {
    window.localStorage.setItem(
      storageKeyForAccessTokenData,
      JSON.stringify(accessTokenData)
    )
    return accessTokenData.token
  }
}

function popupwindow(url, title, win, w, h) {
  var y = win.top.outerHeight / 2 + win.top.screenY - h / 2
  var x = win.top.outerWidth / 2 + win.top.screenX - w / 2
  return win.open(
    url,
    title,
    'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' +
      w +
      ', height=' +
      h +
      ', top=' +
      y +
      ', left=' +
      x
  )
}
