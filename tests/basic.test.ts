describe('Basic Test Setup', () => {
  test('should be able to run tests', () => {
    expect(true).toBe(true);
  });

  test('should support basic math', () => {
    expect(2 + 2).toBe(4);
  });

  test('should support async tests', async () => {
    const result = await Promise.resolve('hello');
    expect(result).toBe('hello');
  });
});
