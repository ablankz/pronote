import { FlexibleTextStyles, NullableFlexibleTextStyles } from "../../renderer/text/types";

export interface RangeSelectedState {
    isLast: boolean;
    overStyle: NullableFlexibleTextStyles;
    editingContents: {
        blockIndex: number;
        textFrom: number;
        textTo: number;
        isFullLine: boolean;
        blockStyle: FlexibleTextStyles;
        lastNewLineSelected: boolean;
    }[];
}