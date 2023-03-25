import { Singleton } from '../../util';
import { Engine } from '../engine';
import { Scene } from './scene';

export class Director extends Singleton<Director>() {

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
            Engine.shared.root.addChild( this._runningScene );
        }
    }

    public update( delta : number ) {
        this._runningScene && this._runningScene.update( delta );
    }
}