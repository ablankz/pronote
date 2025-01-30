import { maxPercentage, minPercentage, minPx, percentagePrecision, pxPrecision } from "../components/block/const";
import { SizeValue } from "../components/block/type";
import { fixFloatingPoint } from "./calc";

export const convertSizeUnit = (value: number, unit: SizeValue["unit"], to: SizeValue["unit"], max: number) => {
    if (unit === to) {
        return value;
    }
    if (to === "%") {
        return convertToPercentage(value, unit, max);
    }
    return convertToPx(value, unit, max);
}

export const sizeValidator = (value: number, unit: SizeValue["unit"]) => {
    switch (unit) {
        case "%":
        return value >= minPercentage && value <= maxPercentage;
        case "px":
        return value >= minPx;
    }
}

export const sizeValidValue = (value: number, unit: SizeValue["unit"]): number => {
    switch (unit) {
        case "%":
        return Math.min(maxPercentage, Math.max(minPercentage, value));
        case "px":
        return Math.max(minPx, value);
    }
}

export const safeConvertSizeUnit = (value: number, unit: SizeValue["unit"], to: SizeValue["unit"], max: number) => {
    console.log(value, unit, to, max);
    const noValidValue = convertSizeUnit(value, unit, to, max);
    return sizeValidValue(noValidValue, to);
}

export const convertToPx = (value: number, unit: SizeValue["unit"], max: number) => {
    switch (unit) {
        case "%":
        const val = (value / 100) * max;
        return fixFloatingPoint(val, 10 ** pxPrecision) / 10 ** pxPrecision;
        case "px":
        return value;
    }
}

export const convertToPercentage = (value: number, unit: SizeValue["unit"], max: number) => {
    switch (unit) {
        case "%":
        return value;
        case "px":
        const val = (value / max) * 100;
        return fixFloatingPoint(val, 10 ** percentagePrecision) / 10 ** percentagePrecision;
    }
}