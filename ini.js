/*
    ry's very dumb JS ini parser
    (c) ry00001 2018-2019
*/

module.exports = {
    SECTION_REGEX: /^\[(?: {0,})(\w+)(?: {0,})\]/,
    KEY_REGEX: /^(\w+)(?: {0,})=(?: {0,})(.+)/,
    ESCAPE_REGEX: /\\(.)/g,
    UNICODE_ESCAPE_REGEX: /\\x([0-9A-Fa-f]{4})/,
    ESCAPES: {
        '\\': '\\',
        '\'': '\'',
        '"': '"',
        "0": '\0',
        a: '\u0007',
        b: '\u0008',
        r: '\r',
        n: '\n',
        t: '\t',
        ";": ";",
        "#": "#",
        "=": "=",
        ":": ":"
    },
    parse(inistr) {
        if (!inistr || typeof inistr !== "string") throw new TypeError("Argument must be a string.")
        let currentSection = ""
        let keys = {}
        for (let i of (inistr.replace(/\r/g, '')).split('\n')) {
            if (i.startsWith(';')) continue // ; is the ini comment char apparently
            let sm = this.SECTION_REGEX.exec(i)
            if (sm) {
                currentSection = sm[1]
                keys[currentSection] = {}
                continue
            }
            let km = this.KEY_REGEX.exec(i)
            if (km) {
                let key = km[1]
                let val = km[2]
                let h
                do {
                    h = this.ESCAPE_REGEX.exec(val)
                    if (h) {
                        let esc = this.ESCAPES[h[1]]
                        if (esc) val = val.replace(h[0], esc)
                    }
                } while (h)
                let ue
                do {
                    ue = this.UNICODE_ESCAPE_REGEX.exec(val)
                    if (ue) {
                        let t = ue[1]
                        val = val.replace(ue[0], String.fromCharCode(parseInt(t, 16)))
                    }
                } while (ue)
                if (currentSection) {
                    keys[currentSection][key] = val
                } else {
                    keys[key] = val
                }
            }
        }
        return keys
    }
}