import { LlmGatewayPort } from '../../application/ports/LlmGatewayPort';

// This is a mockup of the LLM Gateway adapter, later this will be implemented using official SDKs (e.g. OpenAI, Anthropic, Google)
export class LlmGatewayAdapter implements LlmGatewayPort {
  constructor(private readonly apiKey?: string) {}

  async invokeModel(prompt: string): Promise<string> {
    // Mock the external LLM call. In a real scenario, this would manage tokens, network requests, etc.
    return Promise.resolve(`Mock evaluation result based on prompt:\n${prompt}\n\nConclusion: [Medium] Potential logic flaw detected but needs manual review.`);
  }
}
