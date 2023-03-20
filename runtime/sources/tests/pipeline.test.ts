import { logger, PipeLine } from '../engine';

logger.enable();

function plus( operate : number ) {
    return function plus( pipe : PipeLine ) {
        pipe.io.input = pipe.io.output = pipe.io.input + operate;
    };
}

function sub( operate : number ) {
    return function sub( pipe : PipeLine ) {
        pipe.io.input = pipe.io.output = pipe.io.input - operate;
    };
}

function mul( operate : number ) {
    return function mul( pipe : PipeLine ) {
        pipe.io.input = pipe.io.output = pipe.io.input * operate;
    };
}

function div( operate : number ) {
    return function div( pipe : PipeLine ) {
        pipe.io.input = pipe.io.output = pipe.io.input / operate;
    };
}

function floor( pipe : PipeLine ) {
    pipe.io.input = pipe.io.output = pipe.io.input | 0;
}

new PipeLine( 'Arithmetic' )
    .pipes(
        plus( 5678 ),
        mul( 1234 ),
        sub( 4321 ),
        div( 1230 ),
        floor
    )
    .run( 5 );