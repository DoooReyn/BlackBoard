export {}
// import { ObservablePoint } from 'pixi.js';
// import { SystemEvent } from '../../enum';
// import { SizeLike } from '../../interface';
// import { prefills, Boundary, Lovely, VirtualSize } from '../util';
// import { BaseBox } from './base-box';
//
// /**
//  * 拆分一下
//  * - SizeBox        只有 Size，没有 Boundary
//  * - BoundaryBox    只有 Boundary，没有 Size，Boundary 的变化影响 Size 的值
//  *
//  * Scene 只有 Size
//  * - 所有 BoxLike 对象共享一个 WindowSizeLovely
//  * - 在当前帧结束时自动置零
//  */
// export interface IBoxOptions {
//     width : number;
//     height : number;
//     // default is 0.5
//     anchorX? : number;
//     // default is 0.5
//     anchorY? : number;
//     top? : number;
//     bottom? : number;
//     left? : number;
//     right? : number;
// }
//
// export abstract class Box extends BaseBox {
//     protected _size : VirtualSize;
//     protected _anchorLovely : Lovely;
//     public boundary : Boundary<this>;
//     public anchor : ObservablePoint;
//
//     protected constructor( options : IBoxOptions ) {
//         super();
//
//         prefills( options, [ [ 'anchorX', 0.5 ], [ 'anchorY', 0.5 ] ] );
//
//         this._anchorLovely = new Lovely();
//         this._size = new VirtualSize( options.width, options.height );
//         this.anchor = new ObservablePoint( this._onAnchorChanged, this, options.anchorX, options.anchorY );
//         this.boundary = new Boundary( this._onBoundaryChanged, this );
//
//         this._onInit( options );
//     }
//
//     protected override _onInit( options : IBoxOptions ) {
//         this.boundary.set( {
//             left: [ options.left !== undefined, options.left || 0 ],
//             top: [ options.top !== undefined, options.top || 0 ],
//             right: [ options.right !== undefined, options.right || 0 ],
//             bottom: [ options.bottom !== undefined, options.bottom || 0 ],
//         } );
//         this.subscriber.subscribe( SystemEvent.Resize, this._onBoundaryChanged, this );
//     }
//
//     override get width() {
//         return this._size.width;
//     }
//
//     override get height() {
//         return this._size.height;
//     }
//
//     override set width( w : number ) {
//         this._size.width = w;
//         this._updateLovely.trick();
//     }
//
//     override set height( h : number ) {
//         this._size.height = h;
//         this._updateLovely.trick();
//     }
//
//     resize( w : number | SizeLike, h? : number ) {
//         this._size.resize( w, h );
//         this.width = this._size.width;
//         this.height = this._size.height;
//         this._onresize();
//     }
//
//     protected _onresize() {}
//
//     protected _onBoundaryChanged() {
//         let width = this.parent.width;
//         let height = this.parent.height;
//         let stretch = false;
//         if ( this.boundary.isStretchWidth ) {
//             width -= this.boundary.left.margin;
//             width -= this.boundary.right.margin;
//             stretch = true;
//         }
//         if ( this.boundary.isStretchHeight ) {
//             height -= this.boundary.top.margin;
//             height -= this.boundary.bottom.margin;
//             stretch = true;
//         }
//         if ( stretch ) {
//             this.resize( width, height );
//         }
//     }
//
//     protected _onAnchorChanged() {
//         this._updateLovely.trick();
//         this._anchorLovely.trick();
//     }
//
//     protected override _onAdded() {
//         super._onAdded();
//         this._onBoundaryChanged();
//     }
//
//     protected override _update( _delta : number ) {
//         super._update( _delta );
//
//         this.boundary.update();
//
//         if ( this._anchorLovely.angry ) {
//             this._anchorLovely.treat();
//             this.pivot.x = this._size.width * this.anchor.x;
//             this.pivot.y = this._size.height * this.anchor.y;
//             if ( this.parent ) {
//                 this.x = this.parent.pivot.x;
//                 this.y = this.parent.pivot.y;
//             }
//         }
//     }
//
// }