import {
    Director, Engine, NativeEventSystem, NewsSystem, StatsSystem, TweenSystem,
} from '../engine';
import { ENGINE_OPTIONS } from './config/engine.config';
import { onEngineStarted, onSystemMounted } from './runner/engine-runner';

window.onload = async () => {
    const options = Object.assign( {}, ENGINE_OPTIONS, {
        systems: [
            NativeEventSystem.shared,
            NewsSystem.shared,
            TweenSystem.shared,
            Director.shared,
            StatsSystem.shared,
        ],
        onStarted: onEngineStarted,
        onSystemMounted: onSystemMounted,
    } );
    new Engine( options ).run();
};