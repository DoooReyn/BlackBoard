# Knowledge of Pixi.JS

## TypeScript

- 声明任意对象类型可以用 `Record<string, any>`

## Pixi.js

- `zIndex` 只有在父节点设置了 `sortableChildren=true` 时才有效
- `Assets` 只能获得整体的加载进度，无法获知具体加载到哪一个文件
- 可以通过 hook `Assets.cache.set` 这种“曲线救国”的方式来获得加载的具体文件，但不完备
- `Assets.addBundle` 只是通过一种格式将资源配置添加到 `Assets.resolver` 中，实际加载时还是可以通过其中的 `key`
  或 `${bundleId}-key` 来分别获取
- bundle 资源不能使用 `Assets.load(bundleId)` 来加载，而应该使用 `Assets.loadBundle(bundleId)`
- 设置节点的 `renderable = false` 会将节点从渲染队列中排除，但不会影响其逻辑运行，如 `interative`
  还是可以响应，如果需要彻底关闭，应该使用 `visible = false`
- 验证节点嵌套的情况下 `interactive` 的表现
    - 节点默认会将触摸事件传递给父节点，可以通过 `stopPropagation/stopImmediatePropagation` 停止传递
    - `stopImmediatePropagation` 会彻底阻止该事件继续传递，包括该事件当前对象的其他监听者
    - `stopPropagation` 则会将事件传递给当前对象的其他监听者
    - 同级节点的触摸事件触发顺序依据 `zIndex` 和添加顺序决定
    - `stage` 的全屏触发需要这样设置 `stage.hitArea = new PIXI.Rectangle(0, 0, w, h);`，同理，其他节点也可以

## 代码片段

```typescript
// 使能全屏触摸事件
app.stage.interactive = true;
app.stage.hitArea = new Rectangle( 0, 0, app.screen.width, app.screen.height );
```
