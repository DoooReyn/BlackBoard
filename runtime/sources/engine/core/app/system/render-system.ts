import { Renderer } from 'pixi.js';
import type { Engine } from '../engine';
import { Director } from '../internal/director';
import { Stats } from '../internal/stats';
import { ESystemPriority, System } from './system';

/**
 * A system for rendering
 */
export class RenderSystem extends System {
    public director : Director;
    private _stats : Stats;

    constructor() {
        super();

        this._stats = new Stats();
    }

    private static _shared : RenderSystem = null;

    public static get shared() {
        if ( !RenderSystem._shared ) {
            RenderSystem._shared = new RenderSystem();
        }
        return RenderSystem._shared;
    }

    /**
     * Showing the container of Stats
     */
    public showStats() {
        this._stats.renderable = true;
    }

    /**
     * Hiding the container of Stats
     */
    public hideStats() {
        this._stats.renderable = false;
    }

    protected override _onAttached( engine : Engine ) {
        this._stats.setParent( engine.root );
        this._stats.init( engine.renderer as Renderer );
        engine.debug ? this.showStats() : this.hideStats();

        this.director = Director.shared;
    }

    protected _onDetached() : void {
        this._stats.removeFromParent();
    }

    protected _onPaused() : void {
    }

    protected _onResumed() : void {
    }

    protected _onStarted() : void {
    }

    public frameUpdate( _engine : Engine, _delta : number ) : void {
        this._stats.update();
    }

    public get priority() : number {
        return ESystemPriority.Render;
    }

    public secUpdate( _engine : Engine, _delta : number ) : void {
    }
}