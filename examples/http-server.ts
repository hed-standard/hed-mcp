#!/usr/bin/env node

/**
 * HED HTTP REST API Server Example
 * 
 * This is an example implementation of an HTTP REST API server that provides
 * endpoints for HED (Hierarchical Event Descriptor) validation. It demonstrates
 * how to create a web service that allows browser applications and other HTTP
 * clients to validate HED strings, TSV files, and sidecar JSON files.
 * 
 * Features:
 * - CORS-enabled endpoints for browser compatibility
 * - JSON and form-data request parsing
 * - Comprehensive error handling and validation
 * - Health check and API documentation endpoints
 * - Support for all HED validation types (string, TSV, sidecar)
 * 
 * Usage:
 *   npm run build
 *   node examples/http-server.js
 * 
 * The server will start on http://localhost:3000 by default.
 * You can set the PORT environment variable to use a different port.
 * 
 * API Endpoints:
 *   GET  /health                  - Health check
 *   GET  /api                     - API information and documentation
 *   POST /api/file                - Get file content from path
 *   POST /api/validate/string     - Validate a HED string
 *   POST /api/validate/tsv        - Validate TSV file data
 *   POST /api/validate/sidecar    - Validate sidecar JSON data
 * 
 * @author HED-MCP Development Team
 * @version 1.0.0
 * @license MIT
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { 
  handleValidateHedString,
  ValidateHedStringArgs 
} from "../src/tools/validateHedString.js";
import {
  handleValidateHedSidecar,
  ValidateHedSidecarArgs
} from "../src/tools/validateHedSidecar.js";
import {
  handleValidateHedTsv,
  ValidateHedTsvArgs
} from "../src/tools/validateHedTsv.js";
import {
  handleGetFileFromPath,
  GetFileFromPathArgs
} from "../src/tools/getFileFromPath.js";

/**
 * HTTP REST API server for HED validation
 * This allows browser applications to call HED validation via HTTP
 */
class HEDHttpServer {
  private app: express.Application;
  private port: number;
  private readonly examplesDir: string = path.resolve(__dirname, '..', '..', 'examples');

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Enable CORS for browser requests
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://'],
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Rate limiting: max 100 requests per 15 minutes per IP
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // Parse JSON bodies
    this.app.use(express.json({ limit: '10mb' }));
    
    // Parse URL-encoded bodies
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });

    // Serve static files from the examples directory
    this.app.use(express.static(this.examplesDir));
  }

  private setupRoutes(): void {
    // Health check endpoint
  this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // API information endpoint
  this.app.get('/api', (req: Request, res: Response) => {
      res.json({
        name: 'HED Validation API',
        version: '1.0.0',
        description: 'REST API for HED (Hierarchical Event Descriptor) validation',
        endpoints: {
          'GET /health': 'Health check',
          'GET /api': 'API information',
          'POST /api/file': 'Get file content from path',
          'POST /api/validate/string': 'Validate HED string',
          'POST /api/validate/tsv': 'Validate TSV file data',
          'POST /api/validate/sidecar': 'Parse and validate sidecar JSON'
        },
        documentation: 'https://github.com/hed-standard/hed-mcp'
      });
    });

    // Get file content from path
    this.app.post('/api/file', async (req: Request, res: Response) => {
      try {
        const args: GetFileFromPathArgs = {
          filePath: req.body.filePath
        };

        // Validate required parameters
        if (!args.filePath) {
          return res.status(400).json({
            error: 'Missing required parameters',
            required: ['filePath']
          });
        }

        const fileContent = await handleGetFileFromPath(args);
        res.json({
          filePath: args.filePath,
          content: fileContent
        });
      } catch (error) {
        console.error('File retrieval error:', error);
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Validate HED string
  this.app.post('/api/validate/string', async (req: Request, res: Response) => {
      try {
        const args: ValidateHedStringArgs = {
          hedString: req.body.hedString,
          hedVersion: req.body.hedVersion,
          checkForWarnings: req.body.checkForWarnings || false,
          definitions: req.body.definitions || []
        };

        // Validate required parameters
        if (!args.hedString || !args.hedVersion) {
          return res.status(400).json({
            error: 'Missing required parameters',
            required: ['hedString', 'hedVersion']
          });
        }

        const result = await handleValidateHedString(args);
        res.json(result);
      } catch (error) {
        console.error('String validation error:', error);
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Validate TSV data
  this.app.post('/api/validate/tsv', async (req: Request, res: Response) => {
      try {
        const args: ValidateHedTsvArgs = {
          filePath: req.body.filePath || '/virtual/data.tsv',
          hedVersion: req.body.hedVersion,
          checkForWarnings: req.body.checkForWarnings || false,
          fileData: req.body.fileData || '',
          jsonData: req.body.jsonData || '',
          definitions: req.body.definitions || []
        };

        // Validate required parameters
        if (!args.hedVersion) {
          return res.status(400).json({
            error: 'Missing required parameters',
            required: ['hedVersion']
          });
        }

        const result = await handleValidateHedTsv(args);
        res.json(result);
      } catch (error) {
        console.error('TSV validation error:', error);
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Parse and validate sidecar
    this.app.post('/api/validate/sidecar', async (req: Request, res: Response) => {
      try {
        const args: ValidateHedSidecarArgs = {
          filePath: req.body.filePath || '/virtual/sidecar.json',
          hedVersion: req.body.hedVersion,
          checkForWarnings: req.body.checkForWarnings || false,
          jsonData: req.body.jsonData || req.body.fileData || ''
        };

        // Validate required parameters
        if (!args.hedVersion) {
          return res.status(400).json({
            error: 'Missing required parameters',
            required: ['hedVersion']
          });
        }

        const result = await handleValidateHedSidecar(args);
        res.json(result);
      } catch (error) {
        console.error('Sidecar validation error:', error);
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });    // Serve static files (like the browser validator)
    this.app.use('/static', express.static('public'));
    
    // Serve the browser validator at root
  this.app.get('/', (req: Request, res: Response) => {
      res.sendFile(path.join(this.examplesDir, 'hed-validator.html'));
    });

    // Error handling middleware
  this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: err.message
      });
    });

    // 404 handler
  this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not found',
        message: `Endpoint ${req.method} ${req.path} not found`,
        available: [
          'GET /health',
          'GET /api',
          'POST /api/file',
          'POST /api/validate/string',
          'POST /api/validate/tsv',
          'POST /api/validate/sidecar'
        ]
      });
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`🧠 HED HTTP API Server running on http://localhost:${this.port}`);
        console.log(`📊 Health check: http://localhost:${this.port}/health`);
        console.log(`📚 API docs: http://localhost:${this.port}/api`);
        console.log(`🌐 Browser validator: http://localhost:${this.port}/`);
        resolve();
      });
    });
  }
}

// Start the server
const port = parseInt(process.env.PORT || '3000');
const server = new HEDHttpServer(port);

server.start().catch((error) => {
  console.error('Failed to start HTTP server:', error);
  process.exit(1);
});
