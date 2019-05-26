
export const LOG_FUNC = true;
export const LOG_CONTEXT = true;
export const LOG_LINES = [];

export function clear() {
    LOG_LINES.splice(0, LOG_LINES.length);
}

export function show() {
    console.log(LOG_LINES.join("\n"));
}

export function debug() {
    if (LOG_CONTEXT) {
        var line = "";
        for (var i = 0;i < arguments.length;i++) {
            line += arguments[i];
        }
        LOG_LINES.push(line);
    }
}

export function logfunc(funcname : string) {
    if (LOG_FUNC) {
        var line = funcname + "(";
        for (var i = 1;i < arguments.length;i++) {
            if (i > 1) {
                line += ", ";
            }
            line += arguments[i];
        }
        line += ");";
        LOG_LINES.push(line);
    }
}

