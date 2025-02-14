import { fixFloatingPoint } from "./calc";

export interface InputNumWithValidateOptions {
    precision?: number;
    max?: number;
    min?: number;
}

const defaultPrecision = 0;

export const inputNumWithValidate = (
    rawValue: string,
    options: InputNumWithValidateOptions = {}
): number|null => {
    rawValue = rawValue.trim().toLowerCase();

    if (rawValue === "-" && (options.min || 0) < 0) {
        return NaN;
    }

    if (rawValue.split(".").length > 2) {
        return null;
    }

    let numValue = parseFloat(rawValue);
    if (isNaN(numValue)) {
        return null;
    }

    const eIndex = rawValue.indexOf("e");
    const eAfter = eIndex === -1 ? "" : rawValue.slice(eIndex + 1);
    rawValue = eIndex === -1 ? rawValue : rawValue.slice(0, eIndex);

    let additionalStr = "";

    const decimalIndex = rawValue.indexOf(".");
    if (decimalIndex !== -1) {
        if (options.precision === 0) return null;
        if (decimalIndex === rawValue.length - 1) {
            additionalStr = ".";
        } else {
            const decimalAfter = rawValue.slice(decimalIndex);
            if (decimalAfter.length - 1 > (options.precision || defaultPrecision)) {
                return null;
            }
            for (let i = decimalAfter.length - 1; i >= 0; i--) {
                if (decimalAfter[i] === "0") {
                    additionalStr += "0";
                } else if (decimalAfter[i] === ".") {
                    additionalStr = "." + additionalStr;
                    break;
                } else {
                    break;
                }
            }
        }
    }

    let prefix = "";

    const minusIndex = rawValue.indexOf("-");
    if (minusIndex !== -1) {
        if (minusIndex !== 0) {
            return null;
        }
        const minusAfter = rawValue.slice(1);
        if (/^0*\.?0*$/.test(minusAfter)) {
            prefix = "-";
        }
    }

    if (eIndex !== -1) {
        // TODO: Implement this
        return null;
        // const eStr = rawValue.slice(eIndex);
        // if (eStr.length !== 1) {
        //     const eNum = parseInt(eStr.slice(1));
        //     if (isNaN(eNum)) {
        //         return null;
        //     }
        //     numValue = numValue * 10 ** eNum;
        // }
        // return numValue;
    }

    const precision = options.precision || defaultPrecision;
    numValue = fixFloatingPoint(numValue, 10 ** precision) / 10 ** precision;

    if (prefix + numValue.toString() + additionalStr !== rawValue) {
        return null;
    }

    if (options.max !== undefined && numValue > options.max) {
        return null;
    }
    if (options.min !== undefined && numValue < options.min) {
        return null;
    }
    return numValue;
};