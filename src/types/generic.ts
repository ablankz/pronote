export interface Range{
    start: number;
    end: number;
}

export interface RangeWithDirection extends Range{
    direction: "forward" | "backward";
}

export interface RangeWithCurrent extends RangeWithDirection{
    current: number;
}