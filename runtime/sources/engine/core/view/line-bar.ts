import { Rectangle } from 'pixi.js';
import { prefills } from '../util';
import {
    IProgressBarBaseOptions, IProgressBarTriggerOptions, ProgressBar,
} from './progress-bar';

export enum ELineBarDirection {
    Positive, Negative
}

export enum ELineBarLayout {
    Horizontal, Vertical
}

export interface ILineBarBaseOptions extends IProgressBarBaseOptions {
    direction? : ELineBarDirection;
    layout? : ELineBarLayout;
}

export interface ILineBarOptions extends ILineBarBaseOptions,
                                         IProgressBarTriggerOptions {}

/**
 * TODO: Adding supports for the Direction
 * Layout: Horizontal/Vertical
 * Direction: Positive/Negative
 */
export class LineBar extends ProgressBar {
    constructor( options : ILineBarOptions ) {
        super( options );

        prefills( options, [
            [ 'layout', ELineBarLayout.Horizontal ],
            [ 'direction', ELineBarDirection.Positive ],
        ] );

        this._preserveKeys( options, [ 'layout', 'direction' ] );
    }

    get layout() {
        return this._options.layout;
    }

    set layout( l : ELineBarLayout ) {
        this._options.layout = l;
    }

    get direction() {
        return this._options.direction;
    }

    set direction( d : ELineBarDirection ) {
        this._options.direction = d;
    }

    protected override _onProgressChanged() {
        super._onProgressChanged();

        const {
            width,
            height,
        } = this._foreground.texture.baseTexture;
        // TODO: Direction/Layout
        this._foreground.texture.frame = new Rectangle( 0, 0, width * this._progress, height );
    }

    protected override _onTextureLoaded() {
        super._onTextureLoaded();

        const texture = this._foreground.texture;
        texture.frame.width = texture.baseTexture.width * this._progress;
        this._foreground.position.x = ( this._background.width - texture.baseTexture.width ) * 0.5;
    }

    protected override _options : ILineBarBaseOptions;
}