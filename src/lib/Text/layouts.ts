import * as geom from "../Geom/models"
import * as geomutils from "../Geom/utils"
import * as Utils from "../Utils/index"

/**
 * Decides how text should be rendered.
 */
class Layout {
    constructor(configs : any) {
    }

    /**
     * Returns the bounding box of the laid out text.
     */
    get boundingBox() : geom.Bounds {
        return new geom.Bounds();
    }
}

/**
 * Text is preformatted, and any new lines only occur due to newline
 * characters already in the text.
 */
class PreformattedLayout extends Layout {
    constructor(configs) {
        super();
    }
}

/**
 * In wrapped layout, text is laid out so that auto wrapping is applied based 
 * on width or height constraints.
 */
class WrappedLayout extends Layout {
}

/**
 * Laying out text on a path.
 *
 * From https://www.w3.org/TR/SVG2/text.html#TextLayoutPath:
 * 
 * ```
 * Text on a path is conceptionally like a single line of pre-formatted text 
 * that is then transformed to follow the path. Except as indicated, all the 
 * properties that apply to pre-formatted text apply to text on a path.
 * ```
 */
class PathLayout extends PreformattedLayout {
}

class ShapedLayout extends Layout {
}

