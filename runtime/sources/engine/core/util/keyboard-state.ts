export class KeyboardState {
    private readonly _keys : Record<string, boolean>;

    constructor() {
        this._caseSensitive = true;
        this._keys = Object.create( null );
    }

    private _caseSensitive : boolean;

    get caseSensitive() {
        return this._caseSensitive;
    }

    set caseSensitive( en : boolean ) {
        this._caseSensitive = en;
    }

    set enabled( en : boolean ) {
        if ( en ) {
            document.addEventListener( 'keydown', this._onKeyDown, false );
            document.addEventListener( 'keyup', this._onKeyUp, false );
        } else {
            document.removeEventListener( 'keydown', this._onKeyDown, false );
            document.removeEventListener( 'keyup', this._onKeyUp, false );
        }
    }

    isKeyPressed( key : string ) {
        if ( this._caseSensitive ) {
            return this._keys[ key ];
        } else {
            return this._keys[ key ] || this._keys[ key.toUpperCase() ] || this._keys[ key.toLowerCase() ];
        }
    }

    pressed( keyDesc : string ) {
        const keys = keyDesc.split( '+' );
        for ( let i = 0; i < keys.length; i++ ) {
            if ( !this.isKeyPressed( keys[ i ] ) ) {
                return false;
            }
        }
        return true;
    }

    private _onKeyDown( event : KeyboardEvent ) {
        this._onKeyChange( event, true );
    };

    private _onKeyUp( event : KeyboardEvent ) {
        this._onKeyChange( event, false );
    }

    private _onKeyChange( event : KeyboardEvent, pressed : boolean ) {
        this._keys[ event.key ] = pressed;
    };
}
