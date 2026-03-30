import * as fs from 'fs';
import * as path from 'path';
import { DefectIngestionPort } from '../../application/ports/DefectIngestionPort';
import { TechDefect } from '../../domain/entities/TechDefect';

export class LinterReportParser implements DefectIngestionPort {
  constructor(private readonly reportFilePath: string) {}

  async ingestDefects(): Promise<TechDefect[]> {
    if (!fs.existsSync(this.reportFilePath)) {
      throw new Error(`Report file not found: ${this.reportFilePath}`);
    }

    const reportContent = fs.readFileSync(this.reportFilePath, 'utf-8');
    const defects: TechDefect[] = [];

    try {
      // Assuming a simple ESLint-like JSON format for demonstration
      // Format: [{ filePath: string, messages: [{ line: number, ruleId: string, message: string }] }]
      const parsedReport = JSON.parse(reportContent);

      if (!Array.isArray(parsedReport)) {
        throw new Error('Invalid JSON report format. Expected an array of results.');
      }

      for (const fileResult of parsedReport) {
        if (!fileResult?.filePath || !fileResult.messages || !Array.isArray(fileResult.messages)) {
          continue;
        }

        for (const msg of fileResult.messages) {
          // Keep fatal/parser-level defects in the pipeline even when ruleId is missing.
          const errorSignature =
            typeof msg?.ruleId === 'string' && msg.ruleId.trim().length > 0
              ? msg.ruleId
              : 'fatal';
          const lineNumber =
            typeof msg?.line === 'number' && msg.line > 0
              ? msg.line
              : 0;

          defects.push(
            new TechDefect(
              path.resolve(fileResult.filePath),
              lineNumber,
              errorSignature,
              msg?.message || 'No description provided'
            )
          );
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to parse linter report: ${error.message}`);
    }

    return defects;
  }
}
