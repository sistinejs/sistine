

import * as models from "./models"
import * as events from "./events";
import * as controller from "./controller";
import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"

export const DEFAULT_CONTROL_SIZE = 5;

/**
 * Holds information about the instance of a shape.
 */
export class Text extends models.Shape {
    constructor(configs) {
        configs = configs || {};
        super(configs);
        this._xCoords = [];
        this._yCoords = [];
        this._dxValues = [];
        this._dyValues = [];
        this._rotationValues = [];
        this._textLength = 0;
    }

    addX(value) {
        this._xCoords.push(value);
        this.markTransformed();
        return this;
    }
    addY(value) {
        this._yCoords.push(value);
        this.markTransformed();
        return this;
    }
    addDX(value) {
        this._dxValues.push(value);
        this.markTransformed();
        return this;
    }
    addDY(value) {
        this._dyValues.push(value);
        this.markTransformed();
        return this;
    }
    addRotation(value) {
        this._rotationValues.push(value);
        this.markTransformed();
        return this;
    }

    get controllerClass() { return TextController; }

    draw(ctx) {
    }
}

export class TextController extends controller.ShapeController {
}
