export class Diff {
    constructor(public operation: number, public text: string) {}

    // length = 2;
    toString() {
        return this.operation + ',' + this.text;
    }
};

export class PatchObject {
    diffs: Diff[] = [];
    start1: number | null = null;
    start2: number | null = null;
    length1 = 0;
    length2 = 0;       

    toString(): string {
        let coords1: string, coords2: string;
        if (this.length1 === 0) {
            coords1 = this.start1 + ',0';
        } else if (this.length1 === 1) {
            coords1 = ((this.start1 || 0) + 1).toString();
        } else {
            coords1 = (this.start1 || 0) + 1 + ',' + this.length1;
        }

        if (this.length2 === 0) {
            coords2 = this.start2 + ',0';
        } else if (this.length2 === 1) {
            coords2 = ((this.start2 || 0) + 1).toString();
        } else {
            coords2 = (this.start2 || 0) + 1 + ',' + this.length2;
        }

        let text = ['@@ -' + coords1 + ' +' + coords2 + ' @@\n'];
        let op: string;
        for (let x = 0; x < this.diffs.length; x++) {
            switch (this.diffs[x].operation) {
                case DiffMatchPatch.DIFF_INSERT:
                    op = '+';
                    break;
                case DiffMatchPatch.DIFF_DELETE:
                    op = '-';
                    break;
                case DiffMatchPatch.DIFF_EQUAL:
                    op = ' ';
                    break;
                default:
                    throw new Error('Invalid operation in diff object: ' + this.diffs[x].operation);
            }
            text[x + 1] = op + encodeURI(this.diffs[x].text) + '\n';
        }

        return text.join('').replace(/%20/g, ' ');
    }
}

class DiffMatchPatch {
    Diff_Timeout = 1.0;
    Diff_EditCost = 4;
    Match_Threshold = 0.5;
    Match_Distance = 1000;
    Patch_DeleteThreshold = 0.5;
    Patch_Margin = 4;
    Match_MaxBits = 32;

    // Define some regex patterns for matching boundaries.
    nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/;
    whitespaceRegex_ = /\s/;
    linebreakRegex_ = /[\r\n]/;
    blanklineEndRegex_ = /\n\r?\n$/;
    blanklineStartRegex_ = /^\r?\n\r?\n/;

    static DIFF_DELETE = -1;
    static DIFF_INSERT = 1;
    static DIFF_EQUAL = 0;

    constructor() {
    }

    patch_fromText(textline: string): PatchObject[] {
        let patches: PatchObject[] = [];
        if (!textline) {
            return patches;
        }
        let text = textline.split('\n');
        let textPointer = 0;
        let patchHeader = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;
        while (textPointer < text.length) {
            let m = text[textPointer].match(patchHeader);
            if (!m) {
                throw new Error('Invalid patch string: ' + text[textPointer]);
            }
            let patch = new PatchObject();
            patches.push(patch);
            patch.start1 = parseInt(m[1], 10);
            if (m[2] === '') {
                patch.start1--;
                patch.length1 = 1;
            } else if (m[2] == '0') {
                patch.length1 = 0;
            } else {
                patch.start1--;
                patch.length1 = parseInt(m[2], 10);
            }

            patch.start2 = parseInt(m[3], 10);
            if (m[4] === '') {
                patch.start2--;
                patch.length2 = 1;
            } else if (m[4] == '0') {
                patch.length2 = 0;
            } else {
                patch.start2--;
                patch.length2 = parseInt(m[4], 10);
            }
            textPointer++;

            while (textPointer < text.length) {
                let sign = text[textPointer].charAt(0);
                let line;
                try {
                    line = decodeURI(text[textPointer].substring(1));
                } catch (ex) {
                    // Malformed URI sequence.
                    throw new Error('Illegal escape in patch_fromText: ' + line);
                }
                if (sign == '-') {
                    // Deletion.
                    patch.diffs.push(new Diff(DiffMatchPatch.DIFF_DELETE, line));
                } else if (sign == '+') {
                    // Insertion.
                    patch.diffs.push(new Diff(DiffMatchPatch.DIFF_INSERT, line));
                } else if (sign == ' ') {
                    // Minor equality.
                    patch.diffs.push(new Diff(DiffMatchPatch.DIFF_EQUAL, line));
                } else if (sign == '@') {
                    // Start of next patch.
                    break;
                } else if (sign === '') {
                    // Blank line?  Whatever.
                } else {
                    // WTF?
                    throw new Error('Invalid patch mode "' + sign + '" in: ' + line);
                }
                textPointer++;
        }
        }
        return patches;
    }

    /**
     * Take a list of patches and return a textual representation.
     * @param {!Array.<!PatchObject>} patches Array of Patch objects.
     * @return {string} Text representation of patches.
     */
    patch_toText(patches: PatchObject[]): string {
        let text: PatchObject[] = [];
        for (let x = 0; x < patches.length; x++) {
            text[x] = patches[x];
        }
        return text.join('');
    };

    patch_splitMax(patches: PatchObject[]): void {
        let patch_size = this.Match_MaxBits;
        for (let x = 0; x < patches.length; x++) {
            if (patches[x].length1 <= patch_size) {
                continue;
            }
            let bigpatch = patches[x];
            // Remove the big old patch.
            patches.splice(x--, 1);
            let start1 = bigpatch.start1 || 0;
            let start2 = bigpatch.start2 || 0;
            let precontext = '';
            while (bigpatch.diffs.length !== 0) {
                // Create one of several smaller patches.
                let patch = new PatchObject();
                let empty = true;
                patch.start1 = start1 - precontext.length;
                patch.start2 = start2 - precontext.length;
                if (precontext !== '') {
                    patch.length1 = patch.length2 = precontext.length;
                    patch.diffs.push(new Diff(DiffMatchPatch.DIFF_EQUAL, precontext));
                }
                while (bigpatch.diffs.length !== 0 &&
                        patch.length1 < patch_size - this.Patch_Margin) {
                    let diff_type = bigpatch.diffs[0].operation;
                    let diff_text = bigpatch.diffs[0].text;
                    if (diff_type === DiffMatchPatch.DIFF_INSERT) {
                    // Insertions are harmless.
                    patch.length2 += diff_text.length;
                    start2 += diff_text.length;
                    patch.diffs.push(bigpatch.diffs.shift() || new Diff(diff_type, diff_text));
                    empty = false;
                    } else if (diff_type === DiffMatchPatch.DIFF_DELETE && patch.diffs.length == 1 &&
                                patch.diffs[0].operation == DiffMatchPatch.DIFF_EQUAL &&
                                diff_text.length > 2 * patch_size) {
                    // This is a large deletion.  Let it pass in one chunk.
                        patch.length1 += diff_text.length;
                        start1 += diff_text.length;
                        empty = false;
                        patch.diffs.push(new Diff(diff_type, diff_text));
                        bigpatch.diffs.shift();
                    } else {
                        // Deletion or equality.  Only take as much as we can stomach.
                        diff_text = diff_text.substring(0,
                            patch_size - patch.length1 - this.Patch_Margin);
                        patch.length1 += diff_text.length;
                        start1 += diff_text.length;
                        if (diff_type === DiffMatchPatch.DIFF_EQUAL) {
                            patch.length2 += diff_text.length;
                            start2 += diff_text.length;
                        } else {
                            empty = false;
                        }
                        patch.diffs.push(new Diff(diff_type, diff_text));
                        if (diff_text == bigpatch.diffs[0].text) {
                            bigpatch.diffs.shift();
                        } else {
                            bigpatch.diffs[0].text =
                                bigpatch.diffs[0].text.substring(diff_text.length);
                        }
                    }
                }
                // Compute the head context for the next patch.
                precontext = this.diff_text2(patch.diffs);
                precontext =
                    precontext.substring(precontext.length - this.Patch_Margin);
                // Append the end context for this patch.
                let postcontext = this.diff_text1(bigpatch.diffs)
                                        .substring(0, this.Patch_Margin);
                if (postcontext !== '') {
                    patch.length1 += postcontext.length;
                    patch.length2 += postcontext.length;
                    if (patch.diffs.length !== 0 &&
                        patch.diffs[patch.diffs.length - 1].operation === DiffMatchPatch.DIFF_EQUAL) {
                        patch.diffs[patch.diffs.length - 1].text += postcontext;
                    } else {
                        patch.diffs.push(new Diff(DiffMatchPatch.DIFF_EQUAL, postcontext));
                    }
                }
                if (!empty) {
                    patches.splice(++x, 0, patch);
                }
            }
        }
    };

