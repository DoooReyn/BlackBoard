import { Assets, Rectangle } from 'pixi.js';
import { Director, NativeEventSystem } from '../system';
import {
    clone, ILoadingItems, Loading, logger, prefills, Signals,
} from '../util';
import { BaseLoadingLayer } from './base-loading-layer';
import { View } from './view';

export type TSceneOperation = 'squeezed' | 'restored' | 'purged';

export type TSceneTrigger = ( type : TSceneOperation ) => void;

export interface ISceneOptions {
    // Assets to preload
    preloads? : ILoadingItems;
    // Assets to release
    releases? : string[];
    // Custom loading layer
    customLoadingLayer? : BaseLoadingLayer;
    // Whether using loading layer or not
    useLoadingLayer? : boolean;
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
            [ 'useLoadingLayer', false ],
        ] );

        return new Promise( ( resolve ) => {
            let loading : BaseLoadingLayer = null;
            if ( options.useLoadingLayer ) {
                loading = options.customLoadingLayer || Director.shared.loadingLayer;
                loading.progress = 0;
                loading.show();
            }
            Loading.shared.load( options.preloads, ( progress ) => {
                loading && ( loading.progress = progress );
            }, ( result ) => {
                logger.info( result );
                loading && loading.hide();
                return resolve( new this( options ) );
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
        const {
            width,
            height,
        } = Scene.screenSize;
        this.position.set( width * 0.5, height * 0.5 );
        this.hitArea = new Rectangle( -width * 0.5, -height * 0.5, width, height );
    }
}