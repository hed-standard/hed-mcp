import { readFileFromPath } from '../../src/utils/fileReader';
import * as path from 'path';

describe('fileReader utility', () => {
  const participantsBadPath = path.join(__dirname, '..', 'data', 'participants_bad.json');
  const taskEventsPath = path.join(__dirname, '..', 'data', 'task-FacePerception_events.json');

  describe('readFileFromPath', () => {
    test('should read JSON file content successfully with absolute path', async () => {
      const content = await readFileFromPath(participantsBadPath);
      expect(content).toBeDefined();
      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
      
      // Verify it's valid JSON by parsing it
      const parsedContent = JSON.parse(content);
      expect(parsedContent).toHaveProperty('participant_id');
      expect(parsedContent).toHaveProperty('sex');
      expect(parsedContent).toHaveProperty('age');
    });

    test('should read large JSON file content successfully', async () => {
      const content = await readFileFromPath(taskEventsPath);
      expect(content).toBeDefined();
      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
      
      // Verify it's valid JSON by parsing it
      const parsedContent = JSON.parse(content);
      expect(parsedContent).toHaveProperty('onset');
      expect(parsedContent).toHaveProperty('event_type');
      expect(parsedContent).toHaveProperty('value');
    });

    test('should throw error for relative path', async () => {
      await expect(readFileFromPath('relative/path.txt')).rejects.toThrow('File path must be absolute');
    });

    test('should throw error for non-existent file', async () => {
      const nonExistentPath = path.join(__dirname, '..', 'data', 'non-existent-file.json');
      await expect(readFileFromPath(nonExistentPath)).rejects.toThrow('File not found at path');
    });

    test('should handle other file system errors gracefully', async () => {
      // Test with a directory path instead of file path
      const dirPath = path.join(__dirname, '..', 'data');
      await expect(readFileFromPath(dirPath)).rejects.toThrow('Failed to read file at path');
    });

    test('should read file when path contains redundant .. segments', async () => {
      // A path with extra ".." that still resolves to a real file should succeed
      const pathWithDots = path.join(__dirname, '..', 'data', '..', 'data', 'participants_bad.json');
      const content = await readFileFromPath(pathWithDots);
      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
    });
  });
});
