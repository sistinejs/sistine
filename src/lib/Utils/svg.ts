import { Geom } from "../Geom/index"
import { toRadians } from "../Geom/utils"
import { Int } from "../Core/types"

function isDigit(ch : string) : boolean {
    return "0123456789".indexOf(ch) >= 0;
}

function isIdentCharisDigit(ch : string) : boolean {
    return "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(ch) >= 0;
}

export const PATH_COMMANDS = {
    'z': {command: 'z', name: "closePath", isRelative: true},
    'Z': {command: 'Z', name: "closePath", isRelative: false},
    'm': {command: 'm', name: "moveTo", isRelative: true},
    'M': {command: 'M', name: "moveTo", isRelative: false},
    'l': {command: 'l', name: "lineTo", isRelative: true},
    'L': {command: 'L', name: "lineTo", isRelative: false},
    'h': {command: 'h', name: "hlineTo", isRelative: true},
    'H': {command: 'H', name: "hlineTo", isRelative: false},
    'v': {command: 'v', name: "vlineTo", isRelative: true},
    'V': {command: 'V', name: "vlineTo", isRelative: false},
    'a': {command: 'a', name: "arcTo", isRelative: true},
    'A': {command: 'A', name: "arcTo", isRelative: false},
    'q': {command: 'q', name: "quadCurve", isRelative: true},
    'Q': {command: 'Q', name: "quadCurve", isRelative: false},
    't': {command: 't', name: "smoothQuadCurve", isRelative: true},
    'T': {command: 'T', name: "smoothQuadCurve", isRelative: false},
    'c': {command: 'c', name: "cubicCurve", isRelative: true},
    'C': {command: 'C', name: "cubicCurve", isRelative: false},
    's': {command: 's', name: "smoothCubicCurve", isRelative: true},
    'S': {command: 'S', name: "smoothCubicCurve", isRelative: false},
}

class Token {
    type : any;
    value : any;
    line : Int;
    column : Int;
    constructor(toktype : any, value : any, line : Int, column : Int) {
        this.type = toktype;
        this.value = value;
        this.line = line;
        this.column = column;
    }
}

class Iterator {
    constructor() {
        this._current = null;
    }

    all() {
        var out = [];
        while (this.hasNext()) {
            out.push(this.next());
        }
        return out;
    }

    next() {
        var out = this.peek();
        this._current = null;
        return out;
    }

    hasNext() {
        this.peek();
        return this._current != null;
    }

    peek() { return null; }
}

export class Tokenizer extends Iterator {
    private _input : string
    private _pos : Int
    private L : Int
    private _current : any = null;
    private _currCol : Int = 0;
    private _currLine : Int = 0;
    constructor(input : string) {
        super();
        this._input = input;
        this._pos = 0;
        this.L = this._input.length;
        this._current = null;
        this._currCol = 0;
        this._currLine = 0;
    }

    allValues() {
        var out = [];
        while (this.hasNext()) {
            out.push(this.next().value);
        }
        return out;
    }

    peekType() {
        var out = this.peek();
        return out == null ? null : out.type;
    }

    /**
     * Parses a number with the following syntax:
     * Source: https://www.w3.org/TR/SVG/paths.html#PathDataBNF
     *
     *  number:
     *      sign? integer-constant
     *      | sign? floating-point-constant
     *  integer-constant:   digit-sequence
     *  floating-point-constant:
     *      fractional-constant exponent?
     *      | digit-sequence exponent
     *  fractional-constant:
     *      digit-sequence? "." digit-sequence
     *      | digit-sequence "."
     *  exponent: ( "e" | "E" ) sign? digit-sequence
     *  sign: "+" | "-"
     *  digit-sequence: [0-9]+
     */
    _tokenizeNumber() {
        var c = this._currch();
        var out = "";
        var isFloat = false;
        if (c == "-") {
            out += c;
            this._advance();
            this._skipSpaces();
        }

        if (".0123456789".indexOf(this._currch()) < 0) {
            var msg = "Expected digit or '.' but found " + currch + ".";
            this._throw(this._currLine, this._currRow, msg);
        }
        // get all digits if we can
        out += this._readDigits();
        if (this._currch() == ".") {
            this._advance();
            out += ".";
            isFloat = true;
        }
        out += this._readDigits();

        // read the exponent
        var c = this._currch();
        if (c == "e" || c == "E") {
            out += c;
            this._advance();
            if (this._currch() == "-") {
                this._advance();
                out += "-";
            }
            out += this._readDigits();
            isFloat = true;
        }
        return isFloat ? parseFloat(out) : parseInt(out);
    }

