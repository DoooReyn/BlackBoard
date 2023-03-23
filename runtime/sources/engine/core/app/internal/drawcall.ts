import { Renderer } from 'pixi.js';
import { SecUpdateValue } from './sec-update-value';

/**
 * The calculation of Drawcalls
 */
export class Drawcall extends SecUpdateValue {
    /**
     * Binding the PixiJS renderer to record the called counts of the
     * drawing command
     * @param {Renderer} renderer
     */
    public bindRenderer( renderer : Renderer ) {
        if ( renderer.gl ) {
            const { drawElements } = renderer.gl;
            renderer.gl.drawElements = ( ...args : any[] ) => {
                // @ts-ignore
                drawElements.call( renderer.gl, ...args );
                ++this._count;
            };
        }
    }

    public override update() {
        super.update();
        this._count = 0;
    }
}