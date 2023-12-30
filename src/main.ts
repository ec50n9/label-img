import { createApp } from "vue";
import "./style.css";
import "virtual:uno.css";
import App from "./App.vue";
import VueKonva from "vue-konva";

createApp(App).use(VueKonva).mount("#app");