    patch_addPadding(patches: PatchObject[]): string {
        let paddingLength = this.Patch_Margin;
        let nullPadding = '';
        for (let x = 1; x <= paddingLength; x++) {
            nullPadding += String.fromCharCode(x);
        }
        
        // Bump all the patches forward.
        for (let x = 0; x < patches.length; x++) {
            patches[x].start1 = (patches[x].start1 || 0) + paddingLength;
            patches[x].start2 = (patches[x].start2 || 0) + paddingLength;
        }
        
        // Add some padding on start of first diff.
        let patch = patches[0];
        let diffs = patch.diffs;
        if (diffs.length == 0 || diffs[0].operation != DiffMatchPatch.DIFF_EQUAL) {
            // Add nullPadding equality.
            diffs.unshift(new Diff(DiffMatchPatch.DIFF_EQUAL, nullPadding));
            patch.start1 = (patch.start1 || 0) - paddingLength;  // Should be 0.
            patch.start2 = (patch.start2 || 0) - paddingLength;  // Should be 0.
            patch.length1 += paddingLength;
            patch.length2 += paddingLength;
        } else if (paddingLength > diffs[0].text.length) {
            // Grow first equality.
            let extraLength = paddingLength - diffs[0].text.length;
            diffs[0].text = nullPadding.substring(diffs[0].text.length) + diffs[0].text;
            patch.start1 = (patch.start1 || 0) - extraLength;
            patch.start2 = (patch.start2 || 0) - extraLength;
            patch.length1 += extraLength;
            patch.length2 += extraLength;
        }
        
        // Add some padding on end of last diff.
        patch = patches[patches.length - 1];
        diffs = patch.diffs;
        if (diffs.length == 0 || diffs[diffs.length - 1].operation != DiffMatchPatch.DIFF_EQUAL) {
            // Add nullPadding equality.
            diffs.push(new Diff(DiffMatchPatch.DIFF_EQUAL, nullPadding));
            patch.length1 += paddingLength;
            patch.length2 += paddingLength;
        } else if (paddingLength > diffs[diffs.length - 1].text.length) {
            // Grow last equality.
            let extraLength = paddingLength - diffs[diffs.length - 1].text.length;
            diffs[diffs.length - 1].text += nullPadding.substring(0, extraLength);
            patch.length1 += extraLength;
            patch.length2 += extraLength;
        }
        
        return nullPadding;
    };

    patch_apply(patches: PatchObject[], text: string): [string, boolean[]] {
        if (patches.length == 0) {
            return [text, []];
        }
    
        // Deep copy the patches so that no changes are made to originals.
        patches = this.patch_deepCopy(patches);
    
        let nullPadding = this.patch_addPadding(patches);
        text = nullPadding + text + nullPadding;
    
        this.patch_splitMax(patches);
        // delta keeps track of the offset between the expected and actual location
        // of the previous patch.  If there are patches expected at positions 10 and
        // 20, but the first patch was found at 12, delta is 2 and the second patch
        // has an effective expected position of 22.
        let delta = 0;
        let results = [];
        for (let x = 0; x < patches.length; x++) {
        let expected_loc = (patches[x].start2 || 0) + delta;
        let text1 = this.diff_text1(patches[x].diffs);
        let start_loc;
        let end_loc = -1;
        if (text1.length > this.Match_MaxBits) {
                // patch_splitMax will only provide an oversized pattern in the case of
                // a monster delete.
                start_loc = this.match_main(text, text1.substring(0, this.Match_MaxBits),
                                            expected_loc);
                if (start_loc != -1) {
                end_loc = this.match_main(text,
                    text1.substring(text1.length - this.Match_MaxBits),
                    expected_loc + text1.length - this.Match_MaxBits);
                if (end_loc == -1 || start_loc >= end_loc) {
                    // Can't find valid trailing context.  Drop this patch.
                    start_loc = -1;
                }
                }
            } else {
                start_loc = this.match_main(text, text1, expected_loc);
            }
            if (start_loc == -1) {
                // No match found.  :(
                results[x] = false;
                // Subtract the delta for this failed patch from subsequent patches.
                delta -= patches[x].length2 - patches[x].length1;
            } else {
                // Found a match.  :)
                results[x] = true;
                delta = start_loc - expected_loc;
                let text2;
                if (end_loc == -1) {
                text2 = text.substring(start_loc, start_loc + text1.length);
                } else {
                text2 = text.substring(start_loc, end_loc + this.Match_MaxBits);
                }
                if (text1 == text2) {
                // Perfect match, just shove the replacement text in.
                text = text.substring(0, start_loc) +
                        this.diff_text2(patches[x].diffs) +
                        text.substring(start_loc + text1.length);
                } else {
                // Imperfect match.  Run a diff to get a framework of equivalent
                // indices.
                let diffs = this.diff_main(text1, text2, false);
                if (text1.length > this.Match_MaxBits &&
                    this.diff_levenshtein(diffs) / text1.length >
                    this.Patch_DeleteThreshold) {
                    // The end points match, but the content is unacceptably bad.
                    results[x] = false;
                } else {
                    this.diff_cleanupSemanticLossless(diffs);
                    let index1 = 0;
                    let index2 = 0;
                    for (let y = 0; y < patches[x].diffs.length; y++) {
                    let mod = patches[x].diffs[y];
                    if (mod.operation !== DiffMatchPatch.DIFF_EQUAL) {
                        index2 = this.diff_xIndex(diffs, index1);
                    }
                    if (mod.operation === DiffMatchPatch.DIFF_INSERT) {  // Insertion
                        text = text.substring(0, start_loc + index2) + mod.text +
                            text.substring(start_loc + index2);
                    } else if (mod.operation === DiffMatchPatch.DIFF_DELETE) {  // Deletion
                        text = text.substring(0, start_loc + index2) +
                            text.substring(start_loc + this.diff_xIndex(diffs,
                                index1 + mod.text.length));
                    }
                    if (mod.operation !== DiffMatchPatch.DIFF_DELETE) {
                        index1 += mod.text.length;
                    }
                    }
                }
                }
            }
        }
        // Strip the padding off.
        text = text.substring(nullPadding.length, text.length - nullPadding.length);
        return [text, results];
    };

    patch_deepCopy(patches: PatchObject[]): PatchObject[] {
        // Making deep copies is hard in JavaScript.
        let patchesCopy = [];
        for (let x = 0; x < patches.length; x++) {
            let patch = patches[x];
            let patchCopy = new PatchObject();
            patchCopy.diffs = [];
            for (let y = 0; y < patch.diffs.length; y++) {
                patchCopy.diffs[y] =
                    new Diff(patch.diffs[y].operation, patch.diffs[y].text);
            }
            patchCopy.start1 = patch.start1;
            patchCopy.start2 = patch.start2;
            patchCopy.length1 = patch.length1;
            patchCopy.length2 = patch.length2;
            patchesCopy[x] = patchCopy;
        }
        return patchesCopy;
    };

