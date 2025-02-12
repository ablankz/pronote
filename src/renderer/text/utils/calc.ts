export const fixFloatingPoint = (num: number, multiplier: number) => Math.round((num * multiplier) + Number.EPSILON);
