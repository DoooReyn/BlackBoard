import { Engine } from '../engine';
import { Signals } from '../util';
import { BaseLoadingLayer, DefaultLoadingLayer, Scene } from '../view';
import { ESystemPriority, System } from './system';

export type TStackOperation = 'run' | 'push' | 'pop';
export type TStackTrigger = ( type : TStackOperation, current : Scene, prev : Scene | null ) => void;

export class Director extends System {
    public onStackSignal : Signals<TStackTrigger>;
    public loadingLayer : BaseLoadingLayer;
    protected _stack : Scene[];

    protected constructor() {
        super();

        this.onStackSignal = new Signals<TStackTrigger>();
        this._stack = [];
    }

    private static _shared : Director;

    public static get shared() {
        if ( !Director._shared ) {
            Director._shared = new Director();
        }
        return Director._shared;
    }

    public get runningScene() {
        if ( this._stack.length === 0 ) return null;
        return this._stack[ this._stack.length - 1 ];
    }

    public runScene( scene : Scene ) {
        if ( !Engine.shared || this.runningScene === scene ) return false;

        if ( this._stack.length > 0 ) this.purgeScene();

        this._stack.push( scene );
        Engine.shared.root.addChild( scene );
        this.onStackSignal.emit( 'run', scene, null );

        return true;
    }

    public purgeScene() {
        this._stack.reverse().forEach( v => v.onStackOperatedSignal.emit( 'purged' ) );
        this._stack.length = 0;
    }

    public pushScene( scene : Scene ) {
        if ( this._stack.indexOf( scene ) > -1 ) return false;

        this.runningScene && this.runningScene.onStackOperatedSignal.emit( 'squeezed' );
        this.onStackSignal.emit( 'push', scene, this.runningScene );
        this._stack.push( scene );
        Engine.shared.root.addChild( scene );

        return true;
    }

    public popScene() {
        if ( this._stack.length > 0 ) {
            const top = this._stack[ this._stack.length - 1 ];
            const cur = this._stack[ this._stack.length - 2 ];
            this.onStackSignal.emit( 'pop', cur, top );
            top.onStackOperatedSignal.emit( 'purged' );
            cur && cur.onStackOperatedSignal.emit( 'restored' );
            this._stack.length = this._stack.length - 1;
        }
    }

    public replaceDefaultLoadingLayer( layer : BaseLoadingLayer ) {
        layer.setParent( this.loadingLayer.parent );
        this.loadingLayer.destroy();
        this.loadingLayer = layer;
    }

    protected _onAttached( _engine : Engine ) : void {
        this.loadingLayer = _engine.root.addChild( new DefaultLoadingLayer() );
    }

    protected _onDetached( _engine : Engine ) : void {
        this.purgeScene();
        this.loadingLayer.destroy();
        this.onStackSignal.disconnectAll();
        this.loadingLayer = null;
        this.onStackSignal = null;
    }

    protected _onPaused( _engine : Engine ) : void {
    }

    protected _onResumed( _engine : Engine ) : void {
    }

    protected _onStarted( _engine : Engine ) : void {
    }

    public frameUpdate( _engine : Engine, delta : number ) : void {
        this._stack.forEach( v => {
            v.frameUpdate( delta );
        } );
    }

    public get priority() : number {
        return ESystemPriority.Director;
    }

    public secUpdate( _engine : Engine, delta : number ) : void {
        this._stack.forEach( v => {
            v.secUpdate( delta );
        } );
    }
}