    /**
     * Ensures that the next token is a number.
     */
    ensureToken(toktype, peekOnly) {
        var peekOnly = peekOnly || false;
        var out = this.peek();
        var foundType = "EOF";
        if (out != null) {
            foundType = out.type;
        }
        if (foundType != toktype) {
            var msg = "Expected token type (" + toktype + ") but found (" + foundType + ") instead.";
            this._throw(out.line, out.column, msg);
        }
        if (!peekOnly) {
            this.next();
        }
        return out.value;
    }

    _throw(line, col, msg) {
        throw new Error("Line " + line + ", Col: " + col + ": " + msg);
    }

    ensureNumber() { return this.ensureToken("NUMBER"); }
    ensurePoint() {
        var x = this.ensureNumber();
        var y = this.ensureNumber();
        return new Geom.Models.Point(x, y);
    }

    _advance() {
        this._currCol ++;
        var curr = this._input[this._pos];
        if (curr == "\n" || curr == "\r") {
            this._currLine ++;
            this._currCol = 0;
        }
        this._pos++;
    }

    _isSpaceChar(c) { return ",\n\r\t ".indexOf(c) >= 0; }

    _skipSpaces() { 
        while (this._pos < this.L) {
            var c = this._input[this._pos];
            if (!this._isSpaceChar(c)) break ;
            this._advance();
        }
    }

    _readWhile(func) {
        var out = "";
        while (this._pos < this.L) {
            var c = this._input[this._pos];
            if (!func(c)) break ;
            out += c;
            this._advance();
        }
        return out;
    }

    _readDigits() {
        return this._readWhile(isDigit);
    }

    _readIdent() {
        return this._readWhile(isIdentChar);
    }

    _currch() {
        if (this._pos < this.L) {
            return this._input[this._pos];
        }
        return null;
    }

    peek() {
        while (this._current == null) {
            this._skipSpaces();
            var c = this._currch();
            if (c == null) {
                break ;
            }

            var line = this._currLine;
            var col = this._currCol;
            this._current = this._readToken(line, col);
        }
        return this._current;
    }
}

export class PathDataTokenizer extends Tokenizer {
    _readToken(line, col) {
        var out = null;
        var c = this._currch();
        if (c in PATH_COMMANDS) {
            out = new Token("COMMAND", PATH_COMMANDS[c], line, col);
            this._advance();
        } else {
            // parse number
            var number = this._tokenizeNumber();
            out = new Token("NUMBER", number, line, col);
        }
        return out;
    }
}

export class PathDataParser extends Iterator {
    constructor(input) {
        super();
        this._tokenizer = new PathDataTokenizer(input);
        this._last = null;
    }

    peek() {
        if (this._current == null) {
            var tokenizer = this._tokenizer;
            if (!tokenizer.hasNext()) return null;
            var token = tokenizer.peek();
            var currCommand = null;
            if (token.type == "NUMBER") {
                // then use the "last command as is
                if (this._last == null) {
                    throw new Error("Expected command.  Found number");
                }
                currCommand = this._last;
            } else {
                currCommand = tokenizer.next().value;
            }
            this._last = currCommand;
            var args = [];
            if (currCommand.name == "closePath") {
            } else if (currCommand.name == "moveTo") {
                var point = tokenizer.ensurePoint();
                args = [point.x, point.y];
            } else if (currCommand.name == "lineTo") {
                var point = tokenizer.ensurePoint();
                args = [point.x, point.y];
            } else if (currCommand.name == "hlineTo") {
                var value = tokenizer.ensureNumber();
                args = [value];
            } else if (currCommand.name == "vlineTo") {
                var value = tokenizer.ensureNumber();
                args = [value];
            } else if (currCommand.name == "arcTo") {
                var rx = tokenizer.ensureNumber();
                var ry = tokenizer.ensureNumber();
                var rotation = tokenizer.ensureNumber();
                var isLargeArc = tokenizer.ensureNumber() == 1;
                var shouldSweep = tokenizer.ensureNumber() == 1;
                var endX = tokenizer.ensureNumber();
                var endY = tokenizer.ensureNumber();
                args = [ rx, ry, rotation, isLargeArc, shouldSweep, endX, endY ];
            } else if (currCommand.name == "quadCurve") {
                var x1 = tokenizer.ensureNumber();
                var y1 = tokenizer.ensureNumber();
                var x2 = tokenizer.ensureNumber();
                var y2 = tokenizer.ensureNumber();
                args = [ x1, y1, x2, y2];
            } else if (currCommand.name == "smoothQuadCurve") {
                var x1 = tokenizer.ensureNumber();
                var y1 = tokenizer.ensureNumber();
                args = [ x1, y1 ];
            } else if (currCommand.name == "cubicCurve") {
                var x1 = tokenizer.ensureNumber();
                var y1 = tokenizer.ensureNumber();
                var x2 = tokenizer.ensureNumber();
                var y2 = tokenizer.ensureNumber();
                var x3 = tokenizer.ensureNumber();
                var y3 = tokenizer.ensureNumber();
                args = [ x1, y1, x2, y2, x3, y3];
            } else if (currCommand.name == "smoothCubicCurve") {
                var x1 = tokenizer.ensureNumber();
                var y1 = tokenizer.ensureNumber();
                var x2 = tokenizer.ensureNumber();
                var y2 = tokenizer.ensureNumber();
                args = [ x1, y1, x2, y2 ];
            } else {
                tokenizer._throw(token.line, token.col, "Invalid token: " + token.type + " - " + token.value);
            }
            args.push(currCommand.isRelative);
            this._current = {'name': currCommand.name, 'args': args};
        }
        return this._current;
    }
}

