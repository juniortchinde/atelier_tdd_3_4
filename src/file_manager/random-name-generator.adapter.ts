import { IRandomNameGenerator } from './random-name-generator.interface';

const adjectives = [
    "happy",
    "silly",
    "bumpy",
    "grumpy",
    "fluffy",
    "scary",
    "tiny",
    "giant",
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "black",
    "white",
    "brown",
    "pink",
    "gray",
    "silver",
];

const nouns = [
    "cat",
    "dog",
    "house",
    "car",
    "tree",
    "flower",
    "book",
    "computer",
    "phone",
    "table",
    "chair",
    "sun",
    "moon",
    "star",
    "cloud",
    "water",
    "fire",
    "earth",
    "air",
    "love",
];

export class RandomNameGeneratorAdapter implements IRandomNameGenerator {
    generate(): string {
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${adjective}-${noun}`;
    }
}
