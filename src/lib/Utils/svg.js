import { Geom } from "../Geom/index"

export const PATH_COMMANDS = {
    'm': {command: 'm', name: "moveTo", isRelative: true},
    'M': {command: 'M', name: "moveTo", isRelative: false},
    'l': {command: 'l', name: "lineTo", isRelative: true},
    'L': {command: 'L', name: "lineTo", isRelative: false},
    'h': {command: 'h', name: "hlineTo", isRelative: true},
    'H': {command: 'H', name: "hlineTo", isRelative: false},
    'v': {command: 'v', name: "vlineTo", isRelative: true},
    'V': {command: 'V', name: "vlineTo", isRelative: false},
    'z': {command: 'z', name: "closePath", isRelative: true},
    'Z': {command: 'Z', name: "closePath", isRelative: false},
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
    constructor(type, value, line, column) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }
}

export class PathTokenizer {
    constructor(input) {
        this._input = input;
        this._comps = input.split(/([MmLlHhZzvVcCsSQqTtAa \n\t\r,Ee\.\-])/g);
        this._pos = 0;
        this.L = this._comps.length;
        this._currToken = null;
        this._currCol = 0;
        this._currLine = 0;
    }

    peekType() {
        var out = this.peek();
        return out == null ? null : out.type;
    }

    peek() {
        while (this._currToken == null) {
            this._skipSpaces();
            var c = this._currch();
            if (c == null) {
                break ;
            }

            var line = this._currLine;
            var col = this._currCol;
            if (c in pathCommands) {
                this._currToken = new Token("COMMAND", pathCommands[c], line, col);
                this._advance();
            } else {
                // parse number
                /**
                    number:
                        sign? integer-constant
                        | sign? floating-point-constant
                    integer-constant:   digit-sequence
                    floating-point-constant:
                        fractional-constant exponent?
                        | digit-sequence exponent
                    fractional-constant:
                        digit-sequence? "." digit-sequence
                        | digit-sequence "."
                    exponent: ( "e" | "E" ) sign? digit-sequence
                    sign: "+" | "-"
                    digit-sequence: [0-9]+
                  */
                var out = "";
                var isFloat = false;
                if (c == "-") {
                    out += c;
                    this._advance();
                    this._skipSpaces();
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
                this._currToken = new Token("NUMBER", isFloat ? parseFloat(out) : parseInt(out), line, col);
            }
        }
        return this._currToken;
    }
    
    next() {
        var out = this.peek();
        this._currToken = null;
        return out;
    }

    hasNext() {
        this.peek();
        return this._currToken != null;
    }

    all() {
        var out = [];
        while (this.hasNext()) {
            out.push(this.next());
        }
        return out;
    }

    /**
     * Ensures that the next token is a number.
     */
    ensureToken(toktype, consume) {
        var out = this.peek();
        var foundType = "EOF";
        if (out != null) {
            foundType = out.type;
        }
        if (foundType != toktype) {
            throw new Error("Expected token type (" + type + ") but found (" + foundType + ") instead.");
        }
        if (consume || false) {
            this.next();
        }
        return out.value;
    }

    ensureNumber() { return ensureToken("NUMBER"); }
    ensurePoint() {
        var x = ensureNumber();
        var y = ensureNumber();
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

    _skipSpaces() { 
        while (this._pos < this.L) {
            var c = this._input[this._pos];
            if (",\n\r\t ".indexOf(c) < 0) break ;
            this._advance();
        }
    }

    _readDigits() {
        var out = "";
        while (this._pos < this.L) {
            var c = this._input[this._pos];
            if ("0123456789".indexOf(c) < 0) break;
            out += c;
            this._pos ++;
        }
        return out;
    }

    _currch() {
        if (this._pos < this.L) {
            return this._input[this._pos];
        }
        return null;
    }
}

