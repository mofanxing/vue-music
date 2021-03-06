import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'
import Axios from 'api/axios'
import 'common/stylus/index.styl'
import store from './store'
Vue.prototype.$axios = Axios
Vue.use(VueLazyLoad, {
  loading: require('common/image/default.png')
})
fastclick.attach(document.body)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
  store
})
