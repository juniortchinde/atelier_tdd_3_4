import { RandomNameGeneratorAdapter } from './random-name-generator.adapter';

describe('RandomNameGeneratorAdapter', () => {
    it('should generate a random name in the format "adjective-noun"', () => {
        const adapter = new RandomNameGeneratorAdapter();
        const name = adapter.generate();
        expect(name).toMatch(/^[a-z]+-[a-z]+$/);
    });
});
