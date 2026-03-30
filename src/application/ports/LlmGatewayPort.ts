export interface LlmGatewayPort {
  /**
   * 接口契约：封装与大模型间的双向交互，隐藏具体的 Token 管理器、网络请求包、甚至密钥注入操作
   */
  invokeModel(prompt: string): Promise<string>;
}
