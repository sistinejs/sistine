
const PanelGUIDs = { value: 1 }

class Panel extends Sistine.Core.Events.EventSource {
    constructor(elemSelector, configs) {
        super();
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

    get elemSelector() { return this._elemSelector; };
    get rootElement() { return this._rootElement; };

    initialize(configs) {
    }

    setupElements() {
    }

    subselector(selector) {
        return this.elemSelector + " " + selector;
    }

    find(selector) {
        return $(this.subselector(selector));
    }

    layout() {
    }

    get isShowing() {
        return this.rootElement.is(":visible");
    }

    enable(value) {
    }

    show() {
    }

    hide() {
    }
}

