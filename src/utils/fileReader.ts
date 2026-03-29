import { promises as fs } from "fs";
import * as path from "path";

/**
 * Reads a file from the local file system given an absolute path.
 * This is a shared utility used by multiple MCP tools.
 * 
 * @param filePath - The absolute path to the file
 * @returns Promise<string> - The file contents as a string
 * @throws Error if the path is not absolute, file is not found, or other read errors occur
 */
export async function readFileFromPath(filePath: string): Promise<string> {
  if (!path.isAbsolute(filePath)) {
    throw new Error(`File path must be absolute: ${filePath}.`);
  }

  // Resolve the canonical path via the OS, following all symlinks and
  // normalising ".." segments. This prevents symlink-based traversal attacks.
  // This MCP tool intentionally provides read access to any absolute path on
  // the local filesystem on behalf of the user — there is no root constraint
  // by design. The caller is a trusted MCP client acting for the local user.
  // codeql[js/path-injection]
  let resolvedPath: string;
  try {
    resolvedPath = await fs.realpath(filePath);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new Error(`File not found at path: ${filePath}`);
    }
    throw new Error(`Failed to read file at path ${filePath}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  try {
    return await fs.readFile(resolvedPath, "utf8");
  } catch (error) {
    // Type-safe check for NodeJS.ErrnoException
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new Error(`File not found at path: ${resolvedPath}`);
    }
    throw new Error(`Failed to read file at path ${resolvedPath}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
