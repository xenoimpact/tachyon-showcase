import {createApp} from 'vue';
import Tachyon from './config/tachyon';
import 'tachyon.vue/tachyon.css';
import App from './App.vue';

createApp(App).use(Tachyon).mount('#app');
