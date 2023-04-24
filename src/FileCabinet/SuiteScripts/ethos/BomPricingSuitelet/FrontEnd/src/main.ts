import { createApp }    from 'vue';
import { createPinia }  from 'pinia';

import App      from './App.vue';
import router   from './router';
import PrimeVue from 'primevue/config';

import './assets/main.css';

/* Prime imports */
import "primevue/resources/themes/lara-light-indigo/theme.css"; // Theme
import "primevue/resources/primevue.min.css"; // Core
import 'primeicons/primeicons.css'; // Icons

/* PrimeVue components */
import Button       from 'primevue/button';
import InputText    from 'primevue/inputtext';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue);

app.component('Button', Button);
app.component('InputText', InputText);

app.mount('#app');
