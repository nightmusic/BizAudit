import pc from 'picocolors';
import { AuditTask } from '../domain/entities/AuditTask';
import { SeverityLevel } from '../domain/types/SeverityLevel';
import { AuditStatus } from '../domain/types/AuditStatus';
import { DeliveryPort } from '../application/ports/DeliveryPort';

// 严重等级 → 样式映射
const SEVERITY_STYLE: Record<SeverityLevel, (text: string) => string> = {
  [SeverityLevel.FATAL]:  (t) => pc.bgRed(pc.bold(pc.white(t))),
  [SeverityLevel.HIGH]:   (t) => pc.red(pc.bold(t)),
  [SeverityLevel.MEDIUM]: (t) => pc.yellow(pc.bold(t)),
  [SeverityLevel.LOW]:    (t) => pc.cyan(t),
  [SeverityLevel.NONE]:   (t) => pc.gray(t),
};

const SEVERITY_LABEL: Record<SeverityLevel, string> = {
  [SeverityLevel.FATAL]:  '● FATAL  ',
  [SeverityLevel.HIGH]:   '● HIGH   ',
  [SeverityLevel.MEDIUM]: '● MEDIUM ',
  [SeverityLevel.LOW]:    '● LOW    ',
  [SeverityLevel.NONE]:   '○ NONE   ',
};

const ACTION_LABEL: Record<string, string> = {
  BLOCK_RELEASE: '阻断发布',
  FIX_BEFORE_RELEASE: '发布前修复',
  SCHEDULED_FIX: '排期修复',
  MONITOR: '持续观察',
};

export class ConsoleResultRenderer implements DeliveryPort {
  /**
   * 实现 DeliveryPort 接口：供 Orchestrator 在流程末尾调用
   */
  async deliver(tasks: AuditTask[]): Promise<void> {
    this.render(tasks);
  }

  /**
   * 渲染完整审查结果摘要（所有任务）
   */
  render(tasks: AuditTask[]): void {
    console.log('\n' + pc.bold(pc.white('═══════════════════════════════════════')));
    console.log(pc.bold(pc.white('  BizAudit — 审查报告')));
    console.log(pc.bold(pc.white('═══════════════════════════════════════')));

    const completed = tasks.filter(t => t.status === AuditStatus.COMPLETED);
    const failed    = tasks.filter(t => t.status === AuditStatus.FAILED);
    const skipped   = tasks.filter(t => t.status === AuditStatus.PENDING);

    completed.forEach(task => this.renderCompletedTask(task));
    failed.forEach(task    => this.renderFailedTask(task));

    this.renderSummary(completed, failed, skipped);
  }

  /**
   * 渲染单个已完成任务
   */
  private renderCompletedTask(task: AuditTask): void {
    const result   = task.result!;
    const defect   = task.defect;
    const styleFn  = SEVERITY_STYLE[result.severity];
    const label    = SEVERITY_LABEL[result.severity];

    console.log('\n' + pc.dim('───────────────────────────────────────'));
    console.log(`${styleFn(label)} ${pc.white(defect.errorSignature)}`);
    console.log(`  ${pc.dim('位置:')} ${pc.white(defect.filePath)}:${pc.yellow(String(defect.lineNumber))}`);
    console.log(`  ${pc.dim('消息:')} ${defect.message}`);

    if (task.businessContext) {
      console.log(`  ${pc.dim('业务域:')} ${pc.magenta(task.businessContext.domainName)}`);
    }

    console.log(`  ${pc.dim('处置建议:')} ${pc.bold(ACTION_LABEL[result.recommendedAction] ?? result.recommendedAction)}`);
    console.log(`  ${pc.dim('影响评估:')}`);
    console.log(`    ${pc.italic(result.impactDescription)}`);
  }

  /**
   * 渲染单个失败任务
   */
  private renderFailedTask(task: AuditTask): void {
    const defect = task.defect;
    console.log('\n' + pc.dim('───────────────────────────────────────'));
    console.log(`${pc.red('✗ FAILED ')} ${pc.white(defect.errorSignature)}`);
    console.log(`  ${pc.dim('位置:')} ${pc.white(defect.filePath)}:${pc.yellow(String(defect.lineNumber))}`);
    console.log(`  ${pc.dim('失败原因:')} ${pc.red(task.errorReason ?? 'Unknown error')}`);
  }

  /**
   * 渲染摘要统计
   */
  private renderSummary(
    completed: AuditTask[],
    failed: AuditTask[],
    skipped: AuditTask[]
  ): void {
    const counts = {
      [SeverityLevel.FATAL]:  0,
      [SeverityLevel.HIGH]:   0,
      [SeverityLevel.MEDIUM]: 0,
      [SeverityLevel.LOW]:    0,
      [SeverityLevel.NONE]:   0,
    };

    for (const task of completed) {
      if (task.result) {
        counts[task.result.severity]++;
      }
    }

    console.log('\n' + pc.bold(pc.white('═══════════════════════════════════════')));
    console.log(pc.bold('  摘要统计'));
    console.log(
      `  总计: ${pc.white(String(completed.length + failed.length + skipped.length))} ` +
      `完成: ${pc.green(String(completed.length))} ` +
      `失败: ${pc.red(String(failed.length))} ` +
      `跳过: ${pc.gray(String(skipped.length))}`
    );
    console.log(
      `  缺陷等级: ` +
      `${SEVERITY_STYLE[SeverityLevel.FATAL](String(counts[SeverityLevel.FATAL]) + ' FATAL')}  ` +
      `${SEVERITY_STYLE[SeverityLevel.HIGH](String(counts[SeverityLevel.HIGH]) + ' HIGH')}  ` +
      `${SEVERITY_STYLE[SeverityLevel.MEDIUM](String(counts[SeverityLevel.MEDIUM]) + ' MEDIUM')}  ` +
      `${SEVERITY_STYLE[SeverityLevel.LOW](String(counts[SeverityLevel.LOW]) + ' LOW')}  ` +
      `${SEVERITY_STYLE[SeverityLevel.NONE](String(counts[SeverityLevel.NONE]) + ' NONE')}`
    );
    console.log(pc.bold(pc.white('═══════════════════════════════════════\n')));
  }
}
