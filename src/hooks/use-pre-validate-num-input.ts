import { Accessor } from "solid-js";
import { inputNumWithValidate, InputNumWithValidateOptions } from "../utils/input";

export interface PreValidateNumInput {
    validateOptions?: InputNumWithValidateOptions;
    handleInput?: (rawValue: string, numValue: number|null) => void;
    accurateValue: Accessor<number>;
}

export function preValidateNumInput(el: HTMLInputElement, value: Accessor<PreValidateNumInput>) {
    el.addEventListener("blur", (e) => {
        const currentValue = (e.target as HTMLInputElement).value;
        const numValue = parseFloat(currentValue);
        if (isNaN(numValue) || numValue.toString() !== currentValue) {
            (e.target as HTMLInputElement).value = value().accurateValue().toString();
        }
    });
    el.addEventListener("beforeinput", (e) => {
        if (e.inputType === "insertText") {
                e.preventDefault();
                const insertChar = e.data || "";
                const insertSelection = (e.target as HTMLInputElement);
                if (insertSelection.selectionStart !== null && 
                    insertSelection.selectionEnd !== null && 
                    insertSelection.selectionStart !== insertSelection.selectionEnd) {
                    const insertIndex = insertSelection.selectionStart || 0;
                    const insertValue = insertSelection.value;
                    let newValue = insertValue.substring(
                        0, 
                        insertSelection.selectionStart
                    ) + insertChar + insertValue.substring(insertSelection.selectionEnd);
                    const numValue = inputNumWithValidate(newValue, value().validateOptions);
                    if (numValue === null) {
                        return;
                    }
                    insertSelection.value = newValue;
                    insertSelection.setSelectionRange(insertIndex + 1, insertIndex + 1);
                    if (value().handleInput) {
                        value().handleInput!(newValue, numValue);
                    }
                    return;
                }
                const insertIndex = (e.target as HTMLInputElement).selectionStart || 0;
                const insertValue = (e.target as HTMLInputElement).value;
                let newValue = insertValue.substring(0, insertIndex) + insertChar + insertValue.substring(insertIndex);
                const numValue = inputNumWithValidate(newValue, value().validateOptions);
                if (numValue === null) {
                    return;
                }
                (e.target as HTMLInputElement).value = newValue;
                (e.target as HTMLInputElement).setSelectionRange(insertIndex + 1, insertIndex + 1);
                if (value().handleInput) {
                    value().handleInput!(newValue, numValue);
                }
                return;
            } else if (e.inputType === "deleteContentBackward" || e.inputType === "deleteContentForward") {
                e.preventDefault();
                const deleteSelection = (e.target as HTMLInputElement);
                if (deleteSelection.selectionStart !== null && 
                    deleteSelection.selectionEnd !== null && 
                    deleteSelection.selectionStart !== deleteSelection.selectionEnd) {
                    const deleteValue = deleteSelection.value;
                    const deleteIndex = deleteSelection.selectionStart;
                    let newValue = deleteValue.substring(
                        0, 
                        deleteSelection.selectionStart
                    ) + deleteValue.substring(deleteSelection.selectionEnd);
                    if (newValue === "") {
                        if (value().handleInput) {
                            value().handleInput!("", null);
                        }
                        return;
                    }
                    const numValue = inputNumWithValidate(newValue, value().validateOptions);
                    if (numValue === null) {
                        return;
                    }
                    deleteSelection.value = newValue;
                    (e.target as HTMLInputElement).setSelectionRange(deleteIndex, deleteIndex);
                    if (value().handleInput) {
                        value().handleInput!(newValue, numValue);
                    }
                    return;
                }
                switch (e.inputType) {
                    case "deleteContentBackward":
                        if (deleteSelection.selectionStart === 0) {
                            return;
                        }
                        const deleteIndexBackward = (e.target as HTMLInputElement).selectionStart || 0;
                        const valueBackward = (e.target as HTMLInputElement).value;
                        let newValue = valueBackward.substring(0, deleteIndexBackward - 1) + valueBackward.substring(deleteIndexBackward);
                        if (newValue === "") {
                            if (value().handleInput) {
                                value().handleInput!("", null);
                            }
                            return;
                        }
                        const numValue = inputNumWithValidate(newValue, value().validateOptions);
                        if (numValue === null) {
                            return;
                        }
                        deleteSelection.value = newValue;
                        (e.target as HTMLInputElement).setSelectionRange(deleteIndexBackward - 1, deleteIndexBackward - 1);
                        if (value().handleInput) {
                            value().handleInput!(newValue, numValue);
                        }
                        break;
                    case "deleteContentForward":
                        if (deleteSelection.selectionStart === deleteSelection.value.length) {
                            return;
                        }
                        const deleteIndexForward = (e.target as HTMLInputElement).selectionStart || 0;
                        const valueForward = (e.target as HTMLInputElement).value;
                        let newValueForward = valueForward.substring(0, deleteIndexForward) + valueForward.substring(deleteIndexForward + 1);
                        if (newValueForward === "") {
                            if (value().handleInput) {
                                value().handleInput!("", null);
                            }
                            return;
                        }
                        const numValueForward = inputNumWithValidate(newValueForward, value().validateOptions);
                        if (numValueForward === null) {
                            return;
                        }
                        deleteSelection.value = newValueForward;
                        (e.target as HTMLInputElement).setSelectionRange(deleteIndexForward, deleteIndexForward);
                        if (value().handleInput) {
                            value().handleInput!(newValueForward, numValueForward);
                        }
                        break;
                }
            }
    });
}

declare module "solid-js" {
    namespace JSX {
        interface Directives {
            preValidateNumInput: PreValidateNumInput;
        }
    }
}