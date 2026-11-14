/** Native transactions serialize saved metadata across same-origin windows. */
export function createSavedSnapshot(factory: IDBFactory | undefined) {
  let connection: Promise<IDBDatabase> | undefined;
  function open(): Promise<IDBDatabase> {
    if (!factory) return Promise.reject(new Error('IndexedDB is unavailable'));
    if (connection) return connection;
    const attempt = new Promise<IDBDatabase>((resolve, reject) => {
      const request = factory.open('talksprout:saved', 1);
      let blocked = false;
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('snapshot')) {
          request.result.createObjectStore('snapshot');
        }
      };
      request.onerror = () => reject(request.error ?? new Error('Could not open saved metadata'));
      request.onblocked = () => {
        blocked = true;
        reject(new Error('Saved metadata database upgrade is blocked'));
      };
      request.onsuccess = () => {
        const database = request.result;
        if (blocked) { database.close(); return; }
        database.onversionchange = () => {
          database.close();
          connection = undefined;
        };
        resolve(database);
      };
    });
    connection = attempt;
    void attempt.catch(() => { if (connection === attempt) connection = undefined; });
    return attempt;
  }
  async function transact<T>(
    mode: IDBTransactionMode,
    change: (raw: unknown | undefined) => T,
    beforeCommit?: (next: T) => void,
  ): Promise<T> {
    const database = await open();
    return new Promise<T>((resolve, reject) => {
      const transaction = database.transaction('snapshot', mode);
      const store = transaction.objectStore('snapshot');
      let next: T;
      let failure: unknown;
      transaction.oncomplete = () => resolve(next);
      transaction.onabort = () => reject(failure ?? transaction.error ?? new Error('Saved metadata transaction aborted'));
      transaction.onerror = () => {
        failure ??= transaction.error ?? new Error('Saved metadata transaction failed');
      };
      const request = store.get('current');
      request.onsuccess = () => {
        try {
          next = change(request.result as unknown);
          beforeCommit?.(next);
          if (mode === 'readwrite') store.put(next, 'current');
        } catch (error) {
          failure = error;
          transaction.abort();
        }
      };
    });
  }
  return {
    read: (): Promise<unknown | undefined> => transact('readonly', raw => raw),
    update: <T>(change: (raw: unknown | undefined) => T, beforeCommit: (next: T) => void): Promise<T> =>
      transact('readwrite', change, beforeCommit),
  };
}
