#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebSocket, WebSocketServer, RawData } from 'ws';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import tools
import { 
  validateHedString, 
  handleValidateHedString,
  ValidateHedStringArgs 
} from "./tools/validateHedString.js";
import {
  validateHedSidecar,
  handleValidateHedSidecar,
  ValidateHedSidecarArgs
} from "./tools/validateHedSidecar.js";
import {
  validateHedTsv,
  handleValidateHedTsv,
  ValidateHedTsvArgs
} from "./tools/validateHedTsv.js";
import {
  getFileFromPath,
  handleGetFileFromPath,
  GetFileFromPathArgs
} from "./tools/getFileFromPath.js";

// Import resources
import { hedSchemaResource, handleResourceRequest } from "./resources/hedSchema.js";

/**
 * WebSocket transport for MCP server
 */
class WebSocketServerTransport {
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  async start() {
    // WebSocket is already connected when this transport is created
  }

  async close() {
    this.ws.close();
  }

  async send(message: any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  onMessage(callback: (message: any) => void) {
  this.ws.on('message', (data: RawData) => {
      try {
        const message = JSON.parse(data.toString());
        callback(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });
  }

  onClose(callback: () => void) {
    this.ws.on('close', callback);
  }

  onError(callback: (error: Error) => void) {
    this.ws.on('error', (err: Error) => callback(err));
  }
}

/**
 * HED MCP Server with WebSocket support
 */
class HEDMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "hed-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    
    console.error("HED Schema cache initialized");
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [validateHedString, validateHedSidecar, validateHedTsv, getFileFromPath],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "validateHedString":
          const result = await handleValidateHedString(args as ValidateHedStringArgs);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };

        case "validateHedSidecar":
          const sidecarResult = await handleValidateHedSidecar(args as ValidateHedSidecarArgs);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(sidecarResult, null, 2),
              },
            ],
          };

        case "validateHedTsv":
          const tsvResult = await handleValidateHedTsv(args as ValidateHedTsvArgs);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(tsvResult, null, 2),
              },
            ],
          };

        case "getFileFromPath":
          const fileContent = await handleGetFileFromPath(args as unknown as GetFileFromPathArgs);
          return {
            content: [
              {
                type: "text",
                text: fileContent,
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private setupResourceHandlers(): void {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [hedSchemaResource],
      };
    });

    // Handle resource requests
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      try {
        const content = await handleResourceRequest(uri);
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(content, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to read resource ${uri}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  async runStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("HED MCP Server running on stdio");
  }

  async runWebSocket(port: number = 8080): Promise<void> {
    const wss = new WebSocketServer({ port });
    
    console.error(`HED MCP Server WebSocket listening on port ${port}`);
    
  wss.on('connection', async (ws: WebSocket) => {
      console.error('WebSocket client connected');
      
      const transport = new WebSocketServerTransport(ws);
      
      try {
        await this.server.connect(transport as any);
        console.error('MCP server connected to WebSocket client');
      } catch (error) {
        console.error('Failed to connect MCP server to WebSocket:', error);
        ws.close();
      }
      
      ws.on('close', () => {
        console.error('WebSocket client disconnected');
      });
      
  ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
      });
    });

    // Keep the server running
    return new Promise(() => {}); // Never resolve to keep server running
  }
}

// Command line argument parsing
const args = process.argv.slice(2);
const useWebSocket = args.includes('--websocket') || args.includes('-w');
const port = parseInt(args.find(arg => arg.startsWith('--port='))?.split('=')[1] || '8080');

// Start the server
const server = new HEDMCPServer();

if (useWebSocket) {
  server.runWebSocket(port).catch((error) => {
    console.error("WebSocket server error:", error);
    process.exit(1);
  });
} else {
  server.runStdio().catch((error) => {
    console.error("Stdio server error:", error);
    process.exit(1);
  });
}
