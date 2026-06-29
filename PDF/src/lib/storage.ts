import type { SavedScan } from "../types/scanner";

const DB_NAME = "document-scanner-db";
const STORE_NAME = "scans";
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = run(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function saveScan(scan: SavedScan) {
  await transaction("readwrite", (store) => store.put(scan));
}

export async function getScans(): Promise<SavedScan[]> {
  const scans = await transaction<SavedScan[]>("readonly", (store) => store.getAll());
  return scans.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteScan(id: string) {
  await transaction("readwrite", (store) => store.delete(id));
}
