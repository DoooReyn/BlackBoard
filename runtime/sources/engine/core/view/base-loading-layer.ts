import { EZIndex } from '../../enum';
import { Layer } from './layer';

export abstract class BaseLoadingLayer extends Layer {
    public abstract set progress( rate : number );

    protected override _onInit() {
        super._onInit();

        this.visible = false;
        this.zIndex = EZIndex.Loading;
    }
}
