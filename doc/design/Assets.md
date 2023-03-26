# 资源加载系统

## 官方支持

- textures (avif, webp, png, jpg, gif, svg)
- sprite sheets (json)
- bitmap fonts (xml, fnt, txt)
- web fonts (ttf, woff, woff2)
- json files (json)
- text files (txt)

## 其他格式

- 更多格式的支持可以通过创建自定义的 Loader Parser 来解析
- sound files (mp3 ogg wav)
- sdf fonts (sdf)
- bone animation (Spine DragonBone)

## 设计

### 场景入栈（PreEnter Scene）

-> 检查选项
-> 加载资源（Show Loading）
-> 资源加载中（Scene Transition）
-> 资源加载完毕（Hide Loading）
-> 场景呈现（Enter Scene）

### 场景出栈

-> 场景销毁（Exit Scene -> Unload Assets）
-> 场景过渡（Scene Transition）
-> 弹出场景（Enter Scene）

## 测试

- 加载不同类型的资源（要能够查看进度）
- 把它们放在一个bundle里（要能够查看进度）
- 加载多个bundle（要能够查看进度）