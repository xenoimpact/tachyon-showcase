import {createApp} from 'vue';
import {createPinia} from 'pinia';
import Vrix from 'vrix.vue';
import Tachyon from './config/tachyon';
import 'tachyon.vue/tachyon.css';
import '@/assets/styles/index.css';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia());
app.use(Vrix);
app.use(Tachyon);
app.mount('#app');
