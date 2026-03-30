import { TechDefect } from '../../domain/entities/TechDefect';

export interface DefectIngestionPort {
  /**
   * 接口契约：从外部信源（如 Linter XML/JSON 等报表）提取一系列标准化「技术缺陷」
   */
  ingestDefects(): Promise<TechDefect[]>;
}
