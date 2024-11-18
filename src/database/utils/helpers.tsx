import {SQLiteBindParams, SQLiteDatabase} from 'expo-sqlite';

export function runTransaction(
  db: SQLiteDatabase,
  queryObject: Array<[string, SQLiteBindParams]>,
) {
  db.withTransactionAsync(async () => {
    for (const [query, params] of queryObject) {
      db.runAsync(query, params);
    }
  });
}

export function getAllTransaction(
  db: SQLiteDatabase,
  queryObject: Array<[string] | [string, SQLiteBindParams | undefined]>,
) {
  return new Promise(resolve =>
    db.withTransactionAsync(async () => {
      for (const [query, params] of queryObject) {
        db.getAllAsync(query, params ?? []).then(res => {
          resolve(res as any);
        });
      }
    }),
  );
}