    patch_make(a: string, opt_b?: string | Diff[], opt_c?: string | Diff[]): PatchObject[] {
        let text1: string;
        let diffs: Diff[];
        if (typeof a == 'string' && typeof opt_b == 'string' &&
            typeof opt_c == 'undefined') {
            // Method 1: text1, text2
            // Compute diffs from text1 and text2.
            text1 = a;
            diffs = this.diff_main(text1, opt_b, true);
            if (diffs.length > 2) {
            this.diff_cleanupSemantic(diffs);
            this.diff_cleanupEfficiency(diffs);
            }
        } else if (a && typeof a == 'object' && typeof opt_b == 'undefined' &&
            typeof opt_c == 'undefined') {
            // Method 2: diffs
            // Compute text1 from diffs.
            diffs = a;
            text1 = this.diff_text1(diffs);
        } else if (typeof a == 'string' && opt_b && typeof opt_b == 'object' &&
            typeof opt_c == 'undefined') {
            // Method 3: text1, diffs
            text1 = a;
            diffs = opt_b
        } else if (typeof a == 'string' && typeof opt_b == 'string' &&
            opt_c && typeof opt_c == 'object') {
            // Method 4: text1, text2, diffs
            // text2 is not used.
            text1 = a;
            diffs = opt_c;
        } else {
            throw new Error('Unknown call format to patch_make.');
        }
        
        if (diffs.length === 0) {
            return [];  // Get rid of the null case.
        }
        let patches = [];
        let patch = new PatchObject();
        let patchDiffLength = 0;  // Keeping our own length let is faster in JS.
        let char_count1 = 0;  // Number of characters into the text1 string.
        let char_count2 = 0;  // Number of characters into the text2 string.
        // Start with text1 (prepatch_text) and apply the diffs until we arrive at
        // text2 (postpatch_text).  We recreate the patches one by one to determine
        // context info.
        let prepatch_text = text1;
        let postpatch_text = text1;
        for (let x = 0; x < diffs.length; x++) {
            let diff_type = diffs[x].operation;
            let diff_text = diffs[x].text;
        
            if (!patchDiffLength && diff_type !== DiffMatchPatch.DIFF_EQUAL) {
            // A new patch starts here.
            patch.start1 = char_count1;
            patch.start2 = char_count2;
            }
        
            switch (diff_type) {
            case DiffMatchPatch.DIFF_INSERT:
                patch.diffs[patchDiffLength++] = diffs[x];
                patch.length2 += diff_text.length;
                postpatch_text = postpatch_text.substring(0, char_count2) + diff_text +
                                postpatch_text.substring(char_count2);
                break;
            case DiffMatchPatch.DIFF_DELETE:
                patch.length1 += diff_text.length;
                patch.diffs[patchDiffLength++] = diffs[x];
                postpatch_text = postpatch_text.substring(0, char_count2) +
                                postpatch_text.substring(char_count2 +
                                    diff_text.length);
                break;
            case DiffMatchPatch.DIFF_EQUAL:
                if (diff_text.length <= 2 * this.Patch_Margin &&
                    patchDiffLength && diffs.length != x + 1) {
                // Small equality inside a patch.
                patch.diffs[patchDiffLength++] = diffs[x];
                patch.length1 += diff_text.length;
                patch.length2 += diff_text.length;
                } else if (diff_text.length >= 2 * this.Patch_Margin) {
                // Time for a new patch.
                if (patchDiffLength) {
                    this.patch_addContext_(patch, prepatch_text);
                    patches.push(patch);
                    patch = new PatchObject();
                    patchDiffLength = 0;
                    // Unlike Unidiff, our patch lists have a rolling context.
                    // https://github.com/google/diff-match-patch/wiki/Unidiff
                    // Update prepatch text & pos to reflect the application of the
                    // just completed patch.
                    prepatch_text = postpatch_text;
                    char_count1 = char_count2;
                }
                }
                break;
            }
        
            // Update the current character count.
            if (diff_type !== DiffMatchPatch.DIFF_INSERT) {
            char_count1 += diff_text.length;
            }
            if (diff_type !== DiffMatchPatch.DIFF_DELETE) {
            char_count2 += diff_text.length;
            }
        }
        // Pick up the leftover patch if not empty.
        if (patchDiffLength) {
            this.patch_addContext_(patch, prepatch_text);
            patches.push(patch);
        }
        
        return patches;
    };

    patch_addContext_(patch: PatchObject, text: string): void {
        if (text.length == 0) {
            return;
        }
        if (patch.start2 === null) {
            throw Error('patch not initialized');
        }
        let pattern = text.substring(patch.start2, patch.start2 + patch.length1);
        let padding = 0;
        
        // Look for the first and last matches of pattern in text.  If two different
        // matches are found, increase the pattern length.
        while (text.indexOf(pattern) != text.lastIndexOf(pattern) &&
                pattern.length < this.Match_MaxBits - this.Patch_Margin -
                this.Patch_Margin) {
            padding += this.Patch_Margin;
            pattern = text.substring(patch.start2 - padding,
                                    patch.start2 + patch.length1 + padding);
        }
        // Add one chunk for good luck.
        padding += this.Patch_Margin;
        
        // Add the prefix.
        let prefix = text.substring(patch.start2 - padding, patch.start2);
        if (prefix) {
            patch.diffs.unshift(new Diff(DiffMatchPatch.DIFF_EQUAL, prefix));
        }
        // Add the suffix.
        let suffix = text.substring(patch.start2 + patch.length1,
                                    patch.start2 + patch.length1 + padding);
        if (suffix) {
            patch.diffs.push(new Diff(DiffMatchPatch.DIFF_EQUAL, suffix));
        }
        
        // Roll back the start points.
        patch.start1 = (patch.start1 || 0) - prefix.length;
        patch.start2 = (patch.start2 || 0) - prefix.length;
        // Extend the lengths.
        patch.length1 += prefix.length + suffix.length;
        patch.length2 += prefix.length + suffix.length;
    };


    match_alphabet_(pattern: string): Record<string, number> {
        let s: Record<string, number> = {};
        for (let i = 0; i < pattern.length; i++) {
            s[pattern.charAt(i)] = 0;
        }
        for (let i = 0; i < pattern.length; i++) {
            s[pattern.charAt(i)] |= 1 << (pattern.length - i - 1);
        }
        return s;
    };

    match_bitap_(text: string, pattern: string, loc: number): number {
        if (pattern.length > this.Match_MaxBits) {
        throw new Error('Pattern too long for this browser.');
        }
    
        // Initialise the alphabet.
        let s = this.match_alphabet_(pattern);
    
        let dmp = this;  // 'this' becomes 'window' in a closure.
    
        function match_bitapScore_(e: number, x: number): number {
            let accuracy = e / pattern.length;
            let proximity = Math.abs(loc - x);
            if (!dmp.Match_Distance) {
                // Dodge divide by zero error.
                return proximity ? 1.0 : accuracy;
            }
            return accuracy + (proximity / dmp.Match_Distance);
        }
    
        // Highest score beyond which we give up.
        let score_threshold = this.Match_Threshold;
        // Is there a nearby exact match? (speedup)
        let best_loc = text.indexOf(pattern, loc);
        if (best_loc != -1) {
            score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
            // What about in the other direction? (speedup)
            best_loc = text.lastIndexOf(pattern, loc + pattern.length);
            if (best_loc != -1) {
                score_threshold =
                    Math.min(match_bitapScore_(0, best_loc), score_threshold);
            }
        }
    
        // Initialise the bit arrays.
        let matchmask = 1 << (pattern.length - 1);
        best_loc = -1;
    
        let bin_min, bin_mid;
        let bin_max = pattern.length + text.length;
        let last_rd: number[] = [];
        for (let d = 0; d < pattern.length; d++) {
            // Scan for the best match; each iteration allows for one more error.
            // Run a binary search to determine how far from 'loc' we can stray at this
            // error level.
            bin_min = 0;
            bin_mid = bin_max;
            while (bin_min < bin_mid) {
                if (match_bitapScore_(d, loc + bin_mid) <= score_threshold) {
                bin_min = bin_mid;
                } else {
                bin_max = bin_mid;
                }
                bin_mid = Math.floor((bin_max - bin_min) / 2 + bin_min);
            }
            // Use the result from this iteration as the maximum for the next.
            bin_max = bin_mid;
            let start = Math.max(1, loc - bin_mid + 1);
            let finish = Math.min(loc + bin_mid, text.length) + pattern.length;
        
            let rd = Array(finish + 2);
            rd[finish + 1] = (1 << d) - 1;
            for (let j = finish; j >= start; j--) {
                // The alphabet (s) is a sparse hash, so the following line generates
                // warnings.
                let charMatch = s[text.charAt(j - 1)];
                if (d === 0) {  // First pass: exact match.
                rd[j] = ((rd[j + 1] << 1) | 1) & charMatch;
                } else {  // Subsequent passes: fuzzy match.
                rd[j] = (((rd[j + 1] << 1) | 1) & charMatch) |
                        (((last_rd[j + 1] | last_rd[j]) << 1) | 1) |
                        last_rd[j + 1];
                }
                if (rd[j] & matchmask) {
                let score = match_bitapScore_(d, j - 1);
                // This match will almost certainly be better than any existing match.
                // But check anyway.
                if (score <= score_threshold) {
                    // Told you so.
                    score_threshold = score;
                    best_loc = j - 1;
                    if (best_loc > loc) {
                    // When passing loc, don't exceed our current distance from loc.
                    start = Math.max(1, 2 * loc - best_loc);
                    } else {
                    // Already passed loc, downhill from here on in.
                    break;
                    }
                }
                }
            }
            // No hope for a (better) match at greater error levels.
            if (match_bitapScore_(d + 1, loc) > score_threshold) {
                break;
            }
            last_rd = rd;
        }
        return best_loc;
    };

