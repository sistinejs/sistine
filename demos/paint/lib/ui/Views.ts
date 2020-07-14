declare var Handlebars: any;
import { ensureElement } from "./utils";
// import { findElement } from "../ui/utils";
import { Nullable } from "../../../../src/Core/types";

declare const BCDefaults: any;

export class View<EntityType> {
  rootElement: any;
  protected _template: any;
  readonly configs: any;
  readonly zIndex: number;
  protected _entity: Nullable<EntityType>;
  private entityUpdated = true;
  private _viewsCreated = false;
  protected renderAsTemplate = true;
  entityName = "entity";

  constructor(elem_or_id: any, entityName: Nullable<string>, entity: Nullable<EntityType>, configs: any = null) {
    configs = configs || {};
    this._entity = entity;
    this.configs = configs;
    this.zIndex = configs.zIndex || 1000;
    this.renderAsTemplate = configs.renderAsTemplate || true;
    this.entityName = entityName || "entity";
    this.rootElement = ensureElement(elem_or_id);
    this._template = configs.template || "<div>Hello World</div>";
    var self = this;
    setTimeout(() => self.setup(), 0);
  }

  findElement(target: string) {
    return this.rootElement.find(target);
  }

  /**
   * This method is called to create the view hierarchy of this view.
   * When this method is called the binding to the model has not yet
   * happened and should not expect any presence of data/models
   * to populate the views with.
   */
  setup(): this {
    if (!this._viewsCreated) {
      this.refreshViews();
    }
    return this;
  }

  refreshViews() {
    this.entityUpdated = true;
    this._viewsCreated = false;
    this.updateViewsFromEntity(this._entity);
    this._viewsCreated = true;
  }

  /**
   * This method recreates the complete view heieararchy.
   */
  protected setupViews() {
    this.rootElement.html(this.html());
    this.rootElement.css("z-Index", this.zIndex);
  }

  /**
   * Called when the entity has been updated in order to update the views
   * and/or their contents.
   * In this method the underlying entity must *not* be changed.
   * By default this method simply recreates the view hieararchy from scratch
   * by calling setupViews.
   */
  protected updateViewsFromEntity(_entity: Nullable<EntityType>) {
    this.setupViews();
  }

  get viewsCreated() {
    return this._viewsCreated;
  }

  get entity(): Nullable<EntityType> {
    if (this.entityUpdated && this._viewsCreated) {
      this._entity = this.extractEntity();
      this.entityUpdated = false;
    }
    return this._entity;
  }

  set entity(entity: Nullable<EntityType>) {
    if (this.isEntityValid(entity)) {
      this._entity = entity;
      this.refreshViews();
    }
  }

  protected isEntityValid(_entity: Nullable<EntityType>) {
    return true;
  }

  protected extractEntity(): Nullable<EntityType> {
    return this._entity;
  }

  html() {
    if (this.renderAsTemplate) {
      return this.renderedTemplate();
    } else {
      return this.template();
    }
  }

  template() {
    return this._template;
  }

  setTemplate(t: string) {
    this._template = t;
    return this;
  }

  enrichViewParams(viewParams: any): any {
    viewParams["Defaults"] = BCDefaults;
    return viewParams;
  }

  renderedTemplate(viewParams: any = null) {
    viewParams = this.enrichViewParams(viewParams || {});
    if (!(this.entityName in viewParams)) viewParams[this.entityName] = this._entity;
    var template = Handlebars.compile(this.template());
    return template(viewParams);
  }
}

export class Dialog<EntityType> extends View<EntityType> {
  dialog: any;
  resolveFunc: any;
  rejectFunc: any;
  shouldClose: Nullable<(data: any) => boolean> = null;
  protected _buttons: any[];

  setupViews() {
    super.setupViews();
    this.dialog = this.rootElement.dialog({
      autoOpen: false,
      position: { my: "center top", at: "center top", of: window },
      modal: true,
      // close: function () { self.close(); },
    });
  }

  get title(): string {
    return this.dialog.dialog("option", "title");
  }

  set title(t: string) {
    this.dialog.dialog("option", "title", t);
  }

  async open(): Promise<any> {
    if (!this.viewsCreated) {
      this.setup();
    }
    var self = this;
    return new Promise((resolve, reject) => {
      self.resolveFunc = resolve;
      self.rejectFunc = reject;
      self.dialog.dialog("option", "buttons", self.buttons()).dialog("open");
    });
  }

  close(data: Nullable<any> = null): boolean {
    if (this.shouldClose != null && !this.shouldClose(data)) return false;
    if (this.resolveFunc != null) {
      this.resolveFunc(data);
    }
    this.dialog.dialog("close");
    return true;
  }

  destroy() {
    this.dialog.dialog("destroy").remove();
  }

  buttons() {
    return this._buttons;
  }

  addButton(title: string, data: any = null) {
    this._buttons = this._buttons || [];
    var self = this;
    var b = {} as any;
    b["title"] = b["text"] = title;
    b["data"] = data;
    b["click"] = function () {
      self.close(b);
    };
    this._buttons.push(b);
    return this;
  }
  setButtons(b: any[]) {
    var self = this;
    this._buttons = [];
    b.forEach((v: any, _index: number) => {
      if (typeof v === "string") self.addButton(v);
      else self.addButton(v.title, v.data);
    });
    return this;
  }
}

export class FormDialog<EntityType> extends Dialog<EntityType> {
  errorMessageElem: JQuery<HTMLElement>;
  allFields: JQuery<any>;
  form: any;
  dialog: any;
  html() {
    return (
      `<form>
        <fieldset class = "dialog_fields">` +
      super.html() +
      `     <input type="submit" tabindex="-1" 
                   style="position:absolute; top:-1000px">
            <span class = "error_message_span"></span>
        </fieldset>
      </form>`
    );
  }

  get errorMessage(): string {
    return this.errorMessageElem.html();
  }

  set errorMessage(html: string) {
    this.errorMessageElem.html(html);
  }

  setupViews() {
    super.setupViews();
    this.errorMessageElem = this.rootElement.find(".error_message_span");
    this.allFields = $([]);
    this.form = this.dialog.find("form").on("submit", function (e: any) {
      e.preventDefault();
    });
  }

  async open(): Promise<any> {
    var out = super.open();
    this.form[0].reset();
    this.allFields.removeClass("ui-state-error");
    return out;
  }
}
