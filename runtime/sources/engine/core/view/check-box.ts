import { Container, Texture } from 'pixi.js';
import { Signals } from '../util';
import { Button, IButtonBaseOptions, IButtonTriggerOptions } from './button';

export interface ICheckBoxBaseOptions<T extends Container> extends IButtonBaseOptions {
    checkedMark : T;
}

export type TCheckBoxTrigger<T extends Container> = ( box : CheckBox<T>, checked : boolean ) => void;

export interface ICheckBoxTriggerOptions<T extends Container> extends IButtonTriggerOptions {
    onCheckedChanged? : TCheckBoxTrigger<T>;
}

export interface ICheckBoxOptions<T extends Container> extends ICheckBoxBaseOptions<T>,
                                                               ICheckBoxTriggerOptions<T> {}

export class CheckBox<T extends Container> extends Button {
    public onCheckedChanged : Signals<TCheckBoxTrigger<T>>;
    public checkedMark : T;

    constructor( options : ICheckBoxOptions<T> ) {
        super( options );

        this.onCheckedChanged = new Signals<TCheckBoxTrigger<T>>();
        options.onCheckedChanged && this.onCheckedChanged.connect( options.onCheckedChanged );

        this.checkedMark = options.checkedMark;
        this.addChild( this.checkedMark );

        this._checked = false;
        this.checkedMark.visible = false;
    }

    protected _checked : boolean;

    get checked() {
        return this._checked;
    }

    set checked( en : boolean ) {
        this._checked = en;
        this.checkedMark.visible = en;
        this.onCheckedChanged.emit( this, en );
    }

    protected override _onInit() {
        super._onInit();

        this.onPressTap.connect( this._onCheckedChanged, this );
    }

    protected override _onReset() {
        super._onReset();

        this.onPressTap.disconnect( this._onCheckedChanged, this );
    }

    protected override _onTextureLoaded( texture : Texture ) {
        super._onTextureLoaded( texture );

        this.checkedMark.position.set( texture.width * 0.5, texture.height * 0.5 );
    }

    protected _onCheckedChanged() {
        this.checked = !this._checked;
    }
}