import { Container, Graphics, Text } from 'pixi.js';
import { EZIndex } from '../../enum';
import { NativeEventSystem } from '../system';
import { logger } from '../util';
import { View } from './view';

export class LoadingLayer extends View {
    protected _background : Graphics;
    protected _barBg : Graphics;
    protected _barFg : Graphics;
    protected _barRate : Text;
    protected _bar : Container;

    constructor() {
        super();

        this._background = new Graphics();
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
        this.addChild( this._background, this._bar );
    }

    public set progress( rate : number ) {
        this._barFg.scale.x = Math.max( 0, Math.min( rate, 1 ) );
        this._barRate.text = `${ ( ( rate * 1000 ) | 0 ) / 10 }%`;
    }

    protected override _onInit() {
        super._onInit();

        this.interactive = true;
        this.renderable = false;
        this.zIndex = EZIndex.Loading;
        this.on( 'pointertap', () => {logger.info( this.name, 'pointertap' );} );
        this.cursor = 'pointer';

        this._background.beginFill( 0xffffff, 0.01 );
        this._background.drawRect( 0, 0, 1, 1 );
        this._background.endFill();

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

        NativeEventSystem.shared.onWindowResized.connect( this.onWindowResized, this );
        this.onWindowResized();
    }

    protected override _onReset() {
        super._onReset();

        NativeEventSystem.shared.onWindowResized.disconnect( this.onWindowResized, this );
    }

    protected override onWindowResized() {
        super.onWindowResized();

        const screen = View.screenSize;
        this._background.scale.set( screen.width, screen.height );
        this._background.position.set( -screen.width * 0.5, -screen.height * 0.5 );
        this._bar.y = View.screenSize.height * 0.5 - 40;
        this.position.set( screen.width * 0.5, screen.height * 0.5 );
    }
}