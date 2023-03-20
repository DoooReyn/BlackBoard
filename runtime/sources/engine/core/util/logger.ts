type TNoop = ( ..._ : any[] ) => void;
const noop : TNoop = function ( ..._ : any[] ) {};
const debug : TNoop = console.log.bind( console );
const info : TNoop = console.info.bind( console );
const warn : TNoop = console.warn.bind( console );
const error : TNoop = console.error.bind( console );
let enabled = false;

/**
 * 日志
 */
export const logger = {
    // 输出调试
    debug: noop,
    // 输出信息
    info: noop,
    // 输出警告
    warn: noop,
    // 输出错误
    error: noop,
    // 获取日志开关
    get enabled() {
        return enabled;
    },
    // 设置日志开关
    set enabled( en : boolean ) {
        if ( en ) {
            this.enable();
        } else {
            this.disable();
        }
    },
    // 开启日志
    enable() {
        this.debug = debug;
        this.info = info;
        this.warn = warn;
        this.error = error;
        enabled = true;
    },
    // 关闭日志
    disable() {
        this.debug = noop;
        this.info = noop;
        this.warn = noop;
        this.error = noop;
        enabled = false;
    }
};
