# 可编辑PPT Skill

当前实现文字生成的最小流程：Codex理解文字关系 → 选择适配组件 → 原生PPT构建 → 渲染检查。截图复现、原稿局部修改尚未实现。

Skill入口为 `SKILL.md`。用户不必手写JSON；由Codex整理内容、记录关系依据并调用脚本。选型脚本不调用大模型，不会仅凭关键词理解任意原文。

本地安装后可在新对话输入：`使用 $editable-ppt-skill，把以下内容做成可编辑PPT，自动选择合适结构：……`

开发验证：`node scripts/test-planner.mjs`；环境检测：`node scripts/doctor.mjs`。完整运行方法见 `references/runtime.md`，语义输入示例见 `examples/briefs.json`。

## 已实现

- `ribbon-ring`：中心主体＋四个并列方向；沿圆弧排字，折带与文字为原生对象。
- `three-columns`：三个并列方向，每列三条内容；支持本地图片或可编辑的三节点示意图。
- `tiered-pyramid`：三级梯形与对应说明，自上而下输入层级。
- `academic`、`teal` 两套配色；16:9，1280×720。

`examples/samples.json` 含6个无外部资源依赖的内容案例。输入中的文字均为演示内容，不构成机构成果或正式学科目录认定。

## 在Codex中执行

1. 调用 `load_workspace_dependencies` 找到 Node.js 和 Node模块目录。
2. 将 Node模块目录设置到 `RUNTIME_NODE_MODULES` 环境变量。
3. 使用返回的 Node.exe 执行：

```text
node scripts/test-components.mjs
node scripts/build.mjs examples/samples.json work/new-build
```

构建程序生成 `candidate.pptx` 和实际输入记录，不覆盖已有构建结果。输出属于待检查草稿。每次交付前，应按当前环境的 presentations skill 完成 finalization，并在PowerPoint中渲染检查。

Windows有桌面PowerPoint时可渲染：

```powershell
./scripts/render-powerpoint.ps1 -InputPptx ./work/new-build/candidate.pptx -OutputDirectory ./work/new-build/preview
```

## 输入约定

以示例JSON为准，所有文字允许显式换行。图形参数与内容分离，用户只需改输入，不必修改几何代码。当前中文排版容量采用保守字符上限，不是完整字体度量引擎，英文长词、连续数字及极限内容仍需渲染检查。超范围内容应改布局或调整文字，不自动删改专有名称。

三列图片格式：`image: {path: "本地文件路径", source: "图片来源"}`。路径相对于执行工作目录或使用绝对路径。图片使用cover裁剪，图注填在caption中，来源写入备注。没有image时，diagram必须提供三个节点标签。

环形items顺序为右上、右下、左下、左上。圆环文字逐字生成，PowerPoint内可逐字修改；整句修改推荐改JSON后重新生成。

梯形levels按上、中、下排列，只用于有实际层级依据的内容；面积不代表统计数量。

## 编辑与边界

必需文字、环形分段、折面、梯形与说明均为PowerPoint原生对象。图形有语义化对象名称，便于后续选择性修改。图片为可替换图片对象。当前尚未提供自动局部修改器，尚未支持任意节点数量。

## 环境与发布状态

生成器依赖当前Codex环境提供的 `@oai/artifact-tool`，并非承诺所有Codex安装均自带。运行前需要检测可用性；此仓库不复制运行库，也不假设其可再分发。未来发布需补充运行时适配或明确依赖安装方式。

参考图来自用户私人素材库MAT-005、MAT-006、MAT-007。未复制参考截图、校徽和品牌图案进源码。布局重建不等于授权已确认，发布前需审查参考来源及选定项目许可证。本地含照片的展示PPT位于被Git忽略的outputs目录，照片来源见备注。不要直接把本地展示产物当成可公开分发素材。

原始素材索引保留visual-reference状态；组件实现单独登记在assets/components/catalog.json中。
