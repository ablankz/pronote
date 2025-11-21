import DiffMatchPatch, { Diff, PatchObject } from "../diff";

function assertEquivalent<T>(expected: T, actual?: T, msg?: string|T): void {
    if (actual === undefined) {
        actual = expected;
        expected = msg as T;
        msg = `Expected: '${expected}' Actual: '${actual}'`;
    }

    if (_equivalent(expected, actual)) {
        expect(String(actual)).toBe(String(expected));
    } else {
        expect(actual).toEqual(expected);
    }
}

function _equivalent(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
        if (a.toString() !== b.toString()) {
        return false;
        }
        for (const p in a) {
        if (Object.prototype.hasOwnProperty.call(a, p) && !_equivalent(a[p], b[p])) {
            return false;
        }
        }
        for (const p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p) && !_equivalent(a[p], b[p])) {
            return false;
        }
        }
        return true;
    }
    return false;
}

function diff_rebuildtexts(diffs: Diff[]): [string, string] {
    let text1 = '';
    let text2 = '';

    for (const diff of diffs) {
        if (diff.operation !== DiffMatchPatch.DIFF_INSERT) {
            text1 += diff.text;
        }
        if (diff.operation !== DiffMatchPatch.DIFF_DELETE) {
            text2 += diff.text;
        }
    }

    return [text1, text2];
}

