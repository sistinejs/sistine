import "./styles/global.scss";

import { App } from "./src/app";

$(document).ready(function () {
  var theApp = new App();
  (window as any).theApp = theApp;
});
