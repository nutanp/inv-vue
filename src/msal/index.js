import * as Msal from 'msal'
import config from '../config'
import router from '../router'
import store from '../store'
import GraphService from '../msal/graph.service'

export default class AuthService {
  constructor() {
    const redirectUri = config.redirect_url
    this.graphUrl = config.graph_end_point
    this.graphService = new GraphService()
    this.applicationConfig = {
      clientID: config.auth_client_id,
      authority: config.authority,
      graphScopes: config.graph_scopes
    }
    this.app = new Msal.UserAgentApplication(
      this.applicationConfig.clientID,
      this.applicationConfig.authority,
      () => {
        // callback for login redirect
      },
      {
        redirectUri
      }
    )
    // Configuration object constructed
    // const config = {
    //   auth: {
    //     clientId: config2.auth_client_id,
    //     redirectUri: config2.redirect_url,
    //     authority: config2.authority
    //   },
    //   cache: {
    //     cacheLocation: 'localStorage',
    //     storeAuthStateInCookie: true
    //   }
    // }
    // create UserAgentApplication instance
    // this.app = new Msal.UserAgentApplication(config)

    // create callback for redirect function
    // const authCallback = function(error, response) {
    //   // handle error or response
    //   console.log(error)
    // }

    // // register redirect call backs for Success and Error
    // this.myMSALObj.handleRedirectCallback(authCallback)

    const whiteList = ['/login'] // no redirect whitelist
    const usrInfo = this.app.getUser()
    // const usrInfo = this.myMSALObj.getAccount()

    router.beforeEach(async(to, from, next) => {
      if (usrInfo) {
        store.dispatch('inventory/setLoggedInUserEmail', usrInfo.displayableId)
        store.dispatch('inventory/setLoggedInUserFullName', usrInfo.name)
        if (!this.isUserAuthorized(usrInfo) && to.path !== '/401') {
          next({ path: '/401' })
        } else if (to.path === '/login') {
          // if is logged in, redirect to the home page
          next({ path: '/' })
        } else {
          this.getToken().then(
            token => {
              this.graphService.getUserEid(token, usrInfo.displayableId).then(
                data => {
                  var eid = data.extension_ddb4b494038b46af889ef8408a31e34a_mck_eid.toUpperCase()
                  store.dispatch('inventory/setLoggedInUserEid', eid)
                },
                error => {
                  console.error(error)
                }
              )
            },
            error => {
              console.error(error)
            }
          )
          next()
        }
      } else {
        if (whiteList.indexOf(to.path) !== -1) {
          // in the free login whitelist, go directly
          next()
        } else {
          // other pages that do not have permission to access are redirected to the login page.
          next(`/login?redirect=${to.path}`)
        }
      }
    })
  }

  isUserAuthorized(usr) {
    const usrGroups = usr.idToken.roles
    console.log("printing usrGroups",usrGroups)
    if (usrGroups === undefined) {
      return false
    } else {
      const env = process.env.NODE_ENV
      var ugroup = 'UNASSIGNED'
      var showMassUpload = false
      if (env === 'production') {
        if (usrGroups.includes(process.env.VUE_APP_SUPPORT_DEV_CLIENT_ID)) {
          ugroup = process.env.VUE_APP_SUPPORT_DEV_GRP
        } else if (usrGroups.includes(process.env.VUE_APP_COMPASS_DEV_CLIENT_ID)) {
          ugroup = process.env.VUE_APP_COMPASS_DEV_GRP
        } else if (usrGroups.includes(process.env.VUE_APP_FLU_DEV_CLIENT_ID)) {
          ugroup = process.env.VUE_APP_FLU_DEV_GRP
        }

        if (usrGroups.includes(process.env.VUE_APP_IA_MU_PRD_CLIENT_ID)) {
          showMassUpload = true
        } 
      } else if (env === 'development') {
        if (usrGroups.includes(process.env.VUE_APP_SUPPORT_PRD_CLIENT_ID)) {
          ugroup = process.env.VUE_APP_SUPPORT_PRD_GRP
        } else if (usrGroups.includes(process.env.VUE_APP_COMPASS_PRD_CLIENT_ID)) {
          ugroup = process.env.VUE_APP_COMPASS_PRD_GRP
        } else if (usrGroups.includes(process.env.VUE_APP_FLU_PRD_CLIENT_ID)) {
          ugroup = process.env.VUE_APP_FLU_PRD_GRP
        }
        
        if (usrGroups.includes(process.env.VUE_APP_IA_MU_DEV_CLIENT_ID)) {
          showMassUpload = true
        }
      }
      store.dispatch('inventory/setUgroup', ugroup)
      store.dispatch('inventory/setShowMassUpload', showMassUpload)
      return ugroup !== 'UNASSIGNED'
    }
  }

  getToken() {
    return this.app.acquireTokenSilent(this.applicationConfig.graphScopes).then(
      accessToken => {
        return accessToken
      },
      // eslint-disable-next-line handle-callback-err
      error => {
        return this.app
          .acquireTokenPopup(this.applicationConfig.graphScopes)
          .then(
            accessToken => {
              return accessToken
            },
            err => {
              console.error(err)
            }
          )
      }
    )
  }

  loginRedirect() {
    this.app.loginRedirect(this.applicationConfig.graphScopes)
  }

  logout() {
    this.app._user = null
    this.app.logout()
  }
}
