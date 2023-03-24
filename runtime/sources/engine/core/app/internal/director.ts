import { Singleton } from '../../util';
import { EngineInstance } from '../engine';
import { Scene } from './scene';

export class Director extends Singleton<Director>() {
    public get root() {
        return EngineInstance ? EngineInstance[ '_app' ].stage : null;
    }

    public get renderer() {
        return EngineInstance ? EngineInstance.renderer : null;
    }

    public get screen() {
        return EngineInstance ? EngineInstance.renderer.screen : null;
    }

    protected _runningScene : Scene;

    public get runningScene() {
        return this._runningScene;
    }

    public runScene( scene : Scene ) {
        if ( scene !== this._runningScene ) {
            if ( this._runningScene ) {
                this._runningScene.destroy();
            }
            this._runningScene = scene;
            this.root.addChild( this._runningScene );
        }
    }

    public update( delta : number ) {
        this._runningScene && this._runningScene.update( delta );
    }
}