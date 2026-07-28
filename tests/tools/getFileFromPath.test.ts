import { handleGetFileFromPath } from "../../src/tools/getFileFromPath";
import * as fs from "fs";
import * as path from "path";

describe("handleGetFileFromPath", () => {
  const testDir = path.join(__dirname, "test_files");
  const testFile = path.join(testDir, "test.txt");
  const testContent = "This is a test file.";

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
    fs.writeFileSync(testFile, testContent);
  });

  afterAll(() => {
    fs.unlinkSync(testFile);
    fs.rmdirSync(testDir);
  });

  it("should retrieve the content of an existing file", async () => {
    const content = await handleGetFileFromPath({ filePath: testFile });
    expect(content).toBe(testContent);
  });

  it("should throw an error for a non-absolute path", async () => {
    const relativePath = path.relative(process.cwd(), testFile);
    await expect(handleGetFileFromPath({ filePath: relativePath })).rejects.toThrow(
      `File path must be absolute: ${relativePath}.`
    );
  });

  it("should throw an error if the file does not exist", async () => {
    const nonExistentFile = path.join(testDir, "nonexistent.txt");
    await expect(handleGetFileFromPath({ filePath: nonExistentFile })).rejects.toThrow(
      `File not found at path: ${nonExistentFile}`
    );
  });
});
