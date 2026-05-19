import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDocumentTools } from "./tools/documents";
import { registerBrandingTools } from "./tools/branding";
import { registerTemplateTools } from "./tools/templates";
import { registerContextTools } from "./tools/context";
import { registerDomainResources } from "./resources/domain";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "ohmydocs",
    version: "1.1.0",
  });

  // Tools
  registerDocumentTools(server);
  registerBrandingTools(server);
  registerTemplateTools(server);
  registerContextTools(server);

  // Resources (readable documentation for LLMs)
  registerDomainResources(server);

  return server;
}
