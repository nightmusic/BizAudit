import { TechDefect } from '../../domain/entities/TechDefect';
import { BusinessRule } from '../../domain/value-objects/BusinessRule';

export interface ContextDiscoveryPort {
  /**
   * 接口契约：根据指定的「技术缺陷」物理定位，寻找同等界别或向上最近的 BDD/DDD 纯文本领域资产
   * 找不到则返回 undefined （可能作为纯技术缺陷降级）
   */
  discoverContext(defect: TechDefect): Promise<BusinessRule | undefined>;
}
