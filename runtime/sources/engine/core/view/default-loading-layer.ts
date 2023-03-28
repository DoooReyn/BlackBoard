import { Container, Graphics, Text } from 'pixi.js';
import { EZIndex } from '../../enum';
import { BaseLoadingLayer } from './base-loading-layer';
import { View } from './view';

export class DefaultLoadingLayer extends BaseLoadingLayer {
    protected _barBg : Graphics;
    protected _barFg : Graphics;
    protected _barRate : Text;
    protected _bar : Container;

    constructor() {
        super();

        this._bar = new Container();
        this._barBg = new Graphics();
        this._barFg = new Graphics();
        this._barRate = new Text( '0%', {
            fontFamily: 'Monaco',
            fontWeight: 'bold',
            fontSize: 16,
            fill: 0x1e2732,
        } );

        this._bar.addChild( this._barBg, this._barFg, this._barRate );
        this.addChild( this._bar );
    }

    protected override _onInit() {
        super._onInit();

        this.visible = false;
        this.zIndex = EZIndex.Loading;

        const width = 400, height = 32;
        this._barBg.beginFill( 0xfce38a );
        this._barBg.lineStyle( 1 );
        this._barBg.drawRect( 0, 0, width, height );
        this._barBg.endFill();
        this._barFg.beginFill( 0xf38181 );
        this._barFg.drawRect( 0.5, 0.5, width - 1, height - 1 );
        this._barFg.endFill();
        this._barFg.scale.x = 0;
        this._barRate.anchor.set( 0.5 );
        this._barRate.position.set( width * 0.5, height * 0.5 );
        this._bar.transform.pivot.set( width * 0.5, height * 0.5 );
    }

    public set progress( rate : number ) {
        this._barFg.scale.x = Math.max( 0, Math.min( rate, 1 ) );
        this._barRate.text = `${ ( ( rate * 1000 ) | 0 ) / 10 }%`;
    }

    protected override onWindowResized() {
        super.onWindowResized();

        this._bar.y = View.screenHeight * 0.5 - 40;
    }
}