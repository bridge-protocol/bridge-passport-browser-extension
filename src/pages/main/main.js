import Vue from 'vue'
import App from './App'
import Vuetify from "vuetify";

Vue.use(Vuetify);

var app = new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  render: h => h(App)
});