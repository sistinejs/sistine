
export const LOG_FUNC = true;
export const LOG_CONTEXT = true;
export const LOG_LINES : Array<string> = [];

export function clear() {
    LOG_LINES.splice(0, LOG_LINES.length);
}

export function show() {
    console.log(LOG_LINES.join("\n"));
}

export function debug(...args : any[]) {
    if (LOG_CONTEXT) {
        var line = "";
        for (var i = 0;i < args.length;i++) {
            line += args[i];
        }
        LOG_LINES.push(line);
    }
}

export function logfunc(funcname : string, ...args : any[]) {
    if (LOG_FUNC) {
        var line = funcname + "(";
        for (var i = 1;i < args.length;i++) {
            if (i > 1) {
                line += ", ";
            }
            line += args[i];
        }
        line += ");";
        LOG_LINES.push(line);
    }
}

