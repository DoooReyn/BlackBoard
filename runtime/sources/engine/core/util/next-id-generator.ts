export class NextIDGenerator {
    private static readonly _idMap : any = Object.create( null );

    private static _get( key : string ) {
        let value = NextIDGenerator._idMap[ key ];
        value = value !== undefined ? value : 0;
        NextIDGenerator._idMap[ key ] = ++value;
        return value;
    }

    static next( key : string ) {
        return NextIDGenerator._get( key );
    }

    static nextWithKey( key : string ) {
        return `${ key }.${ NextIDGenerator.next( key ) }`;
    }
}
