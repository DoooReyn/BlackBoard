import { State, TStates } from '../engine/core/util/state';

type TSwitcherStates = TStates | 'on' | 'off'

class Test {
    #state : State<TSwitcherStates>;

    constructor() {
        this.#state = new State<TSwitcherStates>( 'off', [
            [ 'on', 'off', this.onTurnOff, this ],
            [ 'off', 'on', this.onTurnOn, this ],
        ] );
    }

    test() {
        this.#state.transit( 'on' ); // turn on
        this.expect( 'try to turn off', this.#state.can( 'off' ), true );
        this.#state.transit( 'off' ); // turn off
        this.expect( 'try to turn on', this.#state.can( 'on' ), true );
        this.expect( 'try to turn off again', this.#state.can( 'off' ), false );
        this.expect( 'try to turn primitive', this.#state.can( 'primitive' ), false );
    }

    private expect( desc : string, raw : any, target : any ) {
        console.log( desc, raw === target ? 'ok' : 'bad' );
    }

    private onTurnOff() {
        console.log( 'turn off.' );
    }

    private onTurnOn() {
        console.log( 'turn on.' );
    }
}

new Test().test();