describe('Utility Functions', () => {
    let dmp: DiffMatchPatch;

    beforeEach(() => {
        dmp = new DiffMatchPatch();
    });

    test('assertEquivalent should pass for equal values', () => {
        expect(() => assertEquivalent(5, 5)).not.toThrow();
        expect(() => assertEquivalent('hello', 'hello')).not.toThrow();
        expect(() => assertEquivalent({ a: 1, b: 2 }, { a: 1, b: 2 })).not.toThrow();
    });

    test('assertEquivalent should fail for different values', () => {
        expect(() => assertEquivalent(5, 10)).toThrow();
        expect(() => assertEquivalent('hello', 'world')).toThrow();
        expect(() => assertEquivalent({ a: 1 }, { a: 2 })).toThrow();
    });

    test('diff_rebuildtexts should reconstruct original texts', () => {
        const diffs: Diff[] = [
            {operation: DiffMatchPatch.DIFF_DELETE, text: 'abc'},
            {operation: DiffMatchPatch.DIFF_INSERT, text: 'xyz'},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: '123'},
        ]; 
        const [text1, text2] = diff_rebuildtexts(diffs);
        expect(text1).toBe('abc123');
        expect(text2).toBe('xyz123');
    });

    test("diff_commonPrefix should detect common prefixes", () => {
        expect(dmp.diff_commonPrefix("abc", "xyz")).toBe(0);
        expect(dmp.diff_commonPrefix("1234abcdef", "1234xyz")).toBe(4);
        expect(dmp.diff_commonPrefix("1234", "1234xyz")).toBe(4);
    });
    
    test("diff_commonSuffix should detect common suffixes", () => {
        expect(dmp.diff_commonSuffix("abc", "xyz")).toBe(0);
        expect(dmp.diff_commonSuffix("abcdef1234", "xyz1234")).toBe(4);
        expect(dmp.diff_commonSuffix("1234", "xyz1234")).toBe(4);
    });

    test("diff_commonOverlap should detect suffix/prefix overlap", () => {
        expect(dmp.diff_commonOverlap_("", "abcd")).toBe(0);
        expect(dmp.diff_commonOverlap_("abc", "abcd")).toBe(3);
        expect(dmp.diff_commonOverlap_("123456", "abcd")).toBe(0);
        expect(dmp.diff_commonOverlap_("123456xxx", "xxxabcd")).toBe(3);
        expect(dmp.diff_commonOverlap_("fi", "\ufb01i")).toBe(0);
    });

    test("diff_halfMatch should detect half matches", () => {
        dmp.Diff_Timeout = 1;
        expect(dmp.diff_halfMatch_("1234567890", "abcdef")).toBeNull();
        expect(dmp.diff_halfMatch_("12345", "23")).toBeNull();
        expect(dmp.diff_halfMatch_("1234567890", "a345678z")).toEqual(["12", "90", "a", "z", "345678"]);
        expect(dmp.diff_halfMatch_("a345678z", "1234567890")).toEqual(["a", "z", "12", "90", "345678"]);
        expect(dmp.diff_halfMatch_("abc56789z", "1234567890")).toEqual(["abc", "z", "1234", "0", "56789"]);
        expect(dmp.diff_halfMatch_("a23456xyz", "1234567890")).toEqual(["a", "xyz", "1", "7890", "23456"]);

        expect(dmp.diff_halfMatch_("121231234123451234123121", "a1234123451234z"))
            .toEqual(["12123", "123121", "a", "z", "1234123451234"]);
        expect(dmp.diff_halfMatch_("x-=-=-=-=-=-=-=-=-=-=-=-=", "xx-=-=-=-=-=-=-="))
            .toEqual(["", "-=-=-=-=-=", "x", "", "x-=-=-=-=-=-=-="]);
        expect(dmp.diff_halfMatch_("-=-=-=-=-=-=-=-=-=-=-=-=y", "-=-=-=-=-=-=-=yy"))
            .toEqual(["-=-=-=-=-=", "", "", "y", "-=-=-=-=-=-=-=y"]);
        expect(dmp.diff_halfMatch_("qHilloHelloHew", "xHelloHeHulloy"))
            .toEqual(["qHillo", "w", "x", "Hulloy", "HelloHe"]);

        dmp.Diff_Timeout = 0;
        expect(dmp.diff_halfMatch_("qHilloHelloHew", "xHelloHeHulloy")).toBeNull();
    });

    test("diff_linesToChars should convert lines to characters", () => {
        expect(dmp.diff_linesToChars_("alpha\nbeta\nalpha\n", "beta\nalpha\nbeta\n")).toEqual({
            chars1: "\x01\x02\x01",
            chars2: "\x02\x01\x02",
            lineArray: ["", "alpha\n", "beta\n"],
        });
        expect(dmp.diff_linesToChars_("alpha\r\nbeta\r\n\r\n\r\n", "")).toEqual({
            chars1: "\x01\x02\x03\x03",
            chars2: "",
            lineArray: ["", "alpha\r\n", "beta\r\n", "\r\n"],
        });
        expect(dmp.diff_linesToChars_("a", "b")).toEqual({
            chars1: "\x01",
            chars2: "\x02",
            lineArray: ["", "a", "b"],
        });

        let n = 300;
        let lineList = [];
        let charList = [];
        for (let i = 1; i < n + 1; i++) {
            lineList[i - 1] = i + '\n';
            charList[i - 1] = String.fromCharCode(i);
        }
        expect(n).toBe(lineList.length);
        let lines = lineList.join('');
        let chars = charList.join('');
        expect(n).toBe(chars.length);
        lineList.unshift('');
        expect(dmp.diff_linesToChars_(lines, '')).toEqual({chars1: chars, chars2: '', lineArray: lineList});
    });

    test("diff_charsToLines should convert characters back to lines", () => {
        let diffs: Diff[] = [
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "\x01\x02\x01"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "\x02\x01\x02"},
        ]
        dmp.diff_charsToLines_(diffs, ["", "alpha\n", "beta\n"]);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "alpha\nbeta\nalpha\n"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "beta\nalpha\nbeta\n"},
        ]);

        let n = 300;
        let lineList = [];
        let charList = [];
        for (let i = 1; i < n + 1; i++) {
            lineList[i - 1] = i + '\n';
            charList[i - 1] = String.fromCharCode(i);
        }
        expect(n).toBe(lineList.length);
        let lines = lineList.join('');
        let chars = charList.join('');
        expect(n).toBe(chars.length);
        lineList.unshift('');
        diffs = [{operation: DiffMatchPatch.DIFF_DELETE, text: chars}];
        dmp.diff_charsToLines_(diffs, lineList);
        assertEquivalent([{operation: DiffMatchPatch.DIFF_DELETE, text: lines}], diffs);

        lineList = [];
        for (let i = 0; i < 66000; i++) {
            lineList[i] = i + '\n';
        }
        chars = lineList.join('');
        let results = dmp.diff_linesToChars_(chars, '');
        diffs = [{operation: DiffMatchPatch.DIFF_INSERT, text: results.chars1}];
        dmp.diff_charsToLines_(diffs, results.lineArray);
        expect(chars).toBe(diffs[0].text);
    });

    test("diff_cleanupMerge should merge equivalent differences", () => {
        let diffs: Diff[] = [];
        dmp.diff_cleanupMerge(diffs);
        expect(diffs).toEqual([]);

        diffs = [{
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "a"
        }, {
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "b"
        }, {
            operation: DiffMatchPatch.DIFF_INSERT,
            text: "c"
        }]
        dmp.diff_cleanupMerge(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "a"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "b"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "c"}
        ]);

        diffs = [{
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "a"
        }, {
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "b"
        }, {
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "c"
        }];
        dmp.diff_cleanupMerge(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "abc"},
        ]);

        diffs = [{
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "a"
        }, {
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "b"
        }, {
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "c"
        }];
        dmp.diff_cleanupMerge(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abc"},
        ]);

        diffs = [{
            operation: DiffMatchPatch.DIFF_INSERT,
            text: "a"
        }, {
            operation: DiffMatchPatch.DIFF_INSERT,
            text: "b"
        }, {
            operation: DiffMatchPatch.DIFF_INSERT,
            text: "c"
        }];
        dmp.diff_cleanupMerge(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_INSERT, text: "abc"},
        ]);

        diffs = [{
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "a"
        }, {
            operation: DiffMatchPatch.DIFF_INSERT,
            text: "b"
        }, {
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "c"
        }, {
            operation: DiffMatchPatch.DIFF_INSERT,
            text: "d"
        }, {
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "e"
        }, {
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "f"
        }];
        dmp.diff_cleanupMerge(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "ac"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "bd"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "ef"},
        ]);

        diffs = [{
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "a"
        }, {
            operation: DiffMatchPatch.DIFF_INSERT,
            text: "abc"
        }, {
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "dc"
        }];
        dmp.diff_cleanupMerge(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "a"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "d"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "b"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "c"},
        ]);

