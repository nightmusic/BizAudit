import { AuditTask } from '../../domain/entities/AuditTask';

export interface DeliveryPort {
  /**
   * 接口契约：把一组已经走完评估流程的任务“交付”给输出端
   * 例如渲染到终端控制台、提交 Github PR Comment 甚至当做内部 MCP Server 的响应
   */
  deliver(tasks: AuditTask[]): Promise<void>;
}
