import { AuditTask } from '../../domain/entities/AuditTask';
import { ImpactAssessor } from '../../domain/services/ImpactAssessor';
import { DefectIngestionPort } from '../ports/DefectIngestionPort';
import { ContextDiscoveryPort } from '../ports/ContextDiscoveryPort';
import { DeliveryPort } from '../ports/DeliveryPort';

export class AuditWorkflowOrchestrator {
  constructor(
    private readonly defectIngestionPort: DefectIngestionPort, // 摄取
    private readonly contextDiscoveryPort: ContextDiscoveryPort, // 补齐
    private readonly impactAssessor: ImpactAssessor, // 推理 (Domain Service)
    private readonly deliveryPort: DeliveryPort // 交付
  ) {}

  /**
   * 编排标准流程 (Workflow Sequence)
   */
  public async executeWorkflow(): Promise<void> {
    // 1. 数据摄取 (Data Ingestion)
    const defects = await this.defectIngestionPort.ingestDefects();
    
    // 无缺陷则早退
    if (!defects || defects.length === 0) {
      return;
    }

    const auditTasks: AuditTask[] = [];

    // 2. 上下文补齐 (Context Discovery) 与 组装任务
    for (const defect of defects) {
      const businessRule = await this.contextDiscoveryPort.discoverContext(defect);
      const auditTask = new AuditTask(defect, businessRule);
      auditTasks.push(auditTask);
    }

    // 3. 组装与推理推理 (Reasoning) 及 沉淀评估结果
    // 注意：这里可以选择并发处理，为了严格控制 Token 和外部并发，先用串行
    for (const task of auditTasks) {
      task.beginEvaluation();
      try {
        const evaluationResult = await this.impactAssessor.assess(task.defect, task.businessContext);
        task.recordResult(evaluationResult);
      } catch (error: any) {
        task.recordFailure(error.message || 'Unknown error occurred during impact assessment');
      }
    }

    // 4. 交付与分发 (Delivery)
    await this.deliveryPort.deliver(auditTasks);
  }
}