//   // Prefix and suffix detection with equalities.
//   diffs = [[DIFF_EQUAL, 'x'], [DIFF_DELETE, 'a'], [DIFF_INSERT, 'abc'], [DIFF_DELETE, 'dc'], [DIFF_EQUAL, 'y']];
//   dmp.diff_cleanupMerge(diffs);
//   assertEquivalent([[DIFF_EQUAL, 'xa'], [DIFF_DELETE, 'd'], [DIFF_INSERT, 'b'], [DIFF_EQUAL, 'cy']], diffs);
        diffs = [{
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "x"
        }, {
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "a"
        }, {
            operation: DiffMatchPatch.DIFF_INSERT,
            text: "abc"
        }, {
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "dc"
        }, {
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "y"
        }];
        dmp.diff_cleanupMerge(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "xa"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "d"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "b"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "cy"},
        ]);

        diffs = [{
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "a"
        }, {
            operation: DiffMatchPatch.DIFF_INSERT,
            text: "ba"
        }, {
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "c"
        }];
        dmp.diff_cleanupMerge(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_INSERT, text: "ab"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "ac"},
        ]);

        diffs = [{
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "c"
        }, {
            operation: DiffMatchPatch.DIFF_INSERT,
            text: "ab"
        }, {
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "a"
        }];
        dmp.diff_cleanupMerge(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "ca"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "ba"},
        ]);

        diffs = [{
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "a"
        }, {
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "b"
        }, {
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "c"
        }, {
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "ac"
        }, {
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "x"
        }];
        dmp.diff_cleanupMerge(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abc"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "acx"},
        ]);

        diffs = [{
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "x"
        }, {
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "ca"
        }, {
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "c"
        }, {
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "b"
        }, {
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "a"
        }];
        dmp.diff_cleanupMerge(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "xca"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "cba"},
        ]);

        diffs = [{
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "b"
        }, {
            operation: DiffMatchPatch.DIFF_INSERT,
            text: "ab"
        }, {
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "c"
        }];
        dmp.diff_cleanupMerge(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_INSERT, text: "a"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "bc"},
        ]);

        diffs = [{
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: ""
        }, {
            operation: DiffMatchPatch.DIFF_INSERT,
            text: "a"
        }, {
            operation: DiffMatchPatch.DIFF_EQUAL,
            text: "b"
        }];
        dmp.diff_cleanupMerge(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_INSERT, text: "a"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "b"},
        ]);

        diffs = [{
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "a"
        }, {
            operation: DiffMatchPatch.DIFF_INSERT,
            text: "abc"
        }, {
            operation: DiffMatchPatch.DIFF_DELETE,
            text: "dc"
        }];
        dmp.diff_cleanupMerge(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "a"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "d"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "b"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "c"}
        ]);
    });

    test("diff_cleanupSemanticLossless should refine diff boundaries", () => {
        let diffs: Diff[] = [];
        dmp.diff_cleanupSemanticLossless(diffs);
        expect(diffs).toEqual([]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "AAA\r\n\r\nBBB"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "\r\nDDD\r\n\r\nBBB"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "\r\nEEE"},
        ];
        dmp.diff_cleanupSemanticLossless(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "AAA\r\n\r\n"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "BBB\r\nDDD\r\n\r\n"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "BBB\r\nEEE"},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "AAA\r\nBBB"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: " DDD\r\nBBB"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: " EEE"},
        ];
        dmp.diff_cleanupSemanticLossless(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "AAA\r\n"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "BBB DDD\r\n"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "BBB EEE"},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "The c"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "ow and the c"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "at."},
        ];
        dmp.diff_cleanupSemanticLossless(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "The "},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "cow and the "},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "cat."},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "The-c"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "ow-and-the-c"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "at."},
        ];
        dmp.diff_cleanupSemanticLossless(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "The-"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "cow-and-the-"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "cat."},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "a"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "a"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "ax"},
        ];
        dmp.diff_cleanupSemanticLossless(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "a"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "aax"},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "xa"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "a"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "a"},
        ];
        dmp.diff_cleanupSemanticLossless(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "xaa"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "a"},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "The xxx. The "},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "zzz. The "},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "yyy."},
        ];
        dmp.diff_cleanupSemanticLossless(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "The xxx."},
            {operation: DiffMatchPatch.DIFF_INSERT, text: " The zzz."},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: " The yyy."},
        ]);
    });
    
    test("diff_cleanupSemantic should remove trivial equalities", () => {
        let diffs: Diff[] = [];
        dmp.diff_cleanupSemantic(diffs);
        expect(diffs).toEqual([]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_DELETE, text: "ab"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "cd"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "12"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "e"},
        ];
        dmp.diff_cleanupSemantic(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "ab"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "cd"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "12"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "e"},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abc"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "ABC"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "1234"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "wxyz"},
        ];
        dmp.diff_cleanupSemantic(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abc"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "ABC"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "1234"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "wxyz"},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_DELETE, text: "a"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "b"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "c"},
        ];
        dmp.diff_cleanupSemantic(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abc"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "b"},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_DELETE, text: "ab"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "cd"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "e"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "f"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "g"},
        ];
        dmp.diff_cleanupSemantic(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abcdef"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "cdfg"},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_INSERT, text: "1"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "A"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "B"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "2"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "_"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "1"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "A"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "B"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "2"},
        ];
        dmp.diff_cleanupSemantic(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "AB_AB"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "1A2_1A2"},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "The c"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "ow and the c"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "at."},
        ];
        dmp.diff_cleanupSemantic(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "The "},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "cow and the "},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "cat."},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abcxx"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "xxdef"},
        ];
        dmp.diff_cleanupSemantic(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abcxx"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "xxdef"},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abcxxx"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "xxxdef"},
        ];
        dmp.diff_cleanupSemantic(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abc"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "xxx"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "def"},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_DELETE, text: "xxxabc"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "defxxx"},
        ];
        dmp.diff_cleanupSemantic(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_INSERT, text: "def"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "xxx"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abc"},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abcd1212"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "1212efghi"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "----"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "A3"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "3BC"},
        ];
        dmp.diff_cleanupSemantic(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abcd"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "1212"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "efghi"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "----"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "A"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "3"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "BC"},
        ]);
    });
    
    test("diff_cleanupEfficiency should optimize trivial edits", () => {
        dmp.Diff_EditCost = 4;

        let diffs: Diff[] = [];
        dmp.diff_cleanupEfficiency(diffs);
        expect(diffs).toEqual([]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_DELETE, text: "ab"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "12"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "wxyz"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "cd"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "34"},
        ];
        dmp.diff_cleanupEfficiency(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "ab"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "12"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "wxyz"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "cd"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "34"},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_DELETE, text: "ab"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "12"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "xyz"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "cd"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "34"},
        ];
        dmp.diff_cleanupEfficiency(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abxyzcd"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "12xyz34"},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_INSERT, text: "12"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "x"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "cd"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "34"},
        ];
        dmp.diff_cleanupEfficiency(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "xcd"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "12x34"},
        ]);

        diffs = [
            {operation: DiffMatchPatch.DIFF_DELETE, text: "ab"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "12"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "xy"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "34"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "z"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "cd"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "56"},
        ];
        dmp.diff_cleanupEfficiency(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abxyzcd"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "12xy34z56"},
        ]);

        dmp.Diff_EditCost = 5;
        diffs = [
            {operation: DiffMatchPatch.DIFF_DELETE, text: "ab"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "12"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "wxyz"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "cd"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "34"},
        ];
        dmp.diff_cleanupEfficiency(diffs);
        expect(diffs).toEqual([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abwxyzcd"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "12wxyz34"},
        ]);
        dmp.Diff_EditCost = 4;
    });
    
    test("diff_prettyHtml should generate HTML formatted diffs", () => {
        const diffs: Diff[] = [
        {operation: DiffMatchPatch.DIFF_EQUAL, text: "a\n"},
        {operation: DiffMatchPatch.DIFF_DELETE, text: "<B>b</B>"},
        {operation: DiffMatchPatch.DIFF_INSERT, text: "c&d"},
        ];
        expect(dmp.diff_prettyHtml(diffs)).toBe(
        '<span>a&para;<br></span><del style="background:#ffe6e6;">&lt;B&gt;b&lt;/B&gt;</del><ins style="background:#e6ffe6;">c&amp;d</ins>'
        );
    });
    
    test("diff_text should reconstruct original texts", () => {
        const diffs: Diff[] = [
        {operation: DiffMatchPatch.DIFF_EQUAL, text: "jump"},
        {operation: DiffMatchPatch.DIFF_DELETE, text: "s"},
        {operation: DiffMatchPatch.DIFF_INSERT, text: "ed"},
        {operation: DiffMatchPatch.DIFF_EQUAL, text: " over "},
        {operation: DiffMatchPatch.DIFF_DELETE, text: "the"},
        {operation: DiffMatchPatch.DIFF_INSERT, text: "a"},
        {operation: DiffMatchPatch.DIFF_EQUAL, text: " lazy"},
        ];
        expect(dmp.diff_text1(diffs)).toBe("jumps over the lazy");
        expect(dmp.diff_text2(diffs)).toBe("jumped over a lazy");
    });

    test("diff_toDelta and diff_fromDelta should correctly encode and decode diffs", () => {
        let diffs: Diff[] = [
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "jump"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "s"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "ed"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: " over "},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "the"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "a"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: " lazy"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "old dog"},
        ];
        let text1 = dmp.diff_text1(diffs);
        expect(text1).toBe("jumps over the lazy");

        let delta = dmp.diff_toDelta(diffs);
        expect(delta).toBe("=4\t-1\t+ed\t=6\t-3\t+a\t=5\t+old dog");

        expect(dmp.diff_fromDelta(text1, delta)).toEqual(diffs);

        diffs = [
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "\u0680 \x00 \t %"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "\u0681 \x01 \n ^"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "\u0682 \x02 \\ |"},
        ];
        text1 = dmp.diff_text1(diffs);
        expect(text1).toBe("\u0680 \x00 \t %\u0681 \x01 \n ^");

        delta = dmp.diff_toDelta(diffs);
        expect(delta).toBe("=7\t-7\t+%DA%82 %02 %5C %7C");

        expect(dmp.diff_fromDelta(text1, delta)).toEqual(diffs);

        diffs = [
            {operation: DiffMatchPatch.DIFF_INSERT, text: "A-Z a-z 0-9 - _ . ! ~ * \' ( ) ; / ? : @ & = + $ , # "},
        ];
        let text2 = dmp.diff_text2(diffs);
        expect(text2).toBe("A-Z a-z 0-9 - _ . ! ~ * \' ( ) ; / ? : @ & = + $ , # ");

        delta = dmp.diff_toDelta(diffs);
        expect(delta).toBe("+A-Z a-z 0-9 - _ . ! ~ * \' ( ) ; / ? : @ & = + $ , # ");

        expect(dmp.diff_fromDelta('', delta)).toEqual(diffs);

        // 160 kb string.
        let a = 'abcdefghij';
        for (let i = 0; i < 14; i++) {
            a += a;
        }
        diffs = [{operation: DiffMatchPatch.DIFF_INSERT, text: a}];
        delta = dmp.diff_toDelta(diffs);
        expect(delta).toBe('+' + a);

        // Convert delta string into a diff.
        expect(dmp.diff_fromDelta('', delta)).toEqual(diffs);
    });

    test("diff_fromDelta should throw errors for invalid inputs", () => {
        const diffs: Diff[] = [
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "jump"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "s"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "ed"},
        ];
        const text1 = dmp.diff_text1(diffs);
        const delta = dmp.diff_toDelta(diffs);

        expect(() => dmp.diff_fromDelta(text1 + "x", delta)).toThrow();
        expect(() => dmp.diff_fromDelta(text1.substring(1), delta)).toThrow();
        expect(() => dmp.diff_fromDelta("", "+%c3%xy")).toThrow();
        });

        test("diff_xIndex should correctly translate positions", () => {
        expect(dmp.diff_xIndex([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "a"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "1234"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "xyz"}
        ], 2)).toBe(5);
        expect(dmp.diff_xIndex([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "a"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "1234"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "xyz"}
        ], 3)).toBe(1);
        });

        test("diff_levenshtein should calculate correct distances", () => {
        expect(dmp.diff_levenshtein([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abc"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "1234"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "xyz"}
        ])).toBe(4);
        expect(dmp.diff_levenshtein([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "xyz"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abc"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "1234"}
        ])).toBe(4);
        expect(dmp.diff_levenshtein([
            {operation: DiffMatchPatch.DIFF_DELETE, text: "abc"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "xyz"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "1234"}
        ])).toBe(7);
        });

        test("diff_bisect_ should correctly compute minimal diffs", () => {
            const a = "cat";
            const b = "map";

            expect(dmp.diff_bisect_(a, b, Number.MAX_VALUE)).toEqual([
                {operation: DiffMatchPatch.DIFF_DELETE, text: "c"},
                {operation: DiffMatchPatch.DIFF_INSERT, text: "m"},
                {operation: DiffMatchPatch.DIFF_EQUAL, text: "a"},
                {operation: DiffMatchPatch.DIFF_DELETE, text: "t"},
                {operation: DiffMatchPatch.DIFF_INSERT, text: "p"},
            ]);

            expect(dmp.diff_bisect_(a, b, 0)).toEqual([
                {operation: DiffMatchPatch.DIFF_DELETE, text: "cat"},
                {operation: DiffMatchPatch.DIFF_INSERT, text: "map"},
            ]);
        });

    test("diff_main should correctly compute diffs", () => {
        expect(dmp.diff_main("", "", false)).toEqual([]);

        expect(dmp.diff_main("abc", "abc", false)).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "abc"}
        ]);

        expect(dmp.diff_main("abc", "ab123c", false)).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "ab"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "123"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "c"},
        ]);

        expect(dmp.diff_main("a123bc", "abc", false)).toEqual([
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "a"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "123"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "bc"},
        ]);
    });

    test("diff_main should handle complex cases", () => {
    dmp.Diff_Timeout = 0;
    
    expect(dmp.diff_main("a", "b", false)).toEqual([
        {operation: DiffMatchPatch.DIFF_DELETE, text: "a"},
        {operation: DiffMatchPatch.DIFF_INSERT, text: "b"},
    ]);

    expect(dmp.diff_main("Apples are a fruit.", "Bananas are also fruit.", false)).toEqual([
        {operation: DiffMatchPatch.DIFF_DELETE, text: "Apple"},
        {operation: DiffMatchPatch.DIFF_INSERT, text: "Banana"},
        {operation: DiffMatchPatch.DIFF_EQUAL, text: "s are a"},
        {operation: DiffMatchPatch.DIFF_INSERT, text: "lso"},
        {operation: DiffMatchPatch.DIFF_EQUAL, text: " fruit."},
    ]);
    });

    test("diff_main should timeout on large inputs", () => {
        dmp.Diff_Timeout = 0.1; // 100ms timeout

        let a = "`Twas brillig, and the slithy toves\nDid gyre and gimble in the wabe:\n";
        let b = "I am the very model of a modern major general,\nI have information vegetable, animal, and mineral,\n";

        for (let i = 0; i < 10; i++) {
            a += a;
            b += b;
        }

        const startTime = Date.now();
        dmp.diff_main(a, b);
        const endTime = Date.now();

        expect(endTime - startTime).toBeGreaterThanOrEqual(dmp.Diff_Timeout * 1000);
        expect(endTime - startTime).toBeLessThan(dmp.Diff_Timeout * 1000 * 2);
        
        dmp.Diff_Timeout = 0;
    });

    test("match_alphabet_ should compute character bitmasks", () => {
        expect(dmp.match_alphabet_("abc")).toEqual({ a: 4, b: 2, c: 1 });
        expect(dmp.match_alphabet_("abcaba")).toEqual({ a: 37, b: 18, c: 8 });
    });

    test("match_bitap_ should perform bitap search", () => {
        dmp.Match_Distance = 100;
        dmp.Match_Threshold = 0.5;

        expect(dmp.match_bitap_("abcdefghijk", "fgh", 5)).toBe(5);
        expect(dmp.match_bitap_("abcdefghijk", "fgh", 0)).toBe(5);
        expect(dmp.match_bitap_("abcdefghijk", "efxhi", 0)).toBe(4);
        expect(dmp.match_bitap_("abcdefghijk", "cdefxyhijk", 5)).toBe(2);
        expect(dmp.match_bitap_("abcdefghijk", "bxy", 1)).toBe(-1);
    });

    test("match_main should find matches", () => {
        expect(dmp.match_main("abcdef", "abcdef", 1000)).toBe(0);
        expect(dmp.match_main("", "abcdef", 1)).toBe(-1);
        expect(dmp.match_main("abcdef", "", 3)).toBe(3);
        expect(dmp.match_main("abcdef", "de", 3)).toBe(3);
        expect(dmp.match_main("abcdef", "defy", 4)).toBe(3);
        expect(dmp.match_main("abcdef", "abcdefy", 0)).toBe(0);
    });

    test("diff_main should throw errors on null input", () => {
        expect(() => dmp.diff_main(null as unknown as string, null as unknown as string)).toThrow();
    });

    test("match_main should throw errors on null input", () => {
        expect(() => dmp.match_main(null as unknown as string, null as unknown as string, 0)).toThrow();
    });

    test("patch_obj should generate correct string representation", () => {
        const p = new PatchObject();
        p.start1 = 20;
        p.start2 = 21;
        p.length1 = 18;
        p.length2 = 17;
        p.diffs = [
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "jump"},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "s"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "ed"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: " over "},
            {operation: DiffMatchPatch.DIFF_DELETE, text: "the"},
            {operation: DiffMatchPatch.DIFF_INSERT, text: "a"},
            {operation: DiffMatchPatch.DIFF_EQUAL, text: "\nlaz"},
        ];
        expect(p.toString()).toBe("@@ -21,18 +22,17 @@\n jump\n-s\n+ed\n  over \n-the\n+a\n %0Alaz\n");
    });

    test("patch_fromText should correctly parse patch strings", () => {
        expect(dmp.patch_fromText("")).toEqual([]);
    
        const strp = "@@ -21,18 +22,17 @@\n jump\n-s\n+ed\n  over \n-the\n+a\n %0Alaz\n";
        expect(dmp.patch_fromText(strp)[0].toString()).toBe(strp);
    
        expect(() => dmp.patch_fromText("Bad\nPatch\n")).toThrow();
    });

    test("patch_toText should generate correct patch text", () => {
        const strp = "@@ -21,18 +22,17 @@\n jump\n-s\n+ed\n  over \n-the\n+a\n  laz\n";
        const p = dmp.patch_fromText(strp);
        expect(dmp.patch_toText(p)).toBe(strp);
    });

    test("patch_make should create correct patches", () => {
        expect(dmp.patch_toText(dmp.patch_make("", ""))).toBe("");
    
        const text1 = "The quick brown fox jumps over the lazy dog.";
        const text2 = "That quick brown fox jumped over a lazy dog.";
        const expectedPatch = "@@ -1,8 +1,7 @@\n Th\n-at\n+e\n  qui\n@@ -21,17 +21,18 @@\n jump\n-ed\n+s\n  over \n-a\n+the\n  laz\n";
    
        const patches = dmp.patch_make(text2, text1);
        expect(dmp.patch_toText(patches)).toBe(expectedPatch);
    });

    test("patch_apply should apply patches correctly", () => {
        dmp.Match_Distance = 1000;
        dmp.Match_Threshold = 0.5;
        dmp.Patch_DeleteThreshold = 0.5;
    
        const text1 = "The quick brown fox jumps over the lazy dog.";
        const text2 = "That quick brown fox jumped over a lazy dog.";
        const patches = dmp.patch_make(text1, text2);
    
        let results = dmp.patch_apply(patches, text1);
        expect(results).toEqual(["That quick brown fox jumped over a lazy dog.", [true, true]]);
    
        results = dmp.patch_apply(patches, "The quick red rabbit jumps over the tired tiger.");
        expect(results).toEqual(["That quick red rabbit jumped over a tired tiger.", [true, true]]);
    
        results = dmp.patch_apply(patches, "I am the very model of a modern major general.");
        expect(results).toEqual(["I am the very model of a modern major general.", [false, false]]);
    });

    test("patch_splitMax should correctly split large patches", () => {
        const patches = dmp.patch_make(
            "abcdefghijklmnopqrstuvwxyz01234567890",
            "XabXcdXefXghXijXklXmnXopXqrXstXuvXwxXyzX01X23X45X67X89X0"
        );
        dmp.patch_splitMax(patches);
    
        expect(dmp.patch_toText(patches)).toBe(
            "@@ -1,32 +1,46 @@\n+X\n ab\n+X\n cd\n+X\n ef\n+X\n gh\n+X\n ij\n+X\n kl\n+X\n mn\n+X\n op\n+X\n qr\n+X\n st\n+X\n uv\n+X\n wx\n+X\n yz\n+X\n 012345\n@@ -25,13 +39,18 @@\n zX01\n+X\n 23\n+X\n 45\n+X\n 67\n+X\n 89\n+X\n 0\n"
        );
    });

    test("patch_addPadding should correctly add padding to patches", () => {
        let patches = dmp.patch_make("", "test");
        dmp.patch_addPadding(patches);
        expect(dmp.patch_toText(patches)).toBe("@@ -1,8 +1,12 @@\n %01%02%03%04\n+test\n %01%02%03%04\n");
    
        patches = dmp.patch_make("XY", "XtestY");
        dmp.patch_addPadding(patches);
        expect(dmp.patch_toText(patches)).toBe("@@ -2,8 +2,12 @@\n %02%03%04X\n+test\n Y%01%02%03\n");
    });

    test("patch_make should throw errors on invalid input", () => {
        expect(() => dmp.patch_make(null as unknown as string)).toThrow();
    });
});