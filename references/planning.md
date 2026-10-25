# 内容规划与结构选择

## 从自然语言建立brief

规划由Codex执行，脚本不调用外部大模型，也不是关键词匹配器。先找出关系证据，再选择结构。不要因为出现“体系”“高质量”“建设”等词就判定为金字塔。

输入为 `{mode, slides:[...]}`，mode为create、adapt或edit。当前只有create可生成。slides每项包括：

- title、可选subtitle、theme（academic/teal）
- relation：parallel、hierarchy、sequence、cycle、mixed或unknown
- evidence：说明为何判断这种关系；记录用户材料中的依据
- center：四方向共同主体，可显式换行；仅四瓣使用
- centerNote：可选中心说明
- requestedTemplate：可选ribbon-ring、three-columns或tiered-pyramid
- protectedTerms：必须原样保留的专有名称、数值口径等字符串，可为空
- groups：节点内容数组

## 组内容

四瓣：groups恰好4项，每项label（最多10字）、description（最多36字），center最多14字。描述可以精炼，不改变事实。顺序右上、右下、左下、左上。

三列：groups恰好3项，每项label、title、bullets（3条）、caption，以及image或diagram（三个短标签）。详细容量见组件说明。title是该方向的简短行动表述，bullets必须有材料依据。材料不足以支持三条时不要补造内容，当前返回needs-content，可询问补充或另选环境已有版式。

图片为 `{path, source}`；使用本地已有路径和真实来源。没有图片且三个概念标签可以从原文提取时使用diagram；不得把三个平等概念描述成严格流程，示意图只表示关联。

层级：groups恰好3项，顺序自上而下，每项label、description、keyword。必须有具体层级依据，例如“数据与算力支撑模型，模型支撑应用”。若输入从下到上描述，转换数组顺序并保留实际含义。

## 选型条件

- parallel + 4组 + 共同主体：四瓣圆环。
- parallel + 3组：三列图文。
- hierarchy + 3组：三级梯形。
- 时间轴、真正循环、五个方向、多层协同混合关系：本版不适配，不丢弃节点或篡改关系。
- 只有“做得高级”而没有明确关系依据：结合原文判断，无法判断则询问关键点。

## 来源与审查

模板示例只提供格式，不提供事实。将需保留的长机构名称、日期、指标名称写入protectedTerms。脚本检查这些字符串是否存在于最终页面文字中；同义改写若会破坏精确保留要求，应保持原文或与用户澄清。

三种可运行brief见examples/briefs.json；选型拒绝示例见scripts/test-planner.mjs。示例文字不代表真实机构已完成的项目。
