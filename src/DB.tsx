import { createEffect, createMemo, createSignal, For } from "solid-js";

const dbName = "EventStorageDB";
let db: IDBDatabase | null = null;

interface EventData {
    id?: number;
    message: string;
}

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("events")) {
        db.createObjectStore("events", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export default function DBSample() {
    const [events, setEvents] = createSignal<EventData[]>([]);
  
    const addEvent = async (message: string) => {
      if (!db) db = (await openDB()) as IDBDatabase;
      const tx = db.transaction("events", "readwrite");
      tx.objectStore("events").add({ message });
      tx.oncomplete = () => loadEvents();
    };
  
    const loadEvents = async () => {
      if (!db) db = (await openDB()) as IDBDatabase;
      const tx = db.transaction("events", "readonly");
      const store = tx.objectStore("events");
      const request = store.getAll();
      request.onsuccess = () => setEvents(request.result);
    };

    const keys = createMemo(() => events().map((e) => e.id!));
    const map = createMemo(() => {
        const map = new Map<number, EventData>();
        events().forEach((e) => map.set(e.id!, e));
        return map;
    });

    createEffect(() => { loadEvents(); });
  
    return (
      <div>
        <h1>Events</h1>
        <button onClick={() => addEvent("New Event at " + new Date().toISOString())}>Add Event</button>
        <ul>
            <For each={keys()}>
            {(key) => {
              const item = map().get(key);
              return (
                <div
                  class="p-2 bg-white shadow rounded mb-2"
                >
                  {item?.message}
                </div>
              );
            }}
            </For>  
        </ul>
      </div>
    );
  }