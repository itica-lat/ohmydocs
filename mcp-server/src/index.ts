#!/usr/bin/env bun
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server";
import { stateManager } from "./state";

interface Session {
  transport: WebStandardStreamableHTTPServerTransport;
  server: McpServer;
}

async function main(): Promise<void> {
  stateManager.loadPersisted();

  const args = process.argv.slice(2);
  const transportFlag = args.find((a) => a.startsWith("--transport="));
  const portFlag = args.find((a) => a.startsWith("--port="));
  const transport = transportFlag ? transportFlag.split("=")[1] : "stdio";
  const port =
    Number.parseInt(process.env.PORT ?? "", 10) ||
    (portFlag ? Number.parseInt(portFlag.split("=")[1], 10) : 3102);

  if (transport === "http") {
    await startHttpServer(port);
  } else {
    await startStdioServer();
  }
}

async function startHttpServer(port: number): Promise<void> {
  const { WebStandardStreamableHTTPServerTransport } =
    await import("@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js");

  const sessions = new Map<string, Session>();

  Bun.serve({
    port,
    async fetch(request) {
      const url = new URL(request.url);
      if (url.pathname !== "/mcp") {
        return new Response("Not found", { status: 404 });
      }

      const sessionId = request.headers.get("mcp-session-id");

      // Route to existing session
      if (sessionId) {
        const session = sessions.get(sessionId);
        if (!session) {
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              error: { code: -32001, message: "Session not found" },
              id: null,
            }),
            { status: 404, headers: { "Content-Type": "application/json" } },
          );
        }

        if (request.method === "DELETE") {
          sessions.delete(sessionId);
        }

        return session.transport.handleRequest(request);
      }

      // No session ID — must be a POST with an initialize request
      if (request.method !== "POST") {
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32000, message: "Mcp-Session-Id header is required" },
            id: null,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      let body: unknown;
      try {
        body = await request.clone().json();
      } catch {
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32700, message: "Parse error: Invalid JSON" },
            id: null,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const messages = Array.isArray(body) ? body : [body];
      const isInitialize = messages.some(
        (m: Record<string, unknown>) => m?.method === "initialize",
      );

      if (!isInitialize) {
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32000, message: "Mcp-Session-Id header is required" },
            id: null,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Create a fresh transport + McpServer pair for this session
      const { WebStandardStreamableHTTPServerTransport: Transport } =
        await import("@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js");

      const transport = new Transport({
        sessionIdGenerator: () => crypto.randomUUID(),
      });
      const server = createServer();
      await server.connect(transport);

      const response = await transport.handleRequest(request, { parsedBody: body });
      const newSessionId = response.headers.get("mcp-session-id");

      if (newSessionId) {
        sessions.set(newSessionId, { transport, server });
      }

      return response;
    },
  });

  console.error(`ohmydocs MCP server running on http://localhost:${port}/mcp`);
}

async function startStdioServer(): Promise<void> {
  const server = createServer();
  const stdioTransport = new StdioServerTransport();
  await server.connect(stdioTransport);
  console.error("ohmydocs MCP server running on stdio");
}

main().catch((error: unknown) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
