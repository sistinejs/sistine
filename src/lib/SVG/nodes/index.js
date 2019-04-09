
import * as text from "./text"
import * as path from "./path"
import * as circle from "./circle"
import * as rect from "./rect"
import * as g from "./g"
import * as svg from "./svg"
import * as defs from "./defs"
import * as use from "./use"
import * as desc from "./desc"

export const Nodes = {
    UseNodeProcessor: use.UseNodeProcessor,
    DefsNodeProcessor: defs.DefsNodeProcessor,
    TextNodeProcessor: text.TextNodeProcessor,
    TSpanNodeProcessor: text.TSpanNodeProcessor,
    PathNodeProcessor: path.PathNodeProcessor,
    GNodeProcessor: g.GNodeProcessor,
    SVGNodeProcessor: svg.SVGNodeProcessor,
    CircleNodeProcessor: circle.CircleNodeProcessor,
    RectNodeProcessor: rect.RectNodeProcessor,
    TitleNodeProcessor: desc.TitleNodeProcessor,
    DescNodeProcessor: desc.DescNodeProcessor,
}

