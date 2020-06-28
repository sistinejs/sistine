import { Sistine } from "../../../../lib/index";
import { App } from "../App"

const PanelGUIDs = { value: 1 };

export class Panel extends Sistine.Core.Events.EventSource {
  _uniqueID: number;
  _elemSelector: string;
  _rootElement: any;
  _enabled: boolean;
  _lastModifiedAt: number;
  _lastCreatedAt: number;
  app : App

  constructor(app : App, elemSelector: string, configs?: any) {
    super();
    this.app = app
    this._uniqueID = PanelGUIDs.value++;
    this._elemSelector = elemSelector;
    this._rootElement = $(elemSelector);
    this.initialize(configs);
    this.setupElements();
    this.layout();
    this._enabled = true;
    this.markCreated();
    this.markModified();
  }

  get uniqueid() {
    return this._uniqueID;
  }

  get isModified() {
    return this._lastModifiedAt > this._lastCreatedAt;
  }

  markModified() {
    this._lastModifiedAt = Date.now();
  }

  markCreated() {
    this._lastCreatedAt = Date.now();
  }

  get elemSelector() {
    return this._elemSelector;
  }
  get rootElement() {
    return this._rootElement;
  }

  initialize(configs: any) {}

  setupElements() {}

  subselector(selector: string) {
    return this.elemSelector + " " + selector;
  }

  find(selector: string) {
    return $(this.subselector(selector));
  }

  layout() {}

  get isShowing() {
    return this.rootElement.is(":visible");
  }

  enable(value: boolean) {}

  show() {}

  hide() {}
}
