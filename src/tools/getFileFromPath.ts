import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { readFileFromPath } from "../utils/fileReader.js";

export const getFileFromPath: Tool = {
  name: "getFileFromPath",
  description: "Retrieves a file from the local file system given a path.",
  inputSchema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "The absolute path to the file.",
      },
    },
    required: ["filePath"],
  },
};

export interface GetFileFromPathArgs {
  filePath: string;
}

export async function handleGetFileFromPath(args: GetFileFromPathArgs): Promise<string> {
  const { filePath } = args;
  return await readFileFromPath(filePath);
}
