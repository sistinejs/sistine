import { Geom } from "../Geom/index"

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
    't': {command: 't', name: "quadCurve", isRelative: true, isSmooth: true},
    'T': {command: 'T', name: "quadCurve", isRelative: false, isSmooth: true},
    'c': {command: 'c', name: "cubicCurve", isRelative: true},
    'C': {command: 'C', name: "cubicCurve", isRelative: false},
    's': {command: 's', name: "cubicCurve", isRelative: true, isSmooth: true},
    'S': {command: 'S', name: "cubicCurve", isRelative: false, isSmooth: true},
}

class Token {
    constructor(type, value, line, column) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }
}

export class Tokenizer {
    constructor(input) {
        this._input = input;
        this._pos = 0;
        this.L = this._input.length;
        this._currToken = null;
        this._currCol = 0;
        this._currLine = 0;
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
            this._advance();
        }
        return out;
    }

    _currch() {
        if (this._pos < this.L) {
            return this._input[this._pos];
        }
        return null;
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
            this._currToken = this._readToken(line, col);
        }
        return this._currToken;
    }
}

export class PathTokenizer extends Tokenizer {
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

export class TransformTokenizer extends Tokenizer {
    _readToken(line, col) {
        var c = this._currch();
        var out = null;
        return out;
    }
}

