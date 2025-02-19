import { TextDiff, DiffTypes, Result, Opes } from "../textdiff";
function dumpForTest(result: Result): string {
    return result.lines.map(line => {
        let prefix = "";
        switch (line.ope) {
            case Opes.Insert: prefix = "+ "; break;
            case Opes.Delete: prefix = "- "; break;
            case Opes.Keep: prefix = "  "; break;
        }

        let text = line.fragments.map(f => (f.changed ? `[${f.text}]` : f.text)).join("");
        return `${prefix}${text}`;
    }).join("\n");
}

// describe("TextDiff - Block Diff Tests", () => {

//     /** 🧪 `calcBlockDiff` のテスト */
//     test("should detect line-based block differences", () => {
//         const oldText = "abc\ndef\n";
//         const newText = "abc\nghi\n";

//         const expectedDump = `  abc
// - [def]
// + [ghi]`;

//         const result = TextDiff.diff(oldText, newText, DiffTypes.LineByLine);
//         expect(dumpForTest(result)).toEqual(expectedDump);
//     });

//     test("should detect multiple line changes", () => {
//         const oldText = "abc\ndef\nghi\n";
//         const newText = "abc\ndef\nghj\n";

//         const expectedDump = `  abc
//   def
// - [ghi]
// + [ghj]`;

//         const result = TextDiff.diff(oldText, newText, DiffTypes.LineByLine);
//         expect(dumpForTest(result)).toEqual(expectedDump);
//     });

// });

describe("TextDiff - Line and Word Diff Tests", () => {

//     /** 🧪 `lineDiff` のテスト */
//     test("should detect line removal", () => {
//         const oldText = "abc\ndef\n";
//         const newText = "abc\n";

//         const expectedDump = `  abc
// - [def]`;

//         const result = TextDiff.diff(oldText, newText, DiffTypes.LineByLine);
//         expect(dumpForTest(result)).toEqual(expectedDump);
//     });

//     test("should detect line insertion", () => {
//         const oldText = "abc\n";
//         const newText = "abc\ndef\n";

//         const expectedDump = `  abc
// + [def]`;

//         const result = TextDiff.diff(oldText, newText, DiffTypes.LineByLine);
//         expect(dumpForTest(result)).toEqual(expectedDump);
//     });

//     test("should detect line modification", () => {
//         const oldText = "abc\ndef\n";
//         const newText = "abc\ndeg\n";

//         const expectedDump = `  abc
// - [def]
// + [deg]`;

//         const result = TextDiff.diff(oldText, newText, DiffTypes.LineByLine);
//         expect(dumpForTest(result)).toEqual(expectedDump);
//     });

//     /** 🧪 `wordDiff` のテスト */
//     test("should detect word-level differences (GitHub style)", () => {
//         const oldText = "abc\ndef\n";
//         const newText = "abc\ndeg\n";

//         const expectedDump = `  abc
// - de[f]
// + de[g]`;

//         const result = TextDiff.diff(oldText, newText, DiffTypes.WordByWord);
//         expect(dumpForTest(result)).toEqual(expectedDump);
//     });

    test("should detect multi-line word differences", () => {
        const oldText = "abc\ndef\nghi\n";
        const newText = "abc\ndeg\nghj\n";

        const expectedDump = `  abc
- de[f]
- gh[i]
+ de[g]
+ gh[j]`;

        const result = TextDiff.diff(oldText, newText, DiffTypes.WordByWord);
        expect(dumpForTest(result)).toEqual(expectedDump);
    });

});