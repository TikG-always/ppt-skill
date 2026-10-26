# 内容规划与结构选择

## 先规划整份汇报与每一页

先读取[学术排版规范](academic-style.md)，在任务私有目录建立storyboard.json，再生成brief.json。两份记录均由Codex自动整理；默认不要求用户填写或逐页审批。简单单页任务也记录对应的一页，不扩展成多页。

论文或课题汇报可从“背景与意义—现有不足—研究问题—方法与技术路线—实验结果—总结与展望”开始规划，根据材料与汇报时长调整。综述可用“问题—方法分类—代表工作—比较—开放问题”；没有原创实验时不得编造实验结果，改为有来源的公开评测或研究计划。叙事顺序与单页内的关系分别判断。

storyboard顶层记录audience（受众）、purpose（用途）、pageConstraint（页数要求）、styleProfile（有模板时继承模板，无模板时academic-v1）、narrative（叙事顺序）与slides。每页记录：

| 字段 | 内容 |
| --- | --- |
| id / topic | 稳定页编号与页面主题 |
| takeaway | 本页唯一核心观点；概览页可为核心问题，不强造结论 |
| relation / relationEvidence | 并列、层级、递进、时序、包含、对比等关系及判断依据 |
| mustKeep | 不可丢失的名称、数字、单位、年份、限定条件与实验设置 |
| evidenceMaterials | 支撑本页观点的材料编号、图表编号及对应段落 |
| layoutIntent | 文字、图片、组件如何分配，为什么适合本页 |
| materialGaps | 缺少什么素材、如何补齐；无缺口时为空数组 |
| sources | 原始URL或本地文件、页码／图号、版本或日期；仅用于任务记录与演讲者备注，不渲染为页面小字 |
| component / feasibility | 拟用组件及ready、needs-material或unsupported状态 |

例：一页“现有方法的不足”，核心观点为“复杂场景下视觉证据利用不足”，三个问题并列，证据为论文图2与表3，布局拟为左侧问题、右侧实验图。若当前没有匹配的左文右图组件，feasibility写unsupported；不能仅为通过生成器而改写成三列卡片或丢掉实验图。此例只说明记录方法，不提供可直接采用的科研事实。

在制作前检查：各页是否回答不同问题且前后连贯；结论是否有证据；关键内容能否追溯；素材是否齐备；固定字号下能否容纳。按[素材规则](materials.md)处理缺口后更新规划。计划中的来源与素材编号必须可解析，不能留虚构编号。

整页布局与局部组件分开匹配：先读template-reuse.md及用户素材库索引，再查看候选原图。storyboard附templateContract路径、referenceId与颜色锁定记录。适配现有模板时只换必要区域，其他区域保留。

## 从逐页规划建立brief

### 逻辑与模板映射记录（制作前完成）

每页增加以下字段，不把制作任务交给用户填表：

- `topSummary`：上方主旨；`bottomTakeaway`：下方结论或边界，不能复述前一句。
- `logic.nodes`：`id`、`label`、`kind`，可选`parent`表示包含；`logic.edges`：`from`、`to`、`relation`、`evidence`。只有真实流程/依赖才使用箭头；并列节点靠位置与共同标题表达。
- `template.referenceId`、`sourcePath`：实际查看过的整页参考。
- `referenceUse`：strict、preserve-edit、structure或none；`layoutFamily`：本页构图类型；`layoutReason`：该构图如何支持内容；`reuseReason`：与前页相同构图时说明必要性。
- `template.slots`：每个槽位的`id`、`bounds:[x,y,w,h]`、`role`和`nodeIds`。明确哪些内容填入模板左侧大图、右侧上层、右侧下层等区域。
- `template.preserved`：保留的骨架特征；`template.adaptations`：具体变化及语义理由。只写“参考MAT-021配色”不算整页映射。
- `visibleTextPolicy`：`noMicroCaptions:true`；`textColors`列允许的文字色；`colorBasis`说明无模板默认值或模板颜色取样；全篇`styleProfile.roles`固定字体字号。

运行`node scripts/check-storyboard.mjs <storyboard.json>`检查缺字段、悬空节点、未分配节点、越界槽位及重复上下句。此检查只验证记录一致性，不证明逻辑正确或图文已经生成。导出前逐项对照对象与渲染图。

只需局部修改时记录受影响页与槽位，保留其余内容，不为填满规划而扩大修改范围。

结构借鉴时slots记录最终内容区而非强制复制参考坐标，preserved记录实际借鉴的关系表达。无参考页无需虚构referenceId/sourcePath。检查器只对连续三页相同layoutFamily给提示，不强制凑满布局种类；人工核查是否因主题统一而误将结构锁死。

规划由Codex执行，脚本不调用外部大模型，也不是关键词匹配器。先找出关系证据，再选择结构。不要因为出现“体系”“高质量”“建设”等词就判定为金字塔。

storyboard是内容与布局决策记录；brief是当前生成器的组件输入。plan.mjs只读取brief，不会自动检查storyboard、素材许可或字号一致性。转换时将mustKeep中的精确文字映射到protectedTerms，将关系依据映射到evidence，页面来源写入notes；实验条件等无法仅靠字符串证明的事项仍需人工语义检查。图注与来源不是同一字段。

现有原生组件仅支持下列关系与节点数量。逐页规划可以描述其他合理布局，但只有确实可执行且素材充分的页面才进入build；不把规划能力当作已经实现的任意时间轴、对比或局部美化功能。

输入为 `{mode, slides:[...]}`，mode为create、adapt或edit。当前组件脚本只处理create；adapt/edit按template-reuse.md转交完整演示文稿工具。slides每项包括：

- title、可选subtitle、theme（无参考旧组件可用academic/teal；timeline-six固定reference-mat020），可选referenceId（指定库模板时必填）
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

source和notes存放出处；caption只描述图中内容或含义，不写“来源”“出自”“参考”“依据”等来源说明。不得将引用编号、网址、DOI或作者年份脚注塞入subtitle、caption或其他可见字段。属于研究内容的方法名称、实验年份与关键条件仍完整保留。

层级：groups恰好3项，顺序自上而下，每项label、description、keyword。必须有具体层级依据，例如“数据与算力支撑模型，模型支撑应用”。若输入从下到上描述，转换数组顺序并保留实际含义。

时间轴：groups恰好6项，每项label（最多8字）、top与bottom（各最多28字，至少一项非空），可选emphasis为top或bottom。按时间或阶段顺序输入；等距排布不表示时长。

## 选型条件

- parallel + 4组 + 共同主体：四瓣圆环。
- parallel + 3组：三列图文。
- hierarchy + 3组：三级梯形。
- 六节点时间轴：使用timeline-six；真正循环、五个方向、多层协同混合关系：现有通用选型不适配，不丢弃节点或篡改关系。
- 只有“做得高级”而没有明确关系依据：结合原文判断，无法判断则询问关键点。

## 来源与审查

模板示例只提供格式，不提供事实。将需保留的长机构名称、日期、指标名称写入protectedTerms。脚本检查这些字符串是否存在于最终页面文字中；同义改写若会破坏精确保留要求，应保持原文或与用户澄清。

三种可运行brief见examples/briefs.json；选型拒绝示例见scripts/test-planner.mjs。示例文字不代表真实机构已完成的项目。
