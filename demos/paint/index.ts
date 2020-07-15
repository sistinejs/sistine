// import "./styles/global";

import { App } from "./lib/App";
import { addSampleShapes } from "./lib/stage";
import { connectEventHandlers } from "./lib/events";

$(document).ready(function () {
  var theApp = new App();
  (window as any).theApp = theApp;
  addSampleShapes();
  connectEventHandlers(theApp);
});
