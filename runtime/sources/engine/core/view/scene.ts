import { Assets } from 'pixi.js';
import { Engine } from '../engine';
import { Director, NativeEventSystem } from '../system';
import {
    clone, ILoadingItems, Loading, logger, prefills, Signals,
} from '../util';
import { View } from './view';

export type TSceneOperation = 'squeezed' | 'restored' | 'purged';

export type TSceneTrigger = ( type : TSceneOperation ) => void;

export interface ISceneOptions {
    preloads? : ILoadingItems;
    transition? : string;
    releases? : string[];
}

export class Scene extends View {
    public onStackOperatedSignal : Signals<TSceneTrigger>;
    protected _options : ISceneOptions;

    protected constructor( options : ISceneOptions ) {
        super();

        this._options = clone( options );
        this.onStackOperatedSignal = new Signals<TSceneTrigger>();
        this._top = false;
    }

    private _top : boolean;

    public get top() {
        return this._top;
    }

    static async create( options : ISceneOptions ) : Promise<Scene> {
        prefills( options, [
            [ 'transition', 'default' ],
        ] );

        Director.shared.defaultLoadingLayer.progress = 0;
        Director.shared.defaultLoadingLayer.show();
        return new Promise( ( resolve ) => {
            Loading.shared.load( options.preloads, ( progress ) => {
                logger.info( progress );
                Director.shared.defaultLoadingLayer.progress = progress;
            }, ( result ) => {
                logger.info( result );
                setTimeout( () => {
                    Director.shared.defaultLoadingLayer.hide();
                    return resolve( new this( options ) );
                }, 100 );
            } );
        } );
    }

    protected _onStackOperated( type : TSceneOperation ) {
        switch ( type ) {
            case 'squeezed':
                this._onSqueezed();
                break;
            case 'restored':
                this._onRestored();
                break;
            case 'purged':
                this._onPurged();
                break;
        }
    }

    protected _onSqueezed() {
        this._top = false;
        this.renderable = false;
    }

    protected _onRestored() {
        this._top = true;
        this.renderable = true;
    }

    protected _onPurged() {
        this._top = false;
        this.renderable = false;
        this.destroy();
    }

    protected override _onCleanup() {
        this._onReset();
    }

    protected override _onInit() {
        this.onStackOperatedSignal.connect( this._onSqueezed, this );
        NativeEventSystem.shared.onWindowResized.connect( this.onWindowResized, this );
        this.onWindowResized();
    }

    protected override _onReset() {
        this.onStackOperatedSignal.disconnect( this._onSqueezed, this );
        NativeEventSystem.shared.onWindowResized.disconnect( this.onWindowResized, this );
        if ( this._options.releases ) {
            Assets.unload( this._options.releases ).then( ( resources ) => {
                logger.debug( this.name, 'release resources: ', resources );
            } );
        }
    }

    protected override onWindowResized() {
        this.position.set( Engine.shared.renderer.width * 0.5, Engine.shared.renderer.height * 0.5 );
    }
}