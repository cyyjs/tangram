import Tangram from "./index.vue";
import { App } from 'vue';

export default {
  install: function(app: App, options = {}) {
    app.component(Tangram.name, Tangram);
  }
};
