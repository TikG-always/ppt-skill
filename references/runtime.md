# 运行流程

## 获取环境

调用load_workspace_dependencies。使用它返回的Node.js、Python和Node模块路径，不硬编码开发者电脑路径。

设置：
- RUNTIME_NODE_MODULES：Node模块目录
- RUNTIME_PYTHON：Python可执行文件
- PRESENTATIONS_SKILL_DIR：本机可用presentations技能的根目录

执行命令中的node均表示返回的Node可执行文件。路径包含空格时按当前shell正确引用。

示例中的scripts路径相对Skill根目录；实际调用应展开为Skill内脚本的绝对路径。工作目录设为用户的任务工作区，输入、构建和交付文件使用任务内绝对路径。先创建private-run父目录；plan输出目录须为新目录。不要将用户任务产物写入Skill源码目录。

```text
node scripts/doctor.mjs
node scripts/plan.mjs <brief.json> <private-run/plan>
```

输出decision.json。只有status为ready时生成同目录deck.json，并可以继续：

```text
node scripts/build.mjs <private-run/plan/deck.json> <private-run/build>
python scripts/check-native.py <private-run/build/candidate.pptx> <private-run/plan/deck.json>
```

构建PPT前遵守本机presentations技能的artifact operation标记规则，每次操作只执行一次，不由脚本重复标记。

Windows有PowerPoint时：

```powershell
./scripts/render-powerpoint.ps1 -InputPptx <candidate.pptx> -OutputDirectory <private-run/preview>
```

逐页实际查看预览，修复后使用新目录重新构建。通过视觉检查后执行：

```text
node scripts/finalize.mjs <candidate.pptx> <final.pptx> <private-run/receipt.json>
```

finalize的候选、最终文件必须位于同一任务工作区。可设置PPT_WORKSPACE_DIR为该任务目录，默认当前工作目录，避免把其他任务文件写入Skill目录。finalizer不会覆写已有最终文件。

## 安装与调用

项目根目录即Skill目录。可以复制或链接到本机Codex的skills目录，保留相对路径。源码与生成工作目录分开；不要复制work或outputs用于分发。

在支持技能发现的会话中使用`$editable-ppt-skill`。若当前会话尚未刷新技能目录，可直接要求Codex读取项目中的SKILL.md；是否需要新会话以客户端实际发现结果为准。

doctor只检查Node模块、Python和finalizer路径，不代表视觉检查或PowerPoint验证已完成。
