import { TechDefect } from '../entities/TechDefect';
import { BusinessRule } from '../value-objects/BusinessRule';
import { EvaluationResult } from '../value-objects/EvaluationResult';

export interface ImpactAssessor {
  /**
   * 核心业务：结合业务上下文计算出包含纯文本与严重等级的总结评估结果
   * 如果由于缺少本地文档没有 context，也要求具备评估手段或降级处理能力
   */
  assess(defect: TechDefect, context?: BusinessRule): Promise<EvaluationResult>;
}
