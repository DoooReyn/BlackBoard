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
        this._changeTextureFrame();
    }

    get direction() {
        return this._options.direction;
    }

    set direction( d : ELineBarDirection ) {
        this._options.direction = d;
        this._changeTextureFrame();
    }

    protected override _onProgressChanged() {
        super._onProgressChanged();
        this._changeTextureFrame();
    }

    protected override _onTextureLoaded() {
        super._onTextureLoaded();

        this._changeTextureFrame();
    }

    protected _changeTextureFrame() {
        const {
            width: fw,
            height: fh,
        } = this._foreground.texture.baseTexture;

        const {
            width: bw,
            height: bh,
        } = this._background.texture.baseTexture;

        this._foreground.position.x = ( bw - fw ) * 0.5;
        this._foreground.position.y = ( bh - fh ) * 0.5;

        let frame = new Rectangle( 0, 0, 0, 0 );
        if ( this.layout === ELineBarLayout.Horizontal ) {
            frame.width = ( fw * this._progress ) | 0;
            frame.height = fh;
            if ( this.direction === ELineBarDirection.Negative ) {
                this._foreground.anchor.set( 1, 0 );
                this._foreground.x = ( bw + fw ) * 0.5;
            } else {
                this._foreground.anchor.set( 0, 0 );
            }
        } else {
            frame.width = fw;
            frame.height = ( fh * this._progress ) | 0;
            if ( this.direction === ELineBarDirection.Negative ) {
                this._foreground.anchor.set( 0, 1 );
                this._foreground.y = ( bh + fh ) * 0.5;
            } else {
                this._foreground.anchor.set( 0, 0 );
            }
        }

        this._foreground.texture.frame = frame;
    }
}