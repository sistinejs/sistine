
class Panel extends Sistine.Core.Events.EventSource {
    constructor(elemSelector, configs) {
        super();
        this._elemSelector = elemSelector;
        this._rootElement = $(elemSelector);
        this.initialize(configs);
        this.setupElements();
        this.layout();
        this._enabled = true;
    }

    get elemSelector() { return this._elemSelector; };
    get rootElement() { return this._rootElement; };

    initialize(configs) {
    }

    setupElements() {
    }

    find(selector) {
        return $(this.elemSelector + " " + selector);
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

