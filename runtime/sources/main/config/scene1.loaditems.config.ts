import { ILoadingItems } from '../../engine';

export const SCENE1_LOAD_ITEMS : ILoadingItems = {
    basePath: '/asset/',
    bundles: [
        [
            'Scene1', [
            [ 'png', 'flowerTop.png' ],
            [ 'spritesheet1', 'spritesheet/0123456789.json' ],
            [ 'spritesheet2', 'spritesheet/mc.json' ],
            [ 'bitmap-font', 'bitmap-font/desyrel.xml' ],
        ],
        ], [
            'Scene2', [
                [ 'ttf', 'webfont-loader/ChaChicle.ttf' ],
                [ 'otf', 'webfont-loader/Lineal.otf' ],
                [ 'woff', 'webfont-loader/Dotrice-Regular.woff' ],
                [ 'woff2', 'webfont-loader/Crosterian.woff2' ],
            ],
        ], [
            'Button', [
                // [ 'button-normal', 'button.png' ],
                // [ 'button-down', 'button_down.png' ],
                // [ 'button-hover', 'button_over.png' ],
            ],
        ],
    ],
    scattered: [
        [ 'video', 'video.mp4' ],
        [ 'tilemap', 'tilemaps/atlas.json' ],
        [ 'eggHead', 'eggHead.png' ],
    ],
};