export class TransformTokenizer extends Tokenizer {
    _isSpaceChar(c) { return "(),\n\r\t ".indexOf(c) >= 0; }
    _readToken(line, col) {
        var c = this._currch();
        var out = null;
        if (isIdentChar(c)) {
            out = new Token("IDENT", this._readIdent(), line, col);
        } else {
            // parse number
            var number = this._tokenizeNumber();
            out = new Token("NUMBER", number, line, col);
        }
        return out;
    }
}

export class TransformParser extends Iterator {
    constructor(input) {
        super();
        this._tokenizer = new TransformTokenizer(input);
    }

    peek() {
        if (this._current == null) {
            var tokenizer = this._tokenizer;
            if (!tokenizer.hasNext()) return null;
            var token = tokenizer.next();
            var tokValue = token.value.toLowerCase();
            if (tokValue == "matrix") {
                var a = tokenizer.ensureNumber();
                var b = tokenizer.ensureNumber();
                var c = tokenizer.ensureNumber();
                var d = tokenizer.ensureNumber();
                var e = tokenizer.ensureNumber();
                var f = tokenizer.ensureNumber();
                this._current = {'name': "matrix", 'args': [a,b,c,d,e,f]};
            } else if (tokValue == "translate") {
                var tx = tokenizer.ensureNumber();
                var ty = 0;
                var token = tokenizer.peek();
                if (token != null && token.type == "NUMBER") {
                    ty = tokenizer.ensureNumber();
                }
                this._current = {'name': "translate", 'args': [tx, ty]};
            } else if (tokValue == "scale") {
                var sx = tokenizer.ensureNumber();
                var sy = sx;
                var token = tokenizer.peek();
                if (token != null && token.type == "NUMBER") {
                    sy = tokenizer.ensureNumber();
                }
                this._current = {'name': "scale", 'args': [sx, sy]};
            } else if (tokValue == "rotate") {
                var theta = tokenizer.ensureNumber();
                this._current = {'name': "rotate", 'args': [toRadians(theta)]};
            } else if (tokValue == "skewx") {
                var sx = tokenizer.ensureNumber();
                this._current = {'name': "skew", 'args': [toRadians(sx), 0]};
            } else if (tokValue == "skewy") {
                var sy = tokenizer.ensureNumber();
                this._current = {'name': "skew", 'args': [0, toRadians(sy)]};
            } else {
                tokenizer._throw(token.line, token.col, "Invalid token: " + token.type + " - " + token.value);
            }
        }
        return this._current;
    }
}

export class NumbersTokenizer extends Tokenizer {
    _readToken(line, col) {
        var out = null;
        var c = this._currch();
        var number = this._tokenizeNumber();
        return new Token("NUMBER", number, line, col);
    }
}

export class NumbersParser extends Iterator {
    constructor(input) {
        super();
        this._tokenizer = new NumbersTokenizer(input);
    }

    peek() {
        if (this._current == null) {
            var tokenizer = this._tokenizer;
            if (!tokenizer.hasNext()) return null;
            var token = tokenizer.peek();
            if (token.type != "NUMBER") {
                throw new Error("Expected Number.  Found: " + token.type);
            }
            this._current = tokenizer.next().value;
        }
        return this._current;
    }
}
