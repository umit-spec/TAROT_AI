import { EMPTY_KNOWLEDGE_CONTEXT, KnowledgeContext } from '../../types/knowledge';

export function testKnowledge(overrides: Partial<KnowledgeContext> = {}): KnowledgeContext {
  return { ...EMPTY_KNOWLEDGE_CONTEXT, ...overrides };
}
