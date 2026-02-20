/**
 * LangChain middleware for the Auth Permission Engine.
 *
 * SecureTool wraps any LangChain-compatible tool and enforces Prism
 * authorization *before* the tool function runs. It works with:
 *   - LangChain.js (@langchain/core StructuredTool / DynamicTool)
 *   - Any object that exposes name, description, and an invoke/call method.
 *
 * @module langchain
 */
export { SecureTool } from "./secure-tool.js";
export type { SecureToolOptions, ToolCallResult } from "./secure-tool.js";
export { SemanticPolicyGenerator } from "./SemanticPolicyGenerator.js";