    match_main(text: string, pattern: string, loc: number): number {
        // Check for null inputs.
        if (text == null || pattern == null || loc == null) {
            throw new Error('Null input. (match_main)');
        }
    
        loc = Math.max(0, Math.min(loc, text.length));
        if (text == pattern) {
            // Shortcut (potentially not guaranteed by the algorithm)
            return 0;
        } else if (!text.length) {
            // Nothing to match.
            return -1;
        } else if (text.substring(loc, loc + pattern.length) == pattern) {
            // Perfect match at the perfect spot!  (Includes case of null pattern)
            return loc;
        } else {
            // Do a fuzzy compare.
            return this.match_bitap_(text, pattern, loc);
        }
    };

    diff_fromDelta(text1: string, delta: string): Diff[] {
        let diffs = [];
        let diffsLength = 0;  // Keeping our own length let is faster in JS.
        let pointer = 0;  // Cursor in text1
        let tokens = delta.split(/\t/g);
        for (let x = 0; x < tokens.length; x++) {
        // Each token begins with a one character parameter which specifies the
        // operation of this token (delete, insert, equality).
        let param = tokens[x].substring(1);
        switch (tokens[x].charAt(0)) {
            case '+':
                try {
                    diffs[diffsLength++] =
                        new Diff(DiffMatchPatch.DIFF_INSERT, decodeURI(param));
                } catch (ex) {
                    // Malformed URI sequence.
                    throw new Error('Illegal escape in diff_fromDelta: ' + param);
                }
                break;
            case '-':
                // Fall through.
            case '=':
                let n = parseInt(param, 10);
                if (isNaN(n) || n < 0) {
                    throw new Error('Invalid number in diff_fromDelta: ' + param);
                }
                let text = text1.substring(pointer, pointer += n);
                if (tokens[x].charAt(0) == '=') {
                    diffs[diffsLength++] = new Diff(DiffMatchPatch.DIFF_EQUAL, text);
                } else {
                    diffs[diffsLength++] = new Diff(DiffMatchPatch.DIFF_DELETE, text);
                }
                break;
            default:
                // Blank tokens are ok (from a trailing \t).
                // Anything else is an error.
                if (tokens[x]) {
                    throw new Error('Invalid diff operation in diff_fromDelta: ' +
                                    tokens[x]);
                }
        }
        }
        if (pointer != text1.length) {
            throw new Error('Delta length (' + pointer +
                ') does not equal source text length (' + text1.length + ').');
        }
        return diffs;
    };

    diff_toDelta(diffs: Diff[]): string {
        let text = [];
        for (let x = 0; x < diffs.length; x++) {
            switch (diffs[x].operation) {
            case DiffMatchPatch.DIFF_INSERT:
                text[x] = '+' + encodeURI(diffs[x].text);
                break;
            case DiffMatchPatch.DIFF_DELETE:
                text[x] = '-' + diffs[x].text.length;
                break;
            case DiffMatchPatch.DIFF_EQUAL:
                text[x] = '=' + diffs[x].text.length;
                break;
            }
        }
        return text.join('\t').replace(/%20/g, ' ');
    };

    diff_levenshtein(diffs: Diff[]): number {
        let levenshtein = 0;
        let insertions = 0;
        let deletions = 0;
        for (let x = 0; x < diffs.length; x++) {
            let op = diffs[x].operation;
            let data = diffs[x].text;
            switch (op) {
                case DiffMatchPatch.DIFF_INSERT:
                    insertions += data.length;
                    break;
                case DiffMatchPatch.DIFF_DELETE:
                    deletions += data.length;
                    break;
                case DiffMatchPatch.DIFF_EQUAL:
                    // A deletion and an insertion is one substitution.
                    levenshtein += Math.max(insertions, deletions);
                    insertions = 0;
                    deletions = 0;
                    break;
            }
        }
        levenshtein += Math.max(insertions, deletions);
        return levenshtein;
    };

    diff_text1(diffs: Diff[]): string {
        let text = [];
        for (let x = 0; x < diffs.length; x++) {
            if (diffs[x].operation !== DiffMatchPatch.DIFF_INSERT) {
            text[x] = diffs[x].text;
            }
        }
        return text.join('');
    };

    diff_text2(diffs: Diff[]): string {
        let text = [];
        for (let x = 0; x < diffs.length; x++) {
            if (diffs[x].operation !== DiffMatchPatch.DIFF_DELETE) {
            text[x] = diffs[x].text;
            }
        }
        return text.join('');
    };

    diff_prettyHtml(diffs: Diff[]): string {
        let html = [];
        let pattern_amp = /&/g;
        let pattern_lt = /</g;
        let pattern_gt = />/g;
        let pattern_para = /\n/g;
        for (let x = 0; x < diffs.length; x++) {
            let op = diffs[x].operation;    // Operation (insert, delete, equal)
            let data = diffs[x].text;  // Text of change.
            let text = data.replace(pattern_amp, '&amp;').replace(pattern_lt, '&lt;')
                .replace(pattern_gt, '&gt;').replace(pattern_para, '&para;<br>');
            switch (op) {
                case DiffMatchPatch.DIFF_INSERT:
                    html[x] = '<ins style="background:#e6ffe6;">' + text + '</ins>';
                    break;
                case DiffMatchPatch.DIFF_DELETE:
                    html[x] = '<del style="background:#ffe6e6;">' + text + '</del>';
                    break;
                case DiffMatchPatch.DIFF_EQUAL:
                    html[x] = '<span>' + text + '</span>';
                    break;
            }
        }
        return html.join('');
    };

    diff_xIndex(diffs: Diff[], loc: number): number {
        let chars1 = 0;
        let chars2 = 0;
        let last_chars1 = 0;
        let last_chars2 = 0;
        let x;
        for (x = 0; x < diffs.length; x++) {
            if (diffs[x].operation !== DiffMatchPatch.DIFF_INSERT) {  // Equality or deletion.
                chars1 += diffs[x].text.length;
            }
            if (diffs[x].operation !== DiffMatchPatch.DIFF_DELETE) {  // Equality or insertion.
                chars2 += diffs[x].text.length;
            }
            if (chars1 > loc) {  // Overshot the location.
                break;
            }
            last_chars1 = chars1;
            last_chars2 = chars2;
        }
        // Was the location was deleted?
        if (diffs.length != x && diffs[x].operation === DiffMatchPatch.DIFF_DELETE) {
            return last_chars2;
        }
        // Add the remaining character length.
        return last_chars2 + (loc - last_chars1);
    };

