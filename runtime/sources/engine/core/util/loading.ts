import { Assets } from 'pixi.js';
import { removeInvalidOfMap, Singleton } from './index';

type TBundleID = string;
type TResAlias = string;
type TResUrl = string;

export interface ILoadingItems {
    basePath? : string;
    bundles? : [ TBundleID, [ TResAlias, TResUrl ][] ][];
    scattered? : [ TResAlias, TResUrl ][];
}

type TLoadingProgress = ( progress : number ) => void;

type TLoadingComplete = ( result : { passes : Record<string, any>; fails : string[] | null } ) => void;

export class Loading extends Singleton<Loading>() {
    protected _onProgressCb : TLoadingProgress;
    protected _onCompleteCb : TLoadingComplete;
    private readonly _resourcesList : string[];
    private _loading : boolean;

    constructor() {
        super();
        this._loading = false;
        this._resourcesList = [];
    }

    /**
     * 加载资源
     * - TODO: video/sound/spine not included
     * @param {ILoadingItems} items
     * @param {TLoadingProgress} onprogress
     * @param {TLoadingComplete} oncomplete
     */
    load( items : ILoadingItems, onprogress? : TLoadingProgress, oncomplete? : TLoadingComplete ) {
        if ( this._loading ) return;

        this._loading = false;
        this._resourcesList.length = 0;
        this._onProgressCb = onprogress;
        this._onCompleteCb = oncomplete;

        let scattered : string[] = [];

        if ( items.basePath ) {
            Assets.resolver.basePath = items.basePath;
        }

        if ( items.bundles ) {
            items.bundles.forEach( v => {
                const [ id, info ] = v;
                info.forEach( res => {
                    const [ alias, url ] = res;
                    const aliasBundle = `${ id }-${ alias }`;
                    Assets.add( [ alias, aliasBundle ], url );
                    this._resourcesList.push( alias );
                    scattered.push( alias );
                } );
            } );
        }

        if ( items.scattered ) {
            items.scattered.forEach( v => {
                const [ alias, url ] = v;
                Assets.add( alias, url );
                scattered.push( alias );
                this._resourcesList.push( alias );
            } );
        }

        Assets.load( scattered, ( progress : number ) => {
            this._onLoadingProgress( progress );
        } ).then( ( resources : Record<string, any> ) => {
            this._onLoadingComplete( resources );
        } );
    }

    protected _onLoadingProgress( progress : number ) {
        this._onProgressCb && this._onProgressCb.call( null, progress );
    }

    protected _onLoadingComplete( resources : Record<string, any> ) {
        this._onCompleteCb && this._onCompleteCb.call( null, removeInvalidOfMap( resources ) );

        this._onProgressCb = null;
        this._onCompleteCb = null;
        this._loading = false;
        this._resourcesList.length = 0;
    }
}

