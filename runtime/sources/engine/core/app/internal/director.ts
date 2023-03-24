import { Container } from 'pixi.js';
import { Singleton } from '../../util';
import { Scene } from './scene';

export class Director extends Singleton<Director>() {
    protected _root : Container;

    protected constructor() {
        super();

    }

    protected _runningScene : Scene;

    get runningScene() {
        return this._runningScene;
    }

    init( stage : Container ) {
        if ( !this._root ) {
            this._root = stage;
        }
    }

    runScene( scene : Scene ) {
        if ( scene !== this._runningScene ) {
            if ( this._runningScene ) {
                this._runningScene.destroy();
            }
            this._runningScene = scene;
            this._root.addChild( this._runningScene );
        }
    }

    update( delta : number ) {
        this._runningScene && this._runningScene.update( delta );
    }
}