    diff_cleanupMerge(diffs: Diff[]): void {
        // Add a dummy entry at the end.
        diffs.push(new Diff(DiffMatchPatch.DIFF_EQUAL, ''));
        let pointer = 0;
        let count_delete = 0;
        let count_insert = 0;
        let text_delete = '';
        let text_insert = '';
        let commonlength;
        while (pointer < diffs.length) {
            switch (diffs[pointer].operation) {
                case DiffMatchPatch.DIFF_INSERT:
                    count_insert++;
                    text_insert += diffs[pointer].text;
                    pointer++;
                    break;
                case DiffMatchPatch.DIFF_DELETE:
                    count_delete++;
                    text_delete += diffs[pointer].text;
                    pointer++;
                    break;
                case DiffMatchPatch.DIFF_EQUAL:
                    // Upon reaching an equality, check for prior redundancies.
                    if (count_delete + count_insert > 1) {
                    if (count_delete !== 0 && count_insert !== 0) {
                        // Factor out any common prefixies.
                        commonlength = this.diff_commonPrefix(text_insert, text_delete);
                        if (commonlength !== 0) {
                            if ((pointer - count_delete - count_insert) > 0 &&
                                diffs[pointer - count_delete - count_insert - 1].operation ==
                                DiffMatchPatch.DIFF_EQUAL) {
                                diffs[pointer - count_delete - count_insert - 1].text +=
                                    text_insert.substring(0, commonlength);
                            } else {
                                diffs.splice(0, 0, new Diff(DiffMatchPatch.DIFF_EQUAL,
                                    text_insert.substring(0, commonlength)));
                                pointer++;
                            }
                            text_insert = text_insert.substring(commonlength);
                            text_delete = text_delete.substring(commonlength);
                        }
                        // Factor out any common suffixies.
                        commonlength = this.diff_commonSuffix(text_insert, text_delete);
                        if (commonlength !== 0) {
                            diffs[pointer].text = text_insert.substring(text_insert.length -
                                commonlength) + diffs[pointer].text;
                            text_insert = text_insert.substring(0, text_insert.length -
                                commonlength);
                            text_delete = text_delete.substring(0, text_delete.length -
                                commonlength);
                        }
                    }
                    // Delete the offending records and add the merged ones.
                    pointer -= count_delete + count_insert;
                    diffs.splice(pointer, count_delete + count_insert);
                    if (text_delete.length) {
                        diffs.splice(pointer, 0,
                            new Diff(DiffMatchPatch.DIFF_DELETE, text_delete));
                        pointer++;
                    }
                    if (text_insert.length) {
                        diffs.splice(pointer, 0,
                            new Diff(DiffMatchPatch.DIFF_INSERT, text_insert));
                        pointer++;
                    }
                    pointer++;
                    } else if (pointer !== 0 && diffs[pointer - 1].operation == DiffMatchPatch.DIFF_EQUAL) {
                        // Merge this equality with the previous one.
                        diffs[pointer - 1].text += diffs[pointer].text;
                        diffs.splice(pointer, 1);
                    } else {
                        pointer++;
                    }
                    count_insert = 0;
                    count_delete = 0;
                    text_delete = '';
                    text_insert = '';
                    break;
            }
        }
        if (diffs[diffs.length - 1].text === '') {
            diffs.pop();  // Remove the dummy entry at the end.
        }
        
        // Second pass: look for single edits surrounded on both sides by equalities
        // which can be shifted sideways to eliminate an equality.
        // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
        let changes = false;
        pointer = 1;
        // Intentionally ignore the first and last element (don't need checking).
        while (pointer < diffs.length - 1) {
            if (diffs[pointer - 1].operation == DiffMatchPatch.DIFF_EQUAL &&
                diffs[pointer + 1].operation == DiffMatchPatch.DIFF_EQUAL) {
            // This is a single edit surrounded by equalities.
            if (diffs[pointer].text.substring(diffs[pointer].text.length -
                diffs[pointer - 1].text.length) == diffs[pointer - 1].text) {
                // Shift the edit over the previous equality.
                diffs[pointer].text = diffs[pointer - 1].text +
                    diffs[pointer].text.substring(0, diffs[pointer].text.length -
                                                diffs[pointer - 1].text.length);
                diffs[pointer + 1].text = diffs[pointer - 1].text + diffs[pointer + 1].text;
                diffs.splice(pointer - 1, 1);
                changes = true;
            } else if (diffs[pointer].text.substring(0, diffs[pointer + 1].text.length) ==
                diffs[pointer + 1].text) {
                // Shift the edit over the next equality.
                diffs[pointer - 1].text += diffs[pointer + 1].text;
                diffs[pointer].text =
                    diffs[pointer].text.substring(diffs[pointer + 1].text.length) +
                    diffs[pointer + 1].text;
                diffs.splice(pointer + 1, 1);
                changes = true;
            }
            }
            pointer++;
        }
        // If shifts were made, the diff needs reordering and another shift sweep.
        if (changes) {
            this.diff_cleanupMerge(diffs);
        }
    };

    diff_cleanupEfficiency(diffs: Diff[]): void {
        let changes = false;
        let equalities = [];  // Stack of indices where equalities are found.
        let equalitiesLength = 0;  // Keeping our own length let is faster in JS.
        let lastEquality: string|null = null;
        // Always equal to diffs[equalities[equalitiesLength - 1]][1]
        let pointer = 0;  // Index of current position.
        // Is there an insertion operation before the last equality.
        let pre_ins = false;
        // Is there a deletion operation before the last equality.
        let pre_del = false;
        // Is there an insertion operation after the last equality.
        let post_ins = false;
        // Is there a deletion operation after the last equality.
        let post_del = false;
        while (pointer < diffs.length) {
            if (diffs[pointer].operation == DiffMatchPatch.DIFF_EQUAL) {  // Equality found.
            if (diffs[pointer].text.length < this.Diff_EditCost &&
                (post_ins || post_del)) {
                // Candidate found.
                equalities[equalitiesLength++] = pointer;
                pre_ins = post_ins;
                pre_del = post_del;
                lastEquality = diffs[pointer].text;
            } else {
                // Not a candidate, and can never become one.
                equalitiesLength = 0;
                lastEquality = null;
            }
            post_ins = post_del = false;
            } else {  // An insertion or deletion.
                if (diffs[pointer].operation == DiffMatchPatch.DIFF_DELETE) {
                    post_del = true;
                } else {
                    post_ins = true;
                }
                /*
                    * Five types to be split:
                    * <ins>A</ins><del>B</del>XY<ins>C</ins><del>D</del>
                    * <ins>A</ins>X<ins>C</ins><del>D</del>
                    * <ins>A</ins><del>B</del>X<ins>C</ins>
                    * <ins>A</del>X<ins>C</ins><del>D</del>
                    * <ins>A</ins><del>B</del>X<del>C</del>
                    */
                if (lastEquality && ((pre_ins && pre_del && post_ins && post_del) ||
                                        ((lastEquality.length < this.Diff_EditCost / 2) &&
                                        (Number(pre_ins) + Number(pre_del) + Number(post_ins) + Number(post_del)) == 3))) {
                    // Duplicate record.
                    diffs.splice(equalities[equalitiesLength - 1], 0,
                                new Diff(DiffMatchPatch.DIFF_DELETE, lastEquality));
                    // Change second copy to insert.
                    diffs[equalities[equalitiesLength - 1] + 1].operation = DiffMatchPatch.DIFF_INSERT;
                    equalitiesLength--;  // Throw away the equality we just deleted;
                    lastEquality = null;
                    if (pre_ins && pre_del) {
                        // No changes made which could affect previous entry, keep going.
                        post_ins = post_del = true;
                        equalitiesLength = 0;
                    } else {
                        equalitiesLength--;  // Throw away the previous equality.
                        pointer = equalitiesLength > 0 ?
                            equalities[equalitiesLength - 1] : -1;
                        post_ins = post_del = false;
                    }
                    changes = true;
                }
            }
            pointer++;
        }
        
        if (changes) {
            this.diff_cleanupMerge(diffs);
        }
    };

    diff_cleanupSemanticLossless(diffs: Diff[]): void {
        function diff_cleanupSemanticScore_(one: string, two: string, diffMatchPatch: DiffMatchPatch): number {
            if (!one || !two) {
                // Edges are the best.
                return 6;
            }
        
            // Each port of this function behaves slightly differently due to
            // subtle differences in each language's definition of things like
            // 'whitespace'.  Since this function's purpose is largely cosmetic,
            // the choice has been made to use each language's native features
            // rather than force total conformity.
            let char1 = one.charAt(one.length - 1);
            let char2 = two.charAt(0);
            let nonAlphaNumeric1 = char1.match(diffMatchPatch.nonAlphaNumericRegex_);
            let nonAlphaNumeric2 = char2.match(diffMatchPatch.nonAlphaNumericRegex_);
            let whitespace1 = nonAlphaNumeric1 &&
                char1.match(diffMatchPatch.whitespaceRegex_);
            let whitespace2 = nonAlphaNumeric2 &&
                char2.match(diffMatchPatch.whitespaceRegex_);
            let lineBreak1 = whitespace1 &&
                char1.match(diffMatchPatch.linebreakRegex_);
            let lineBreak2 = whitespace2 &&
                char2.match(diffMatchPatch.linebreakRegex_);
            let blankLine1 = lineBreak1 &&
                one.match(diffMatchPatch.blanklineEndRegex_);
            let blankLine2 = lineBreak2 &&
                two.match(diffMatchPatch.blanklineStartRegex_);
        
            if (blankLine1 || blankLine2) {
                // Five points for blank lines.
                return 5;
            } else if (lineBreak1 || lineBreak2) {
                // Four points for line breaks.
                return 4;
            } else if (nonAlphaNumeric1 && !whitespace1 && whitespace2) {
                // Three points for end of sentences.
                return 3;
            } else if (whitespace1 || whitespace2) {
                // Two points for whitespace.
                return 2;
            } else if (nonAlphaNumeric1 || nonAlphaNumeric2) {
                // One point for non-alphanumeric.
                return 1;
            }
            return 0;
        }
        
        let pointer = 1;
        // Intentionally ignore the first and last element (don't need checking).
        while (pointer < diffs.length - 1) {
            if (diffs[pointer - 1].operation == DiffMatchPatch.DIFF_EQUAL &&
                diffs[pointer + 1].operation == DiffMatchPatch.DIFF_EQUAL) {
            // This is a single edit surrounded by equalities.
            let equality1 = diffs[pointer - 1].text;
            let edit = diffs[pointer].text;
            let equality2 = diffs[pointer + 1].text;
        
            // First, shift the edit as far left as possible.
            let commonOffset = this.diff_commonSuffix(equality1, edit);
            if (commonOffset) {
                let commonString = edit.substring(edit.length - commonOffset);
                equality1 = equality1.substring(0, equality1.length - commonOffset);
                edit = commonString + edit.substring(0, edit.length - commonOffset);
                equality2 = commonString + equality2;
            }
        
            // Second, step character by character right, looking for the best fit.
            let bestEquality1 = equality1;
            let bestEdit = edit;
            let bestEquality2 = equality2;
            let bestScore = diff_cleanupSemanticScore_(equality1, edit, this) +
                diff_cleanupSemanticScore_(edit, equality2, this);
            while (edit.charAt(0) === equality2.charAt(0)) {
                equality1 += edit.charAt(0);
                edit = edit.substring(1) + equality2.charAt(0);
                equality2 = equality2.substring(1);
                let score = diff_cleanupSemanticScore_(equality1, edit, this) +
                    diff_cleanupSemanticScore_(edit, equality2, this);
                // The >= encourages trailing rather than leading whitespace on edits.
                if (score >= bestScore) {
                    bestScore = score;
                    bestEquality1 = equality1;
                    bestEdit = edit;
                    bestEquality2 = equality2;
                }
            }
        
            if (diffs[pointer - 1].text != bestEquality1) {
                // We have an improvement, save it back to the diff.
                if (bestEquality1) {
                    diffs[pointer - 1].text = bestEquality1;
                } else {
                    diffs.splice(pointer - 1, 1);
                    pointer--;
                }
                diffs[pointer].text= bestEdit;
                if (bestEquality2) {
                    diffs[pointer + 1].text= bestEquality2;
                } else {
                    diffs.splice(pointer + 1, 1);
                    pointer--;
                }
            }
            }
            pointer++;
        }
    };

