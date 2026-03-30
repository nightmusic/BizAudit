import { promises as fs } from 'fs';
import { DefectIngestionPort } from '../../application/ports/DefectIngestionPort';
import { TechDefect } from '../../domain/entities/TechDefect';

interface EslintMessage {
  ruleId: string | null;
  severity: number;
  message: string;
  line?: number;
  column?: number;
}

interface EslintFileResult {
  filePath: string;
  messages: EslintMessage[];
}

export class ESLintJsonParser implements DefectIngestionPort {
  /**
   * @param reportFilePath 本地 ESLint JSON 格式报告的绝对或相对路径
   */
  constructor(private readonly reportFilePath: string) {}

  async ingestDefects(): Promise<TechDefect[]> {
    try {
      const rawData = await fs.readFile(this.reportFilePath, 'utf-8');
      const lintResults: EslintFileResult[] = JSON.parse(rawData);
      
      const defects: TechDefect[] = [];

      for (const result of lintResults) {
        for (const msg of result.messages) {
          // 若 ruleId 为空，说明是致命语法错误 (fatal error)
          const errorSignature = msg.ruleId || 'fatal';
          
          defects.push(
            new TechDefect(
              result.filePath,
              msg.line || 0, // eslint 有时会导致无行号配置
              errorSignature,
              msg.message
            )
          );
        }
      }

      return defects;
    } catch (error: any) {
      throw new Error(`Failed to parse ESLint JSON report at ${this.reportFilePath}: ${error.message}`);
    }
  }
}
