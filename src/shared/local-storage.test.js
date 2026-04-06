/* global global */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LocalStorage } from './local-storage.js';

describe('LocalStorage', () => {
  let mockStorage;
  let localStorageMock;

  beforeEach(() => {
    mockStorage = {};
    localStorageMock = {
      getItem: vi.fn(key => mockStorage[key] ?? null),
      setItem: vi.fn((key, value) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn(key => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
      }),
    };
    global.localStorage = localStorageMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('load', () => {
    it('returns null when key does not exist', () => {
      const storage = new LocalStorage({ key: 'nonexistent' });
      expect(storage.load()).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('nonexistent');
    });

    it('returns parsed JSON object', () => {
      mockStorage['test'] = JSON.stringify({ name: 'test', value: 42 });
      const storage = new LocalStorage({ key: 'test' });
      expect(storage.load()).toEqual({ name: 'test', value: 42 });
    });

    it('returns parsed JSON array', () => {
      mockStorage['test'] = JSON.stringify([1, 2, 3]);
      const storage = new LocalStorage({ key: 'test' });
      expect(storage.load()).toEqual([1, 2, 3]);
    });

    it('returns parsed JSON string', () => {
      mockStorage['test'] = JSON.stringify('hello');
      const storage = new LocalStorage({ key: 'test' });
      expect(storage.load()).toBe('hello');
    });

    it('returns parsed JSON number', () => {
      mockStorage['test'] = JSON.stringify(123.45);
      const storage = new LocalStorage({ key: 'test' });
      expect(storage.load()).toBe(123.45);
    });

    it('returns null on invalid JSON', () => {
      mockStorage['test'] = 'not valid json';
      const storage = new LocalStorage({ key: 'test' });
      expect(storage.load()).toBeNull();
    });

    it('returns null on empty string', () => {
      mockStorage['test'] = '';
      const storage = new LocalStorage({ key: 'test' });
      expect(storage.load()).toBeNull();
    });
  });

  describe('save', () => {
    it('saves stringified object', () => {
      const storage = new LocalStorage({ key: 'test' });
      storage.save({ name: 'test', value: 42 });
      expect(mockStorage['test']).toBe(JSON.stringify({ name: 'test', value: 42 }));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test',
        JSON.stringify({ name: 'test', value: 42 })
      );
    });

    it('saves stringified array', () => {
      const storage = new LocalStorage({ key: 'test' });
      storage.save([1, 2, 3]);
      expect(mockStorage['test']).toBe(JSON.stringify([1, 2, 3]));
    });

    it('saves stringified string', () => {
      const storage = new LocalStorage({ key: 'test' });
      storage.save('hello');
      expect(mockStorage['test']).toBe(JSON.stringify('hello'));
    });

    it('saves stringified number', () => {
      const storage = new LocalStorage({ key: 'test' });
      storage.save(42);
      expect(mockStorage['test']).toBe(JSON.stringify(42));
    });

    it('saves null', () => {
      const storage = new LocalStorage({ key: 'test' });
      storage.save(null);
      expect(mockStorage['test']).toBe('null');
    });

    it('saves nested object', () => {
      const storage = new LocalStorage({ key: 'test' });
      storage.save({ nested: { deep: { value: true } } });
      expect(mockStorage['test']).toBe(JSON.stringify({ nested: { deep: { value: true } } }));
    });
  });

  describe('clear', () => {
    it('removes the item from localStorage', () => {
      mockStorage['test'] = JSON.stringify({ data: 'value' });
      const storage = new LocalStorage({ key: 'test' });
      storage.clear();
      expect(mockStorage['test']).toBeUndefined();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test');
    });

    it('does not affect other keys', () => {
      mockStorage['other'] = 'other value';
      mockStorage['test'] = 'test value';
      const storage = new LocalStorage({ key: 'test' });
      storage.clear();
      expect(mockStorage['other']).toBe('other value');
      expect(mockStorage['test']).toBeUndefined();
    });
  });

  describe('integration', () => {
    it('save then load returns original data', () => {
      const storage = new LocalStorage({ key: 'integration' });
      const data = { players: ['Alice', 'Bob'], score: { Alice: 10, Bob: 5 } };
      storage.save(data);
      const loaded = storage.load();
      expect(loaded).toEqual(data);
    });

    it('load after clear returns null', () => {
      mockStorage['test'] = JSON.stringify({ data: 'value' });
      const storage = new LocalStorage({ key: 'test' });
      storage.clear();
      expect(storage.load()).toBeNull();
    });
  });
});