    diff_cleanupSemantic(diffs: Diff[]): void {
        let changes = false;
        let equalities = [];  // Stack of indices where equalities are found.
        let equalitiesLength = 0;  // Keeping our own length let is faster in JS.
        let lastEquality: string|null = null;
        // Always equal to diffs[equalities[equalitiesLength - 1]][1]
        let pointer = 0;  // Index of current position.
        // Number of characters that changed prior to the equality.
        let length_insertions1 = 0;
        let length_deletions1 = 0;
        // Number of characters that changed after the equality.
        let length_insertions2 = 0;
        let length_deletions2 = 0;
        while (pointer < diffs.length) {
            if (diffs[pointer].operation == DiffMatchPatch.DIFF_EQUAL) {  // Equality found.
                equalities[equalitiesLength++] = pointer;
                length_insertions1 = length_insertions2;
                length_deletions1 = length_deletions2;
                length_insertions2 = 0;
                length_deletions2 = 0;
                lastEquality = diffs[pointer].text;
            } else {  // An insertion or deletion.
                if (diffs[pointer].operation == DiffMatchPatch.DIFF_INSERT) {
                    length_insertions2 += diffs[pointer].text.length;
                } else {
                    length_deletions2 += diffs[pointer].text.length;
                }
                // Eliminate an equality that is smaller or equal to the edits on both
                // sides of it.
                if (lastEquality && (lastEquality.length <=
                    Math.max(length_insertions1, length_deletions1)) &&
                    (lastEquality.length <= Math.max(length_insertions2,
                                                    length_deletions2))) {
                // Duplicate record.
                diffs.splice(equalities[equalitiesLength - 1], 0,
                            new Diff(DiffMatchPatch.DIFF_DELETE, lastEquality));
                // Change second copy to insert.
                diffs[equalities[equalitiesLength - 1] + 1].operation = DiffMatchPatch.DIFF_INSERT;
                // Throw away the equality we just deleted.
                equalitiesLength--;
                // Throw away the previous equality (it needs to be reevaluated).
                equalitiesLength--;
                pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
                length_insertions1 = 0;  // Reset the counters.
                length_deletions1 = 0;
                length_insertions2 = 0;
                length_deletions2 = 0;
                lastEquality = null;
                changes = true;
                }
            }
            pointer++;
        }
    
        // Normalize the diff.
        if (changes) {
            this.diff_cleanupMerge(diffs);
        }
        this.diff_cleanupSemanticLossless(diffs);
    
        // Find any overlaps between deletions and insertions.
        // e.g: <del>abcxxx</del><ins>xxxdef</ins>
        //   -> <del>abc</del>xxx<ins>def</ins>
        // e.g: <del>xxxabc</del><ins>defxxx</ins>
        //   -> <ins>def</ins>xxx<del>abc</del>
        // Only extract an overlap if it is as big as the edit ahead or behind it.
        pointer = 1;
        while (pointer < diffs.length) {
        if (diffs[pointer - 1].operation == DiffMatchPatch.DIFF_DELETE &&
            diffs[pointer].operation == DiffMatchPatch.DIFF_INSERT) {
            let deletion = diffs[pointer - 1].text;
            let insertion = diffs[pointer].text;
            let overlap_length1 = this.diff_commonOverlap_(deletion, insertion);
            let overlap_length2 = this.diff_commonOverlap_(insertion, deletion);
            if (overlap_length1 >= overlap_length2) {
            if (overlap_length1 >= deletion.length / 2 ||
                overlap_length1 >= insertion.length / 2) {
                // Overlap found.  Insert an equality and trim the surrounding edits.
                diffs.splice(pointer, 0, new Diff(DiffMatchPatch.DIFF_EQUAL,
                    insertion.substring(0, overlap_length1)));
                diffs[pointer - 1].text =
                    deletion.substring(0, deletion.length - overlap_length1);
                diffs[pointer + 1].text = insertion.substring(overlap_length1);
                pointer++;
            }
            } else {
            if (overlap_length2 >= deletion.length / 2 ||
                overlap_length2 >= insertion.length / 2) {
                // Reverse overlap found.
                // Insert an equality and swap and trim the surrounding edits.
                diffs.splice(pointer, 0, new Diff(DiffMatchPatch.DIFF_EQUAL,
                    deletion.substring(0, overlap_length2)));
                diffs[pointer - 1].operation = DiffMatchPatch.DIFF_INSERT;
                diffs[pointer - 1].text =
                    insertion.substring(0, insertion.length - overlap_length2);
                diffs[pointer + 1].operation = DiffMatchPatch.DIFF_DELETE;
                diffs[pointer + 1].text =
                    deletion.substring(overlap_length2);
                pointer++;
            }
            }
            pointer++;
        }
        pointer++;
        }
    };

    diff_halfMatch_(text1: string, text2: string): string[]|null {
        if (this.Diff_Timeout <= 0) {
            // Don't risk returning a non-optimal diff if we have unlimited time.
            return null;
        }
        let longtext = text1.length > text2.length ? text1 : text2;
        let shorttext = text1.length > text2.length ? text2 : text1;
        if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
            return null;  // Pointless.
        }
        let dmp = this;  // 'this' becomes 'window' in a closure.
    
        function diff_halfMatchI_(longtext: string, shorttext: string, i: number): string[]|null {
            // Start with a 1/4 length substring at position i as a seed.
            let seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
            let j = -1;
            let best_common = '';
            let best_longtext_a: string = '';
            let best_longtext_b: string = '';
            let best_shorttext_a: string = '';
            let best_shorttext_b: string = '';
            while ((j = shorttext.indexOf(seed, j + 1)) != -1) {
                let prefixLength = dmp.diff_commonPrefix(longtext.substring(i),
                                                        shorttext.substring(j));
                let suffixLength = dmp.diff_commonSuffix(longtext.substring(0, i),
                                                        shorttext.substring(0, j));
                if (best_common.length < suffixLength + prefixLength) {
                    best_common = shorttext.substring(j - suffixLength, j) +
                        shorttext.substring(j, j + prefixLength);
                    best_longtext_a = longtext.substring(0, i - suffixLength);
                    best_longtext_b = longtext.substring(i + prefixLength);
                    best_shorttext_a = shorttext.substring(0, j - suffixLength);
                    best_shorttext_b = shorttext.substring(j + prefixLength);
                }
            }
            if (best_common.length * 2 >= longtext.length) {
                return [best_longtext_a, 
                        best_longtext_b,
                        best_shorttext_a, 
                        best_shorttext_b, 
                        best_common
                    ];
            } else {
                return null;
            }
        }
    
