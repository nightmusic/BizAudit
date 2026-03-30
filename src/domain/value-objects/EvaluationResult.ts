import { SeverityLevel } from '../types/SeverityLevel';

export class EvaluationResult {
  constructor(
    public readonly severity: SeverityLevel,
    public readonly impactDescription: string
  ) {
    Object.freeze(this); // 值对象应当保持不可变特性
  }
}
