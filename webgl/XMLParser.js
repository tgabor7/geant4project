class XMLParser {
    constructor(c) {
        this.content = c;
    }
    loadAttribute(s) {
        var results = [];
        var result = '';
        var append = false;
        var l = 0;
        for (var i = 0; i < this.content.length; i++) {
            if (append && this.find(i, this.content, s)) {
                append = false;
                result = result.substring(0, result.length - 2);
                results.push(result);
                result = '';
                continue;
            }
            if (this.find(i, this.content, s)) {
                append = true;
                i += s.length + 1;
            }
            if (append) result += this.content[i];
        }
        return results;
    }
    find(a, s, c) {
        if (a + c.length >= s.length) return false;
        for (var i = 0; i < c.length; i++) {
            if (s[a + i] != c[i]) return false;
        }
        return true;
    }
    static export(s) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(s));
        element.setAttribute('download', 'setup.g4');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
};

export default XMLParser;