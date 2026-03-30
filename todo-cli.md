# BizAudit CLI 开发清单

## 1. 领域层 (Domain Layer)
- [x] 定义 `TechDefect` 实体（文件路径 + 行号 + 错误签名 → Hash ID）
- [x] 定义值对象：`CodeLocation`、`BusinessRule`、`EvaluationResult`
- [x] 定义 `SeverityLevel` 枚举（致命、高、中、低、无影响）
- [x] 定义 `AuditTask` 聚合根（状态机：待处理 → 评估中 → 已完成/失败）
- [x] 定义 `ImpactAssessor` 领域服务接口

## 2. 应用层 (Application Layer)
- [x] 定义 Port 接口：`DefectIngestionPort`（缺陷摄取）
- [x] 定义 Port 接口：`ContextDiscoveryPort`（业务文档发现）
- [x] 定义 Port 接口：`LlmGatewayPort`（LLM 网关）
- [x] 定义 Port 接口：`DeliveryPort`（结果交付）
- [x] 实现 `AuditWorkflowOrchestrator`（编排完整流程：摄取 → 补齐 → 推理 → 输出）

## 3. 基础设施层 (Infrastructure Layer)
- [x] 实现 `LinterReportParser`（解析 ESLint JSON / SARIF 等格式）
- [x] 实现 `LocalDocScanner`（根据文件路径寻址 `.feature` / DDD 文档）
- [x] 实现 `LlmGatewayAdapter`（封装 Gemini/Claude/OpenAI API 调用与 Token 管理）

## 4. 接入层 - CLI (Presentation Layer)
- [x] 搭建 CLI 框架（命令行参数解析）
- [x] 实现主命令：`audit`（接收项目路径，触发审查工作流）
- [x] 实现 CLI 结果渲染器（彩色文本输出评估结论）
- [x] 支持命令行选项（如 `--format`、`--severity-filter`、`--config` 等）

## 5. 标准工作流集成
- [x] 串联完整流程：CLI 触发 → 缺陷摄取 → 上下文补齐 → LLM 推理 → 结果输出
- [x] 处理降级逻辑（找不到业务文档时的缺陷跳过/降级）
- [x] 错误处理与日志

## 6. 稳定性修复与加固（2026-03-30）
- [x] 缺陷摄取加固：`ruleId` 缺失时标准化为 `fatal`，避免 fatal/parser 问题被漏审
- [x] 缺陷摄取加固：`line` 缺失时标准化为 `0`，保证审查任务生命周期完整
- [x] CLI 契约加固：`--severity-filter` 增加白名单校验，非法值快速失败
- [x] 交付一致性修复：摘要统计补齐 `NONE` 等级展示
- [x] 手册同步：更新中英文文档中的输入规范与过滤行为说明
