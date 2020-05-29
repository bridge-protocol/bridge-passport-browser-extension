import Vue from 'vue'
import App from './App'
import Vuetify from "vuetify";

Vue.use(Vuetify);

var app = new Vue({
  el: '#app',
  vuetify: new Vuetify({
    theme: {
      themes: {
        dark: {
          primary: '#3c7fc6',
          secondary: '#6155a3',
          accent: '#904099',
          info: '#6155a3',
          error: '#b71c1c',
        },
      },
    },
  }),
  render: h => h(App)
});