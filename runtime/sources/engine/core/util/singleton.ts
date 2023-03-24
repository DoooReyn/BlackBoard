export function Singleton<T>() {
    return class Singleton {
        private static _instance : T;

        protected constructor() {
        }

        public static get shared() : T {
            if ( !this._instance ) {
                this._instance = new this() as T;
            }
            return this._instance;
        }
    };
}
