export class CodeLocation {
  constructor(
    public readonly filePath: string,
    public readonly lineNumber: number
  ) {
    Object.freeze(this); // 值对象应当保持不可变特性 (Immutable)
  }

  public equals(other: CodeLocation): boolean {
    if (!other) return false;
    return this.filePath === other.filePath && this.lineNumber === other.lineNumber;
  }
}
