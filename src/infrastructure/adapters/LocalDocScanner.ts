import * as fs from 'fs';
import * as path from 'path';
import { ContextDiscoveryPort } from '../../application/ports/ContextDiscoveryPort';
import { TechDefect } from '../../domain/entities/TechDefect';
import { BusinessRule } from '../../domain/value-objects/BusinessRule';

export class LocalDocScanner implements ContextDiscoveryPort {
  async discoverContext(defect: TechDefect): Promise<BusinessRule | undefined> {
    const startDir = path.dirname(defect.filePath);
    let currentDir = path.resolve(startDir);
    const rootDir = process.cwd(); // Don't go above the project root for safety

    while (currentDir.startsWith(rootDir)) {
      if (fs.existsSync(currentDir)) {
        try {
          const files = fs.readdirSync(currentDir);
          for (const file of files) {
            if (file.endsWith('.feature') || file.toLowerCase() === 'domain.md' || file.toLowerCase() === 'readme.md') {
              const fullPath = path.join(currentDir, file);
              const content = fs.readFileSync(fullPath, 'utf-8');
              const domainName = path.basename(file, path.extname(file));
              return new BusinessRule(domainName, content);
            }
          }
        } catch (e) {
          // ignore read errors
        }
      }

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        break;
      }
      currentDir = parentDir;
    }
    
    return undefined;
  }
}
