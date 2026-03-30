export class BusinessRule {
  constructor(
    public readonly domainName: string,
    public readonly ruleDescription: string
  ) {
    Object.freeze(this); // 值对象应当保持不可变特性
  }
}
