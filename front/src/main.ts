import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import '@mdi/font/css/materialdesignicons.css'; // Ensure you are using css-loader
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { VNumberInput } from 'vuetify/labs/VNumberInput';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { createPinia } from 'pinia';
import mitt from 'mitt';
import { lacenTheme } from './config/vuetify.theme';
import router from '@/router/router';

// Components
import LacenCard from '@/components/layout/LacenCard.vue';
import LacenBtn from '@/components/layout/LacenBtn.vue';
import ImageCard from '@/components/ImageCard.vue';

// Creating instance
const app = createApp(App);

// Components
app.component('LacenCard', LacenCard);
app.component('LacenBtn', LacenBtn);
app.component('ImageCard', ImageCard);

// Store
const pinia = createPinia();

// Vuetify
const vuetify = createVuetify({
  components: {
    ...components,
    VNumberInput,
  },
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
app.use(router);
app.mount('#app');
