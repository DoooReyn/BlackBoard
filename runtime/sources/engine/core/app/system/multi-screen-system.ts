/**
 * A system for adapting to multiple screen sizes
 */
import { ENativeEvent, ESystemEvent } from '../../../enum';
import type { Engine } from '../engine';
import { SecUpdateValue } from '../internal/sec-update-value';
import { NewsSystem } from './news-system';
import { ESystemPriority, System } from './system';

export class MultiScreenSystem extends System {
    private _sizeChanged : boolean;
    private _lastTime : number;
    private readonly _onWindowResizeFn : Function;

    constructor() {
        super();

        this._sizeChanged = false;
        this._lastTime = SecUpdateValue.now;
        this._onWindowResizeFn = this._onWindowResize.bind( this );
    }

    private static _shared : MultiScreenSystem = null;

    public static get shared() {
        if ( !MultiScreenSystem._shared ) {
            MultiScreenSystem._shared = new MultiScreenSystem();
        }
        return MultiScreenSystem._shared;
    }

    protected override _onAttached( engine : Engine ) {
        super._onAttached( engine );

        // @ts-ignore
        window.addEventListener( ENativeEvent.Resize, this._onWindowResizeFn );
    }

    protected _onDetached() : void {
        // @ts-ignore
        window.removeEventListener( ENativeEvent.Resize, this._onWindowResizeFn );
    }

    protected _onPaused() : void {
    }

    protected _onResumed() : void {
    }

    protected _onStarted() : void {
        this._sizeChanged = true;
    }

    public get priority() : number {
        return ESystemPriority.MultiScreen;
    }

    public update( _ : number ) : void {
        if ( SecUpdateValue.now - this._lastTime >= 1000 ) {
            this._lastTime = SecUpdateValue.now;
            if ( this._sizeChanged ) {
                this._sizeChanged = false;
                this._resize();
            }
        }
    }

    protected _onWindowResize() {
        this._sizeChanged = true;
    }

    /**
     * Resizing to fit for multiple screen.
     * - Overriding this interface to apply your own solution
     * @protected
     */
    protected _resize() {
        const {
            clientWidth: width, clientHeight: height,
        } = document.documentElement;
        this.app.stage.transform.pivot.set( width * 0.5, height * 0.5 );
        this.app.renderer.resize( width, height );
        NewsSystem.shared.push( ESystemEvent.Resize, { width, height } );
    }

}