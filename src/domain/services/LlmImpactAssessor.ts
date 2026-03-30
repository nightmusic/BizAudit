import { TechDefect } from '../entities/TechDefect';
import { BusinessRule } from '../value-objects/BusinessRule';
import { EvaluationResult } from '../value-objects/EvaluationResult';
import { SeverityLevel } from '../types/SeverityLevel';
import { ImpactAssessor } from './ImpactAssessor';
import { LlmGatewayPort } from '../../application/ports/LlmGatewayPort';

export class LlmImpactAssessor implements ImpactAssessor {
  constructor(private readonly llmGateway: LlmGatewayPort) {}

  async assess(defect: TechDefect, context?: BusinessRule): Promise<EvaluationResult> {
    const prompt = this.buildPrompt(defect, context);
    const rawResponse = await this.llmGateway.invokeModel(prompt);
    return this.parseResponse(rawResponse, context);
  }

  /**
   * 构造发送给大模型的 Prompt 骨架
   * 当没有业务文档时，降级为纯技术维度评估
   */
  private buildPrompt(defect: TechDefect, context?: BusinessRule): string {
    const defectSection = [
      `## 技术缺陷`,
      `- 文件路径: ${defect.filePath}`,
      `- 行号: ${defect.lineNumber}`,
      `- 规则 ID: ${defect.errorSignature}`,
      `- 错误说明: ${defect.message}`,
    ].join('\n');

    const contextSection = context
      ? [
          `## 业务上下文 (来源: ${context.domainName})`,
          context.ruleDescription,
        ].join('\n')
      : `## 业务上下文\n（未找到相关业务文档，请基于通用研发规范进行纯技术维度评估）`;

    const instruction = [
      `## 评估任务`,
      `请综合以上信息，输出一份简洁的业务影响评估。必须以如下格式作答：`,
      `SEVERITY: <FATAL|HIGH|MEDIUM|LOW|NONE>`,
      `IMPACT: <一段简明扼要的中文说明，描述该缺陷对业务的实际影响>`,
    ].join('\n');

    return [defectSection, contextSection, instruction].join('\n\n');
  }

  /**
   * 从 LLM 响应文本中提取 SEVERITY 与 IMPACT
   * 若解析失败则降级为 MEDIUM 级别
   */
  private parseResponse(response: string, context?: BusinessRule): EvaluationResult {
    const severityMatch = response.match(/SEVERITY:\s*(FATAL|HIGH|MEDIUM|LOW|NONE)/i);
    const impactMatch   = response.match(/IMPACT:\s*(.+)/is);

    const severity: SeverityLevel = severityMatch
      ? (severityMatch[1].toUpperCase() as SeverityLevel)
      : SeverityLevel.MEDIUM; // 降级默认值

    const impactDescription = impactMatch
      ? impactMatch[1].trim()
      : context
        ? '未能从 LLM 中获得结构化评估，已降级为中等严重度。'
        : '未找到业务文档，仅完成技术维度评估，建议人工复核。';

    return new EvaluationResult(severity, impactDescription);
  }
}
