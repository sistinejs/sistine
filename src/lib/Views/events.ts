
import * as events from "../Core/events";

export class ViewPortChanged extends events.Event {
    readonly oldOffsetX : number;
    readonly oldOffsetY : number;
    readonly newOffsetX : number;
    readonly newOffsetY : number;
    constructor(oldOffsetX : number, oldOffsetY : number, newOffsetX : number, newOffsetY : number) {
        super();
        this.oldOffsetX = oldOffsetX;
        this.oldOffsetY = oldOffsetY;
        this.newOffsetX = newOffsetX;
        this.newOffsetY = newOffsetY;
    }
}

export class ZoomChanged extends events.Event {
    oldZoom : number
    newZoom : number
    constructor(oldZoom : number, newZoom : number) {
        super();
        this.oldZoom = oldZoom;
        this.newZoom = newZoom;
    }
}

