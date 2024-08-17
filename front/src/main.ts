import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import '@mdi/font/css/materialdesignicons.css'; // Ensure you are using css-loader
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { createPinia } from 'pinia';
import mitt from 'mitt';
import { lacenTheme } from './config/vuetify.theme';

// Creating instance
const app = createApp(App);

// Store
const pinia = createPinia();

// Vuetify
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'lacenTheme',
    themes: {
      lacenTheme,
    },
  },
  icons: {
    defaultSet: 'mdi',
  },
});

// Emitter
const emitter = mitt();
app.config.globalProperties.emitter = emitter;

app.use(vuetify);
app.use(pinia);
app.mount('#app');