        // First check if the second quarter is the seed for a half-match.
        let hm1 = diff_halfMatchI_(longtext, shorttext,
                                Math.ceil(longtext.length / 4));
        // Check again based on the third quarter.
        let hm2 = diff_halfMatchI_(longtext, shorttext,
                                Math.ceil(longtext.length / 2));
        let hm: string[]|null;
        if (!hm1 && !hm2) {
            return null;
        } else if (!hm2) {
            hm = hm1!;
        } else if (!hm1) {
            hm = hm2!;
        } else {
            // Both matched.  Select the longest.
            hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
        }
    
        // A half-match was found, sort out the return data.
        let text1_a: string, text1_b: string, text2_a: string, text2_b: string;
        if (text1.length > text2.length) {
            text1_a = hm[0];
            text1_b = hm[1];
            text2_a = hm[2];
            text2_b = hm[3];
        } else {
            text2_a = hm[0];
            text2_b = hm[1];
            text1_a = hm[2];
            text1_b = hm[3];
        }
        let mid_common = hm[4];
        return [text1_a, text1_b, text2_a, text2_b, mid_common];
    };

    diff_commonOverlap_(text1: string, text2: string): number {
        // Cache the text lengths to prevent multiple calls.
        let text1_length = text1.length;
        let text2_length = text2.length;
        // Eliminate the null case.
        if (text1_length == 0 || text2_length == 0) {
            return 0;
        }
        // Truncate the longer string.
        if (text1_length > text2_length) {
            text1 = text1.substring(text1_length - text2_length);
        } else if (text1_length < text2_length) {
            text2 = text2.substring(0, text1_length);
        }
        let text_length = Math.min(text1_length, text2_length);
        // Quick check for the worst case.
        if (text1 == text2) {
            return text_length;
        }
    
        // Start by looking for a single character match
        // and increase length until no match is found.
        // Performance analysis: https://neil.fraser.name/news/2010/11/04/
        let best = 0;
        let length = 1;
        while (true) {
            let pattern = text1.substring(text_length - length);
            let found = text2.indexOf(pattern);
            if (found == -1) {
                return best;
            }
            length += found;
            if (found == 0 || text1.substring(text_length - length) ==
                text2.substring(0, length)) {
                best = length;
                length++;
            }
        }
    };

    diff_commonPrefix(text1: string, text2: string): number {
        // Quick check for common null cases.
        if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
            return 0;
        }
        // Binary search.
        // Performance analysis: https://neil.fraser.name/news/2007/10/09/
        let pointermin = 0;
        let pointermax = Math.min(text1.length, text2.length);
        let pointermid = pointermax;
        let pointerstart = 0;
        while (pointermin < pointermid) {
            if (text1.substring(pointerstart, pointermid) ==
                text2.substring(pointerstart, pointermid)) {
            pointermin = pointermid;
            pointerstart = pointermin;
            } else {
            pointermax = pointermid;
            }
            pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
        }
        return pointermid;
    };

    diff_commonSuffix(text1: string, text2: string): number {
        // Quick check for common null cases.
        if (!text1 || !text2 ||
            text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
            return 0;
        }
        // Binary search.
        // Performance analysis: https://neil.fraser.name/news/2007/10/09/
        let pointermin = 0;
        let pointermax = Math.min(text1.length, text2.length);
        let pointermid = pointermax;
        let pointerend = 0;
        while (pointermin < pointermid) {
            if (text1.substring(text1.length - pointermid, text1.length - pointerend) ==
                text2.substring(text2.length - pointermid, text2.length - pointerend)) {
            pointermin = pointermid;
            pointerend = pointermin;
            } else {
            pointermax = pointermid;
            }
            pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
        }
        return pointermid;
    };

    diff_charsToLines_(diffs: Diff[], lineArray: string[]): void {
        for (let i = 0; i < diffs.length; i++) {
            let chars = diffs[i].text;
            let text = [];
            for (let j = 0; j < chars.length; j++) {
                text[j] = lineArray[chars.charCodeAt(j)];
            }
            diffs[i].text = text.join('');
        }
    };

    diff_linesToChars_(text1: string, text2: string): {chars1: string, chars2: string, lineArray: string[]} {
        let lineArray = [];  // e.g. lineArray[4] == 'Hello\n'
        let lineHash: {[key: string]: number} = {};  // e.g. lineHash['Hello\n'] == 4

        // '\x00' is a valid character, but various debuggers don't like it.
        // So we'll insert a junk entry to avoid generating a null character.
        lineArray[0] = '';

        function diff_linesToCharsMunge_(text: string): string {
            let chars = '';
            // Walk the text, pulling out a substring for each line.
            // text.split('\n') would would temporarily double our memory footprint.
            // Modifying text would create many large strings to garbage collect.
            let lineStart = 0;
            let lineEnd = -1;
            // Keeping our own length variable is faster than looking it up.
            let lineArrayLength = lineArray.length;
            while (lineEnd < text.length - 1) {
                lineEnd = text.indexOf('\n', lineStart);
                if (lineEnd == -1) {
                    lineEnd = text.length - 1;
                }
                let line = text.substring(lineStart, lineEnd + 1);
        
                if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) :
                    (lineHash[line] !== undefined)) {
                    chars += String.fromCharCode(lineHash[line]);
                } else {
                    if (lineArrayLength == maxLines) {
                        // Bail out at 65535 because
                        // String.fromCharCode(65536) == String.fromCharCode(0)
                        line = text.substring(lineStart);
                        lineEnd = text.length;
                    }
                    chars += String.fromCharCode(lineArrayLength);
                    lineHash[line] = lineArrayLength;
                    lineArray[lineArrayLength++] = line;
                }
                lineStart = lineEnd + 1;
            }
            return chars;
        }
        // Allocate 2/3rds of the space for text1, the rest for text2.
        let maxLines = 40000;
        let chars1 = diff_linesToCharsMunge_(text1);
        maxLines = 65535;
        let chars2 = diff_linesToCharsMunge_(text2);
        return {chars1: chars1, chars2: chars2, lineArray: lineArray};
    };

    diff_bisectSplit_(text1: string, text2: string, x: number, y: number, deadline: number): Diff[] {
        let text1a = text1.substring(0, x);
        let text2a = text2.substring(0, y);
        let text1b = text1.substring(x);
        let text2b = text2.substring(y);
        
        // Compute both diffs serially.
        let diffs = this.diff_main(text1a, text2a, false, deadline);
        let diffsb = this.diff_main(text1b, text2b, false, deadline);
        
        return diffs.concat(diffsb);
    };

    diff_bisect_(text1: string, text2: string, deadline: number): Diff[] {
        // Cache the text lengths to prevent multiple calls.
        let text1_length = text1.length;
        let text2_length = text2.length;
        let max_d = Math.ceil((text1_length + text2_length) / 2);
        let v_offset = max_d;
        let v_length = 2 * max_d;
        let v1 = new Array(v_length);
        let v2 = new Array(v_length);
        // Setting all elements to -1 is faster in Chrome & Firefox than mixing
        // integers and undefined.
        for (let x = 0; x < v_length; x++) {
            v1[x] = -1;
            v2[x] = -1;
        }
        v1[v_offset + 1] = 0;
        v2[v_offset + 1] = 0;
        let delta = text1_length - text2_length;
        // If the total number of characters is odd, then the front path will collide
        // with the reverse path.
        let front = (delta % 2 != 0);
        // Offsets for start and end of k loop.
        // Prevents mapping of space beyond the grid.
        let k1start = 0;
        let k1end = 0;
        let k2start = 0;
        let k2end = 0;
        for (let d = 0; d < max_d; d++) {
            // Bail out if deadline is reached.
            if ((new Date()).getTime() > deadline) {
                break;
            }
        
            // Walk the front path one step.
            for (let k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
                let k1_offset = v_offset + k1;
                let x1;
                if (k1 == -d || (k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
                    x1 = v1[k1_offset + 1];
                } else {
                    x1 = v1[k1_offset - 1] + 1;
                }
                let y1 = x1 - k1;
                while (x1 < text1_length && y1 < text2_length &&
                    text1.charAt(x1) == text2.charAt(y1)) {
                    x1++;
                    y1++;
                }
                v1[k1_offset] = x1;
                if (x1 > text1_length) {
                    // Ran off the right of the graph.
                    k1end += 2;
                } else if (y1 > text2_length) {
                    // Ran off the bottom of the graph.
                    k1start += 2;
                } else if (front) {
                    let k2_offset = v_offset + delta - k1;
                        if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
                            // Mirror x2 onto top-left coordinate system.
                            let x2 = text1_length - v2[k2_offset];
                            if (x1 >= x2) {
                            // Overlap detected.
                            return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
                            }
                        }
                }
            }
    
            // Walk the reverse path one step.
            for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
                let k2_offset = v_offset + k2;
                let x2;
                if (k2 == -d || (k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
                    x2 = v2[k2_offset + 1];
                } else {
                    x2 = v2[k2_offset - 1] + 1;
                }
                let y2 = x2 - k2;
                while (x2 < text1_length && y2 < text2_length &&
                    text1.charAt(text1_length - x2 - 1) ==
                    text2.charAt(text2_length - y2 - 1)) {
                    x2++;
                    y2++;
                }
                v2[k2_offset] = x2;
                if (x2 > text1_length) {
                    // Ran off the left of the graph.
                    k2end += 2;
                } else if (y2 > text2_length) {
                    // Ran off the top of the graph.
                    k2start += 2;
                } else if (!front) {
                    let k1_offset = v_offset + delta - k2;
                    if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
                        let x1 = v1[k1_offset];
                        let y1 = v_offset + x1 - k1_offset;
                        // Mirror x2 onto top-left coordinate system.
                        x2 = text1_length - x2;
                        if (x1 >= x2) {
                            // Overlap detected.
                            return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
                        }
                    }
                }
            }
        }
        // Diff took too long and hit the deadline or
        // number of diffs equals number of characters, no commonality at all.
        return [new Diff(DiffMatchPatch.DIFF_DELETE, text1),
                new Diff(DiffMatchPatch.DIFF_INSERT, text2)];
    };

    diff_lineMode_(text1: string, text2: string, deadline: number): Diff[] {
        // Scan the text on a line-by-line basis first.
        let a = this.diff_linesToChars_(text1, text2);
        text1 = a.chars1;
        text2 = a.chars2;
        let linearray = a.lineArray;
    
        let diffs = this.diff_main(text1, text2, false, deadline);
    
        // Convert the diff back to original text.
        this.diff_charsToLines_(diffs, linearray);
        // Eliminate freak matches (e.g. blank lines)
        this.diff_cleanupSemantic(diffs);
    
        // Rediff any replacement blocks, this time character-by-character.
        // Add a dummy entry at the end.
        diffs.push(new Diff(DiffMatchPatch.DIFF_EQUAL, ''));
        let pointer = 0;
        let count_delete = 0;
        let count_insert = 0;
        let text_delete = '';
        let text_insert = '';
        while (pointer < diffs.length) {
            switch (diffs[pointer].operation) {
                case DiffMatchPatch.DIFF_INSERT:
                    count_insert++;
                    text_insert += diffs[pointer].text;
                    break;
                case DiffMatchPatch.DIFF_DELETE:
                    count_delete++;
                    text_delete += diffs[pointer].text;
                    break;
                case DiffMatchPatch.DIFF_EQUAL:
                    // Upon reaching an equality, check for prior redundancies.
                    if (count_delete >= 1 && count_insert >= 1) {
                        // Delete the offending records and add the merged ones.
                        diffs.splice(pointer - count_delete - count_insert,
                                    count_delete + count_insert);
                        pointer = pointer - count_delete - count_insert;
                        let subDiff =
                            this.diff_main(text_delete, text_insert, false, deadline);
                        for (let j = subDiff.length - 1; j >= 0; j--) {
                        diffs.splice(pointer, 0, subDiff[j]);
                        }
                        pointer = pointer + subDiff.length;
                    }
                    count_insert = 0;
                    count_delete = 0;
                    text_delete = '';
                    text_insert = '';
                    break;
            }
        pointer++;
        }
        diffs.pop();  // Remove the dummy entry at the end.
    
        return diffs;
    };

    diff_compute_(text1: string, text2: string, checklines: boolean, deadline: number): Diff[] {
        let diffs;
        
        if (!text1) {
            // Just add some text (speedup).
            return [new Diff(DiffMatchPatch.DIFF_INSERT, text2)];
        }
        
        if (!text2) {
            // Just delete some text (speedup).
            return [new Diff(DiffMatchPatch.DIFF_DELETE, text1)];
        }
        
        let longtext = text1.length > text2.length ? text1 : text2;
        let shorttext = text1.length > text2.length ? text2 : text1;
        let i = longtext.indexOf(shorttext);
        if (i != -1) {
            // Shorter text is inside the longer text (speedup).
            diffs = [new Diff(DiffMatchPatch.DIFF_INSERT, longtext.substring(0, i)),
                    new Diff(DiffMatchPatch.DIFF_EQUAL, shorttext),
                    new Diff(DiffMatchPatch.DIFF_INSERT,
                        longtext.substring(i + shorttext.length))];
            // Swap insertions for deletions if diff is reversed.
            if (text1.length > text2.length) {
            diffs[0].operation = diffs[2].operation = DiffMatchPatch.DIFF_DELETE;
            }
            return diffs;
        }
        
        if (shorttext.length == 1) {
            // Single character string.
            // After the previous speedup, the character can't be an equality.
            return [new Diff(DiffMatchPatch.DIFF_DELETE, text1),
                    new Diff(DiffMatchPatch.DIFF_INSERT, text2)];
        }
        
        // Check to see if the problem can be split in two.
        let hm = this.diff_halfMatch_(text1, text2);
        if (hm) {
            // A half-match was found, sort out the return data.
            let text1_a = hm[0];
            let text1_b = hm[1];
            let text2_a = hm[2];
            let text2_b = hm[3];
            let mid_common = hm[4];
            // Send both pairs off for separate processing.
            let diffs_a = this.diff_main(text1_a, text2_a, checklines, deadline);
            let diffs_b = this.diff_main(text1_b, text2_b, checklines, deadline);
            // Merge the results.
            return diffs_a.concat([new Diff(DiffMatchPatch.DIFF_EQUAL, mid_common)],
                                diffs_b);
        }
        
        if (checklines && text1.length > 100 && text2.length > 100) {
            return this.diff_lineMode_(text1, text2, deadline);
        }
        
        return this.diff_bisect_(text1, text2, deadline);
    };

    diff_main(text1: string, text2: string, opt_checklines?: boolean, opt_deadline?: number): Diff[] {
        // Set a deadline by which time the diff must be complete.
        if (typeof opt_deadline == 'undefined') {
            if (this.Diff_Timeout <= 0) {
                opt_deadline = Number.MAX_VALUE;
            } else {
                opt_deadline = (new Date).getTime() + this.Diff_Timeout * 1000;
            }
        }
        let deadline = opt_deadline;
        
        // Check for null inputs.
        if (text1 == null || text2 == null) {
            throw new Error('Null input. (diff_main)');
        }
        
        // Check for equality (speedup).
        if (text1 == text2) {
            if (text1) {
                return [new Diff(DiffMatchPatch.DIFF_EQUAL, text1)];
            }
            return [];
        }
        
        if (typeof opt_checklines == 'undefined') {
            opt_checklines = true;
        }
        let checklines = opt_checklines;
        
        // Trim off common prefix (speedup).
        let commonlength = this.diff_commonPrefix(text1, text2);
        let commonprefix = text1.substring(0, commonlength);
        text1 = text1.substring(commonlength);
        text2 = text2.substring(commonlength);
        
        // Trim off common suffix (speedup).
        commonlength = this.diff_commonSuffix(text1, text2);
        let commonsuffix = text1.substring(text1.length - commonlength);
        text1 = text1.substring(0, text1.length - commonlength);
        text2 = text2.substring(0, text2.length - commonlength);
        
        // Compute the diff on the middle block.
        let diffs = this.diff_compute_(text1, text2, checklines, deadline);
        
        // Restore the prefix and suffix.
        if (commonprefix) {
            diffs.unshift(new Diff(DiffMatchPatch.DIFF_EQUAL, commonprefix));
        }
        if (commonsuffix) {
            diffs.push(new Diff(DiffMatchPatch.DIFF_EQUAL, commonsuffix));
        }
        this.diff_cleanupMerge(diffs);
        return diffs;
    };
}

export default DiffMatchPatch;
