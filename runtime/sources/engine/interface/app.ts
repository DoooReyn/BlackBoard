import {
    Container,
    DisplayObject,
    IApplicationOptions,
    ICanvas,
    IRenderer,
    Rectangle,
    Ticker
} from 'pixi.js';
import { SizeData } from './size-impl';

export interface IGameOptions extends IApplicationOptions {
    // Fallbacks of the canvas element in DOM
    canvasFallbacks? : string[];
    debugMode? : boolean;
    width : number;
    height : number;
    maxFPS : number;
    minFPS : number;
}

export interface IStats extends Container {
    context : IGame;

    drawTarget( o : DisplayObject ) : void;

    clearDraw() : void;

    hide() : void;

    show() : void;

    update( delta : number ) : void;

    get drawcalls() : number;

    get fps() : number;

    get textureUsed() : number;
}

export interface IScene extends Container {
    context : IGame;
}

export interface IView {
    readonly canvas : ICanvas;
    readonly renderer : IRenderer;
    readonly screen : Rectangle;
    readonly resolution : SizeData;
}

export interface IGame {
    view : IView;
    ticker : Ticker;
    readonly scene : IScene;
    readonly stats : IStats;

    get debug() : boolean;
}
