import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n
import AuthService from './msal'
import JsonExcel from 'vue-json-excel'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import '@/styles/index.scss' // global css
import '@/icons' // icon

import App from './App'
import store from './store'
import router from './router'

import { mockXHR } from '../mock'
if (process.env.NODE_ENV === 'production') {
  mockXHR()
}

// setting up Authentication Service
Vue.prototype.$AuthService = new AuthService()

// setting up ElementUI lang to EN
Vue.use(ElementUI, { locale })
Vue.config.productionTip = false

// setting up / integrating vue-json-excel package
Vue.component('downloadExcel', JsonExcel)

// Creating Base Vue instance
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
