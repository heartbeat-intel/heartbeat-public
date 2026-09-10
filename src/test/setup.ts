import '@testing-library/jest-dom/vitest';

// In-memory localStorage for every test. Node >= 22 ships its own gated
// `localStorage` global (undefined unless --localstorage-file is given) and
// vitest's jsdom environment never overwrites a key already on the Node
// global, so on a current Node the modal's localStorage.setItem would throw
// here while working in every browser. Installing one deterministically,
// as heartbeat-web's setup does, makes the suite Node-version independent.
const installTestLocalStorage = (): Storage => {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  };
};

const testLocalStorage = installTestLocalStorage();

for (const target of [globalThis, window]) {
  Object.defineProperty(target, 'localStorage', {
    value: testLocalStorage,
    configurable: true,
    writable: true,
  });
}
