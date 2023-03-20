export interface SizeData {
    width : number;
    height : number;
}

export interface SizeFold {
    size : SizeData;
}

export type SizeLike = SizeFold | SizeData;