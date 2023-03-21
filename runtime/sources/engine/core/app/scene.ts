import { SystemEvent } from '../../enum';
import { IGame, IScene } from '../../interface';
import { Box } from '../box';
import { EventBus } from '../util';

export class Scene extends Box implements IScene {
    context : IGame;
    private _tmo : any;

    constructor( context : IGame ) {
        super( {
            width: context.view.screen.width,
            height: context.view.screen.height,
            anchorX: 0.5,
            anchorY: 0.5,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        } );

        this.context = context;
        this.resize( this.context.view.screen );

        window.addEventListener( 'resize', this._onSizeChanged.bind( this ) );
        document.addEventListener( 'visibilitychange', () => {
            document.visibilityState === 'hidden' ? this.onexit() : this.onenter();
        } );
        this._onSizeChanged();
    }

    private _onSizeChanged() {
        if ( !this._tmo ) {
            this._tmo = setTimeout( () => {
                const { innerWidth: width, innerHeight: height } = window;
                this.context.view.renderer.resize( width, height );
                this.resize( width, height );
                // this.pivot.set( width * 0.5, height * 0.5 );
                EventBus.shared.emit( SystemEvent.Resize );
                clearTimeout( this._tmo );
                this._tmo = null;
            }, 100 );
        }
    }

    protected override _onBoundaryChanged() {
        this.resize(this.context.view.screen);
    }

    protected override _onAnchorChanged() {
        this.x = this.context.view.screen.width * 0.5;
        this.y = this.context.view.screen.height * 0.5;
    }

    protected onenter() {
        EventBus.shared.emit( SystemEvent.Enter );
    }

    protected onexit() {
        EventBus.shared.emit( SystemEvent.Exit );
    }

    protected override onadded() {
        super.onadded();

        EventBus.shared.emit( SystemEvent.Resize );
    }
}