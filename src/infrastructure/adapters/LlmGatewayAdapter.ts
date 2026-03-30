import { LlmGatewayPort } from '../../application/ports/LlmGatewayPort';

// This is a mockup of the LLM Gateway adapter, later this will be implemented using official SDKs (e.g. OpenAI, Anthropic, Google)
export class LlmGatewayAdapter implements LlmGatewayPort {
  constructor(private readonly apiKey?: string) {}

  async invokeModel(prompt: string): Promise<string> {
    // Mock the external LLM call with a business-impact-oriented structured response.
    const promptLower = prompt.toLowerCase();

    const businessCriticalSignals = [
      'payment',
      'refund',
      'settlement',
      'order',
      'inventory',
      'permission',
      'entitlement',
      'reconciliation',
      '支付',
      '退款',
      '结算',
      '订单',
      '库存',
      '权限',
      '对账'
    ];

    const hasCriticalSignal = businessCriticalSignals.some(signal => promptLower.includes(signal));
    const hasAsyncRisk = promptLower.includes('promise') || promptLower.includes('await');

    if (hasCriticalSignal && hasAsyncRisk) {
      return Promise.resolve([
        'SEVERITY: HIGH',
        'IMPACT: 该缺陷看起来只是异步处理问题，但一旦落在关键业务链路中，可能导致状态未及时落库、重复执行或结果不一致，进而影响支付、订单或结算流程，建议在发布前修复。',
        'ACTION: FIX_BEFORE_RELEASE'
      ].join('\n'));
    }

    if (hasCriticalSignal) {
      return Promise.resolve([
        'SEVERITY: HIGH',
        'IMPACT: 该缺陷命中了核心业务上下文，即使技术表象不重，也可能直接影响关键业务结果的正确性，建议优先处理并在发布前完成验证。',
        'ACTION: FIX_BEFORE_RELEASE'
      ].join('\n'));
    }

    return Promise.resolve([
      'SEVERITY: MEDIUM',
      'IMPACT: 该缺陷暂未显示出明确的毁灭性业务后果，但可能造成局部流程异常或增加人工排查成本，建议安排修复并结合业务上下文进一步复核。',
      'ACTION: SCHEDULED_FIX'
    ].join('\n'));
  }
}
