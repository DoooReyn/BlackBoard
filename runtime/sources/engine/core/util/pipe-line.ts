import { logger } from './logger';

/**
 * 管线的输入、输出缓存区
 */
interface PipeIO {
    input : any;
    output : any;
}

/**
 * 同步与异步管线任务
 */
export type PipeHandle = ( pipe : PipeLine ) => any | Promise<any>;

/**
 * 管线任务包装类
 * - 链表结构
 */
class PipeJob {
    public id : number;
    public next : PipeJob;
    public handle : PipeHandle;

    constructor( handle : PipeHandle ) {
        this.id = -1;
        this.next = null;
        this.handle = handle;
    }
}

/**
 * 管线
 * @example
 */
export class PipeLine {
    private readonly _tag : string;
    private readonly _stopOnError : boolean = false;
    private _running : boolean;
    private _done : boolean;
    private _order : number = 0;
    private _success : number = 0;
    private _head : PipeJob = null;
    private _tail : PipeJob = null;
    private _current : PipeJob = null;
    public io : PipeIO;

    constructor( tag : string, stopOnError : boolean = false ) {
        this._tag = tag;
        this._stopOnError = stopOnError;
        this.clear();
    }

    protected oncomplete() {
        this._done = true;
        this._running = false;
        logger.info( `[PipeLine.${ this._tag }] C(${ this._success }/${ this._order }) O: `, this.io.output );
    }

    private _getPipeDesc() {
        return `[PipeLine.${ this._tag }]`;
    }

    private _getJobDesc( job : PipeJob ) {
        return `J(${ job.id }) F(${ job.handle.name })`;
    }

    private _getSuccessDesc() {
        return `C(${ this._success }/${ this._order })`;
    }

    private _getProgressDesc( job : PipeJob ) {
        return `P(${ job.id }/${ this._order })`;
    }

    protected onerror( job : PipeJob, error : any ) {
        this._stopOnError && logger.info( `${ this._getPipeDesc() } ${ this._getSuccessDesc() }` );
        logger.error( `${ this._getPipeDesc() } ${ this._getJobDesc( job ) }`, error );
    }

    protected onprogress( job : PipeJob ) {
        logger.info( `${ this._getPipeDesc() } ${ this._getJobDesc( job ) } ${ this._getProgressDesc( job ) } O:`, this.io.output );
    }

    public get running() {
        return this._running;
    }

    public pipe( handle : PipeHandle ) {
        if ( this._running ) {
            return this;
        }

        const job = new PipeJob( handle );
        job.id = ++this._order;
        if ( !this._head ) {
            this._tail = this._head = job;
        } else if ( this._tail ) {
            this._tail.next = job;
            this._tail = job;
        }

        return this;
    }

    public pipes( ...handles : PipeHandle[] ) {
        handles.forEach( h => this.pipe( h ) );
        return this;
    }

    public reset() {
        if ( this.running ) return;
        this._current = null;
        this._running = false;
        this._done = false;
        this._success = 0;
        this.io = { input: null, output: null };
    }

    public clear() {
        this._tail = this._head = this._current = null;
        this._order = 0;
        this.reset();
    }

    run( input : any ) {
        if ( this._running || this._done || !this._head )
            return;

        logger.info( `${ this._getPipeDesc() } I:`, input );

        this.reset();
        this.io.input = input;
        this._current = this._head;
        const self = this;

        async function next() {
            if ( self._current ) {
                self._running = true;
                const handle = self._current.handle;
                try {
                    await handle( self );
                } catch ( error : any ) {
                    self.onerror( self._current, error );
                    if ( self._stopOnError ) {
                        return;
                    }
                }
                ++self._success;
                self.onprogress( self._current );
                self._current = self._current.next;
                await next();
            } else {
                self.oncomplete();
            }
        }

        next().then();
    }
}
