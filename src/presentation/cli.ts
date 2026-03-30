import * as path from 'path';
import { Command } from 'commander';
import pc from 'picocolors';

import { LinterReportParser } from '../infrastructure/adapters/LinterReportParser';
import { LocalDocScanner } from '../infrastructure/adapters/LocalDocScanner';
import { LlmGatewayAdapter } from '../infrastructure/adapters/LlmGatewayAdapter';
import { LlmImpactAssessor } from '../domain/services/LlmImpactAssessor';
import { AuditWorkflowOrchestrator } from '../application/orchestrators/AuditWorkflowOrchestrator';
import { ConsoleResultRenderer } from './ConsoleResultRenderer';
import { SeverityLevel } from '../domain/types/SeverityLevel';
import { AuditTask } from '../domain/entities/AuditTask';
import { AuditStatus } from '../domain/types/AuditStatus';

// 严重等级排序（值越大越严重）
const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  [SeverityLevel.NONE]:   0,
  [SeverityLevel.LOW]:    1,
  [SeverityLevel.MEDIUM]: 2,
  [SeverityLevel.HIGH]:   3,
  [SeverityLevel.FATAL]:  4,
};

export function setupCLI() {
  const program = new Command();

  program
    .name('bizaudit')
    .description('BizAudit CLI - A domain-driven code review tool')
    .version('1.0.0');

  program
    .command('audit <reportPath>')
    .description('Run a business logic audit on the given linter report file')
    .option('-f, --format <type>', 'Output format: text | json', 'text')
    .option(
      '-s, --severity-filter <level>',
      'Filter: only show defects at or above this level (none|low|medium|high|fatal)',
      'low'
    )
    .option('-k, --api-key <key>', 'LLM API key (or set env LLM_API_KEY)')
    .option('-c, --config <path>', 'Path to custom configuration file (reserved for future use)')
    .action(async (reportPath: string, options: any) => {
      const absoluteReportPath = path.resolve(reportPath);
      const apiKey = options.apiKey ?? process.env['LLM_API_KEY'];
      const minSeverity: SeverityLevel =
        (options.severityFilter?.toUpperCase() as SeverityLevel) ?? SeverityLevel.LOW;

      console.log(pc.cyan(`\n🚀 BizAudit 启动 — 报告文件: ${absoluteReportPath}`));

      try {
        // ── 合成根 (Composition Root) ──────────────────────────────
        const defectIngestionPort  = new LinterReportParser(absoluteReportPath);
        const contextDiscoveryPort = new LocalDocScanner();
        const llmGateway           = new LlmGatewayAdapter(apiKey);
        const impactAssessor       = new LlmImpactAssessor(llmGateway);
        const consoleRenderer      = new ConsoleResultRenderer();

        // 带 severity 过滤 + 多格式输出的 DeliveryPort 包装
        const filteringDelivery = {
          deliver: async (tasks: AuditTask[]) => {
            const filtered = tasks.filter(task => {
              // 保留失败和跳过的任务，让渲染器展示它们
              if (task.status !== AuditStatus.COMPLETED || !task.result) return true;
              return SEVERITY_ORDER[task.result.severity] >= SEVERITY_ORDER[minSeverity];
            });

            if (options.format === 'json') {
              console.log(JSON.stringify(
                filtered.map(t => ({
                  id:          t.id,
                  status:      t.status,
                  defect: {
                    file:    t.defect.filePath,
                    line:    t.defect.lineNumber,
                    rule:    t.defect.errorSignature,
                    message: t.defect.message,
                  },
                  severity:    t.result?.severity    ?? null,
                  impact:      t.result?.impactDescription ?? null,
                  errorReason: t.errorReason         ?? null,
                })),
                null, 2
              ));
            } else {
              await consoleRenderer.deliver(filtered);
            }
          }
        };
        // ────────────────────────────────────────────────────────────

        const orchestrator = new AuditWorkflowOrchestrator(
          defectIngestionPort,
          contextDiscoveryPort,
          impactAssessor,
          filteringDelivery
        );

        await orchestrator.executeWorkflow();

      } catch (error: any) {
        console.error(pc.red(`\n❌ 审查失败: ${error.message}`));
        process.exit(1);
      }
    });

  return program;
}

// 保证单独运行此文件时可以执行
if (require.main === module) {
  const program = setupCLI();
  program.parse(process.argv);
}
