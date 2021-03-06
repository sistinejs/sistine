import { Shape } from "../Core/models"
import { ShapeController, ControlPoint, HitInfo, HitType, HitInfoSnapshot, DEFAULT_CONTROL_SIZE } from "../Core/controller"
import { Point, Bounds } from "../Geom/models"
import { boundsOfCubicCurve } from "../Geom/utils"
import { Nullable } from "../Core/types"

export class Image extends Shape {
    private loaded : boolean = false;
    private _image : any = null;
    private _x : number = 0;
    private _y : number = 0;
    private _width : number = 0;
    private _height : number = 0;
    private _clipX : any = null;
    private _clipY : any = null;
    private _clipWidth : any = null;
    private _clipHeight : any = null;
    constructor(configs : any) {
        super((configs = configs || {}));
        // see what the image source is
        this._image = null;
        this._x = configs._x || 0;
        this._y = configs._y || 0;
        this._width = configs._width || 0;
        this._height = configs._height || 0;
        this._clipX = configs._clipX || null;
        this._clipY = configs._clipY || null;
        this._clipWidth = configs._clipWidth || null;
        this._clipHeight = configs._clipHeight || null;

        if (configs._image) {
            this._image = configs._image || null;
            this.loaded = true;
        } else if (configs.element) {
            this.loadElement(configs.element);
        } else if (configs.url) {
            this.loadFromUrl(configs.url);
        }
    }

    /**
     * Load the image from a url.
     */
    loadFromUrl(url : string, callback? : any) {
        this.loaded = false;
        var self = this;
        // create an image element and load this
        $("<img/>")
            .on('load', function() {
                self.loaded = true;
                self._image = this;
                console.log("image loaded correctly");
            }).on('error', function() {
                console.log("error loading image");
            }).attr("src", url);
    }

    /**
     * Load the image from an ID in the document.
     */
    loadElement(id : string) {
        var element = document.getElementById(id);
        if (element != null) {
            var tagname = element.tagName.toLowerCase();
            this.loaded = false;
            if (tagname == "img" || tagname == "canvas") {
                this.loaded = true;
                this._image = element;
            }
        }
    }

    get x() { return this._x; }
    get y() { return this._y; }
    set x(value) { this._x = value; }
    set y(value) { this._y = value; }

    get width() { return this._width; }
    set width (value) {
        this._width = value;
        if (this._width < 0) {
            throw new Error("Width cannot be negative");
        }
    }

    get height() { return this._height; }
    set height (value) {
        this._height = value;
        if (this._height < 0) {
            throw new Error("Height cannot be negative");
        }
    }

    get clipX() { return this._clipX; }
    get clipY() { return this._clipY; }
    set clipX(value) { this._clipX = value; }
    set clipY(value) { this._clipY = value; }

    get clipWidth() { return this._clipWidth; }
    set clipWidth (value) {
        this._clipWidth = value;
        if (this._clipWidth < 0) {
            throw new Error("Width cannot be negative");
        }
    }

    get clipHeight() { return this._clipHeight; }
    set clipHeight (value) {
        this._clipHeight = value;
        if (this._clipHeight < 0) {
            throw new Error("Height cannot be negative");
        }
    }

    _setBounds(newBounds : Bounds) {
        this._x = newBounds.left;
        this._y = newBounds.top;
        this._width = newBounds.width;
        this._height = newBounds.height;
    }

    _evalBoundingBox() {
        return new Bounds(this.x, this.y, this.width, this.height);
    }

    get className() { return "Image"; }

    draw(ctx : any) {
        if (this.loaded) {
            if (this._clipX != null) {
                ctx.drawImage(this._image, 
                              this._clipX, this._clipY, this._clipWidth, this._clipHeight,
                              this._x, this._y, this._width, this._height);
            } else {
                ctx.drawImage(this._image, 
                              this._x, this._y, this._width, this._height);
            }
        }
    }
}

/**
 * The controller responsible for handling updates and manipulations of the Shape.
 */
export class ImageController extends ShapeController<Image> {
}
