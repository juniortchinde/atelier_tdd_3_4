"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const random_name_generator_adapter_1 = require("./random-name-generator.adapter");
describe('RandomNameGeneratorAdapter', () => {
    it('should generate a random name in the format "adjective-noun"', () => {
        const adapter = new random_name_generator_adapter_1.RandomNameGeneratorAdapter();
        const name = adapter.generate();
        expect(name).toMatch(/^[a-z]+-[a-z]+$/);
    });
});
//# sourceMappingURL=random-name-generator.adapter.test.js.map