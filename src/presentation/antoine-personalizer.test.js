import { describe, it, expect } from 'vitest';
import { AntoinePersonalizer } from './antoine-personalizer.js';

describe('AntoinePersonalizer', () => {
  const personalizer = new AntoinePersonalizer();
  const players = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
  ];

  it('should replace %P with current player name', () => {
    const result = personalizer.personalize('%P, do something', { id: 1, name: 'Alice' }, players);
    expect(result).toContain('Alice');
  });

  it('should replace %OX with a random other player', () => {
    const result = personalizer.personalize('%OX, your turn', { id: 1, name: 'Alice' }, players);
    expect(['Bob', 'Charlie']).toContain(result.replace(', your turn', ''));
  });

  it('should replace %O with a random other player', () => {
    const result = personalizer.personalize('%O, pick one', { id: 1, name: 'Alice' }, players);
    expect(['Bob', 'Charlie']).toContain(result.replace(', pick one', ''));
  });

  it('should replace {P#him*her*them} with first alternative', () => {
    const result = personalizer.personalize(
      'Give {P#him*her*them} a drink',
      { id: 1, name: 'Alice' },
      players
    );
    expect(result).toBe('Give him a drink');
  });

  it('should replace {OX#his*her*their} with first alternative', () => {
    const result = personalizer.personalize(
      'Touch {OX#his*her*their} hand',
      { id: 1, name: 'Alice' },
      players
    );
    expect(result).toBe('Touch his hand');
  });

  it('should handle {2Players#a*b} with 2 players', () => {
    const twoPlayers = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
    const result = personalizer.personalize(
      '{2Players#just two*more than two}',
      { id: 1, name: 'Alice' },
      twoPlayers
    );
    expect(result).toBe('just two');
  });

  it('should handle {2Players#a*b} with more than 2 players', () => {
    const result = personalizer.personalize(
      '{2Players#just two*more than two}',
      { id: 1, name: 'Alice' },
      players
    );
    expect(result).toBe('more than two');
  });

  it('should handle {Multi#a*b} inversely', () => {
    const result = personalizer.personalize('{Multi#many*few}', { id: 1, name: 'Alice' }, players);
    expect(result).toBe('many');
  });

  it('should handle {Couple#a*b}', () => {
    const result = personalizer.personalize(
      '{Couple#couple text*other text}',
      { id: 1, name: 'Alice' },
      players
    );
    expect(result).toBe('couple text');
  });

  it('should remove {cash#N} blocks', () => {
    const result = personalizer.personalize(
      'Earn {cash#1500} points',
      { id: 1, name: 'Alice' },
      players
    );
    expect(result).toBe('Earn points');
  });

  it('should return sentence unchanged if no tokens', () => {
    const result = personalizer.personalize('Hello world', { id: 1, name: 'Alice' }, players);
    expect(result).toBe('Hello world');
  });

  it('should handle single player gracefully', () => {
    const singlePlayer = [{ id: 1, name: 'Alice' }];
    const result = personalizer.personalize(
      '%P and %OX are friends',
      { id: 1, name: 'Alice' },
      singlePlayer
    );
    expect(result).toBe('Alice and Alice are friends');
  });
});
