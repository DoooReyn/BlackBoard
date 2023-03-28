import { Graphics } from 'pixi.js';
import { View } from './view';

export class Layer extends View {
    protected _background : Graphics;

    constructor() {
        super();

        this._background = new Graphics();

        this.addChild( this._background );
    }

    override set interactive( v : boolean ) {
        super.interactive = v;

        const propagation = v ? this._preventPointerThrough : null;
        this.onpointercancel = this.onpointerdown = propagation;
        this.onpointerenter = this.onpointerleave = propagation;
        this.onpointermove = this.onpointerout = propagation;
        this.onpointerover = this.onpointertap = propagation;
        this.onpointerup = this.onpointerupoutside = propagation;
    }

    protected override _onInit() {
        super._onInit();

        this.interactive = true;

        this._background.beginFill( 0x0, 0.2 );
        this._background.drawRect( 0, 0, 1, 1 );
        this._background.endFill();

        this._listenWindowResizedEvent();
        this.onWindowResized();
    }

    protected override _onReset() {
        super._onReset();

        this.interactive = false;
        this._unListenWindowResizedEvent();
    }

    protected override onWindowResized() {
        super.onWindowResized();

        const screen = View.screenSize;
        this._background.scale.set( screen.width, screen.height );
        this._background.position.set( -screen.width * 0.5, -screen.height * 0.5 );
        this.position.set( screen.width * 0.5, screen.height * 0.5 );
    }

}