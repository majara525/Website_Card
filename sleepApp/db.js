// Local repository: its methods can later be replaced by a backend adapter.
const DB_NAME = "sleep-app";
const VERSION = 1;
let dbPromise;

function openDb() {
  if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("nights")) db.createObjectStore("nights", { keyPath: "id" });
      if (!db.objectStoreNames.contains("articles")) db.createObjectStore("articles", { keyPath: "id" });
      if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function request(store, mode, operation) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const result = operation(tx.objectStore(store));
    result.onsuccess = () => resolve(result.result);
    result.onerror = () => reject(result.error);
    tx.onerror = () => reject(tx.error);
  });
}

export const repository = {
  nights: {
    all: () => request("nights", "readonly", store => store.getAll()),
    put: item => request("nights", "readwrite", store => store.put(item))
  },
  articles: {
    all: () => request("articles", "readonly", store => store.getAll()),
    put: item => request("articles", "readwrite", store => store.put(item))
  },
  settings: {
    get: key => request("settings", "readonly", store => store.get(key)),
    put: (key, value) => request("settings", "readwrite", store => store.put({ key, value }))
  }
};
