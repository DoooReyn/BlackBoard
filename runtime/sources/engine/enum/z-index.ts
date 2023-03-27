const MAX_Z_INDEX = Number.MAX_SAFE_INTEGER;

export enum EZIndex {
    Notice = MAX_Z_INDEX - 3,
    Loading = MAX_Z_INDEX - 2,
    Transition = MAX_Z_INDEX - 1,
    Stats = MAX_Z_INDEX
}