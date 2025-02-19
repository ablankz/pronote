import DiffMatchPatch, { Diff } from "./diff";

export const DiffTypes = {
    LineByLine: "line",
    WordByWord: "word"
} as const;

export type DiffType = typeof DiffTypes[keyof typeof DiffTypes];

export const Opes = {
    Insert: 1,
    Delete: -1,
    Keep: 0
} as const;

export type Ope = typeof Opes[keyof typeof Opes];

export interface BlockDiff {
    ope: Ope;
    text: string;
    newLineNumber: number;
    oldLineNumber: number;
}

export interface Fragment {
    text: string;
    changed: boolean;
}

export interface Line {
    ope: Ope;
    newLineNumber: number;
    oldLineNumber: number;
    fragments: Fragment[];
}

export interface Result {
    lines: Line[];
}

export class TextDiff {
    static calcBlockDiff(oldText: string, newText: string): BlockDiff[] {
        const dmp = new DiffMatchPatch();
        const {chars1, chars2, lineArray} = dmp.diff_linesToChars_(oldText, newText);
        const diffs = dmp.diff_main(chars1, chars2, true);
        dmp.diff_charsToLines_(diffs, lineArray);
        
        let result: BlockDiff[] = [];
        let newLineNum = 1;
        let oldLineNum = 1;

        diffs.forEach(diff => {
            let block: BlockDiff = {
                ope: diff.operation as Ope,
                text: diff.text,
                newLineNumber: -1,
                oldLineNumber: -1
            };

            const inc = (diff.text.match(/\n/g) || []).length;

            switch (block.ope) {
                case Opes.Insert:
                    block.newLineNumber = newLineNum;
                    newLineNum += inc;
                    break;
                case Opes.Delete:
                    block.oldLineNumber = oldLineNum;
                    oldLineNum += inc;
                    break;
                case Opes.Keep:
                    block.newLineNumber = newLineNum;
                    block.oldLineNumber = oldLineNum;
                    newLineNum += inc;
                    oldLineNum += inc;
                    break;
            }

            result.push(block);
        });

        return result;
    }

    static lineDiff(oldText: string, newText: string): Result {
        let result: Result = { lines: [] };
        const blocks = this.calcBlockDiff(oldText, newText);

        blocks.forEach(block => {
            const lines = block.text.split("\n");

            lines.slice(0, -1).forEach((line, i) => {
                let lineObj: Line = {
                    ope: block.ope,
                    fragments: [{ text: line, changed: block.ope !== Opes.Keep }],
                    oldLineNumber: block.oldLineNumber > 0 ? block.oldLineNumber + i : -1,
                    newLineNumber: block.newLineNumber > 0 ? block.newLineNumber + i : -1
                };

                result.lines.push(lineObj);
            });
        });

        return result;
    }

    static wordDiff(oldText: string, newText: string): Result {
        let result: Result = { lines: [] };
        const blocks = this.calcBlockDiff(oldText, newText);
        const dmp = new DiffMatchPatch();

        for (let i = 0; i < blocks.length; i++) {
            if (i < blocks.length - 1 && blocks[i].ope === Opes.Delete && blocks[i + 1].ope === Opes.Insert) {
                let diffs = dmp.diff_main(blocks[i].text, blocks[i + 1].text, true);

                diffs = this.splitDiffsByNewLine(diffs);

                let oldLineNumber = blocks[i].oldLineNumber;
                let newLineNumber = blocks[i + 1].newLineNumber;
                let fragments: Fragment[] = [];

                diffs.forEach(diff => {
                    if (diff.operation === Opes.Insert) return;
                    const hasNewLine = diff.text.endsWith("\n");
                    fragments.push({ changed: diff.operation === Opes.Delete, text: diff.text.trimEnd() });

                    if (hasNewLine) {
                        result.lines.push({
                            ope: Opes.Delete,
                            newLineNumber: -1,
                            oldLineNumber,
                            fragments
                        });
                        fragments = [];
                        oldLineNumber++;
                    }
                });

                fragments = [];
                oldLineNumber = blocks[i + 1].oldLineNumber;
                newLineNumber = blocks[i + 1].newLineNumber;

                diffs.forEach(diff => {
                    if (diff.operation === Opes.Delete) return;
                    const hasNewLine = diff.text.endsWith("\n");
                    fragments.push({ changed: diff.operation === Opes.Insert, text: diff.text.trimEnd() });

                    if (hasNewLine) {
                        result.lines.push({
                            ope: Opes.Insert,
                            newLineNumber,
                            oldLineNumber: -1,
                            fragments
                        });
                        fragments = [];
                        newLineNumber++;
                    }
                });

                i++;
            } else {
                const block = blocks[i];
                const lines = block.text.split("\n");

                lines.slice(0, -1).forEach((line, index) => {
                    result.lines.push({
                        ope: block.ope,
                        fragments: [{ text: line, changed: block.ope !== Opes.Keep }],
                        oldLineNumber: block.oldLineNumber > 0 ? block.oldLineNumber + index : -1,
                        newLineNumber: block.newLineNumber > 0 ? block.newLineNumber + index : -1
                    });
                });
            }
        }

        return result;
    }

    static splitDiffsByNewLine(diffs: Diff[]): Diff[] {
        let result: Diff[] = [];

        diffs.forEach(diff => {
            const texts = diff.text.split("\n");
            texts.forEach((text, index) => {
                if (index !== texts.length - 1) text += "\n";
                if (text !== "") {
                    result.push({ ...diff, text });
                }
            });
        });

        return result;
    }

    static diff(oldText: string, newText: string, diffType: DiffType): Result {
        return diffType === DiffTypes.LineByLine ? this.lineDiff(oldText, newText) : this.wordDiff(oldText, newText);
    }
}
