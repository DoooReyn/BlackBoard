# 设计

## Application

## GUI

- Board 需求
    - 尺寸固定，不随着包围框变化
    - 能够接收窗口尺寸变化事件，处理 Resize，完成适配
- Board 层级设计
    - 挂在 `app.stage` 上的唯一节点
    - Debug
        - 调试节点，负责渲染调试信息，如：FPS、Draw Call、Vertex 等
    - Scene
        - 场景节点，负责场景构建，应用中的所有 GUI 节点都应该挂载它身上

- PinStrategy 锚定策略 (相对父节点)
    - Corner
        - TopLeft
        - TopCenter
        - TopRight
        - CenterLeft
        - CenterCenter
        - CenterRight
        - BottomLeft
        - BottomCenter
        - BottomRight

- ResizeStrategy 伸缩策略 (相对父节点)
    - Margin
        - Top
            - enabled
            - distance
        - Bottom
            - enabled
            - distance
        - Left
            - enabled
            - distance
        - Right
            - enabled
            - distance
