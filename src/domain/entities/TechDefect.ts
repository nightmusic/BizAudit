import { createHash } from 'crypto';

export class TechDefect {
  public readonly id: string;

  constructor(
    public readonly filePath: string,
    public readonly lineNumber: number,
    public readonly errorSignature: string,
    public readonly message: string // Additional description of the error
  ) {
    this.id = this.generateHashId();
  }

  /**
   * Generates a unique logical hash ID based on the file path, line number, and error signature.
   */
  private generateHashId(): string {
    const rawData = `${this.filePath}:${this.lineNumber}:${this.errorSignature}`;
    return createHash('sha256').update(rawData).digest('hex');
  }
}
