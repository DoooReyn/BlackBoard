import { SecUpdateValue } from './sec-update-value';

/**
 * The calculation of FPS
 */
export class FPS extends SecUpdateValue {
    public override update() {
        ++this._count;
        super.update();
    }
}