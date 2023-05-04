import { createApp }    from 'vue';
import { createPinia }  from 'pinia';

import App      from './App.vue';
import router   from './router';
import PrimeVue from 'primevue/config';

import './assets/main.css';

/* Prime imports */
import "primevue/resources/themes/lara-light-indigo/theme.css"; // Theme
import "primevue/resources/primevue.min.css"; // Core
import 'primeicons/primeicons.css'; // Icon

import 'primeflex/primeflex.css'; // Primeflex

/* PrimeVue components */
import Button       from 'primevue/button';
import InputText    from 'primevue/inputtext';
import Checkbox     from "primevue/checkbox";
import DataTable    from 'primevue/datatable';
import Column       from 'primevue/column';
import ColumnGroup  from 'primevue/columngroup';
import Row          from 'primevue/row';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue);

app.component('Button',         Button);
app.component('InputText',      InputText);
app.component('CheckBox',       Checkbox);
app.component('DataTable',      DataTable);
app.component('Column',         Column);
app.component('ColumnGroup',    ColumnGroup);
app.component('Row',            Row);

app.mount('#app');
