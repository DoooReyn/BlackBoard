import { NativeEvent, SystemEvent } from '../../enum';
import { IGame, IScene } from '../../interface';
import { SizeBox } from '../box';
import { EventBus } from '../util';

export class Scene extends SizeBox implements IScene {
    context : IGame;
    private _tmo : any;

    constructor( context : IGame ) {
        super( {
            width: context.view.screen.width,
            height: context.view.screen.height,
            anchorX: 0.5,
            anchorY: 0.5, // for test
            backgroundColor: 0xffffff,
            backgroundAlpha: 0.5
        } );

        this._tmo = null;
        this.context = context;
    }

    protected override _onAdded() {
        super._onAdded();
        this.registerSystemEvent();
        this._onWindowSizeChanged();
    }

    /**
     * 注册系统事件
     * @protected
     */
    protected registerSystemEvent() {
        window.addEventListener( NativeEvent.Resize, this._onWindowSizeChanged.bind( this ) );
        document.addEventListener( NativeEvent.Visibility, this._onWindowVisibilityChanged.bind( this ) );
    }

    /**
     * 屏幕尺寸变化回调
     * @private
     */
    private _onWindowSizeChanged() {
        if ( this._tmo === null ) {
            this._tmo = setTimeout( () => {
                clearTimeout( this._tmo );
                this._tmo = null;
                this.fitScreen();
            }, 10 );
        }
    }

    /**
     * 屏幕可见性变化回调（前台/后台）
     * @private
     */
    private _onWindowVisibilityChanged() {
        document.visibilityState === 'hidden' ? this.onexit() : this.onenter();
    }

    /**
     * 屏幕适配
     * - 可以重写此方法做自定义的屏幕适配方案
     * @public
     */
    public fitScreen() {
        const { innerWidth: width, innerHeight: height } = window;
        this.resize( width, height );
    }

    public override resize( w : number, h : number ) {
        this.context.view.renderer.resize( w, h );
        super.resize( w, h );
        this._refresh();
        EventBus.shared.emit( SystemEvent.Resize );
    }

    /**
     * As `Scene`, changing `anchor` will never work.
     * @protected
     */
    protected override _onAnchorChanged() {
    }

    /**
     * Scene will keep at the center of screen
     */
    public override _refresh() {
        const width = this._size.width * 0.5;
        const height = this._size.height * 0.5;
        this.transform.pivot.set( width, height );
        this.transform.position.x = width;
        this.transform.position.y = height;
        this._draw();
    }

    protected onenter() {
        EventBus.shared.emit( SystemEvent.Enter );
    }

    protected onexit() {
        EventBus.shared.emit( SystemEvent.Exit );
    }
}