import { TechDefect } from './TechDefect';
import { BusinessRule } from '../value-objects/BusinessRule';
import { EvaluationResult } from '../value-objects/EvaluationResult';
import { AuditStatus } from '../types/AuditStatus';
import { randomUUID } from 'crypto';

export class AuditTask {
  public readonly id: string;
  public status: AuditStatus;
  public result: EvaluationResult | null = null;
  public readonly defect: TechDefect;
  public readonly businessContext?: BusinessRule;
  public errorReason?: string;

  constructor(defect: TechDefect, businessContext?: BusinessRule) {
    this.id = randomUUID(); // 任务具有唯一生命周期标识
    this.status = AuditStatus.PENDING;
    this.defect = defect;
    this.businessContext = businessContext;
  }

  /**
   * 业务行为：开启评估流程
   */
  public beginEvaluation(): void {
    if (this.status !== AuditStatus.PENDING) {
      throw new Error(`Cannot begin evaluation from status: ${this.status}`);
    }
    this.status = AuditStatus.EVALUATING;
  }

  /**
   * 业务行为：记录评估结果并扭转状态
   */
  public recordResult(result: EvaluationResult): void {
    if (this.status !== AuditStatus.EVALUATING) {
      throw new Error(`Cannot record result from status: ${this.status}`);
    }
    this.result = result;
    this.status = AuditStatus.COMPLETED;
  }

  /**
   * 业务行为：任务流转失败记录
   */
  public recordFailure(reason: string): void {
    if (this.status !== AuditStatus.EVALUATING) {
      throw new Error(`Cannot record failure from status: ${this.status}`);
    }
    this.errorReason = reason;
    this.status = AuditStatus.FAILED;
  }
}
