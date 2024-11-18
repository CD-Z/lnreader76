import {SQLiteBindParams, SQLiteDatabase, SQLiteRunResult} from 'expo-sqlite';
import {noop} from 'lodash-es';

export type QueryObject = Array<
  | [string]
  | [string, SQLiteBindParams | undefined]
  | [
      string,
      SQLiteBindParams | undefined,
      ((data: SQLiteRunResult) => void) | undefined,
    ]
  | [
      string,
      SQLiteBindParams | undefined,
      ((data: SQLiteRunResult) => void) | undefined,
      ((data: any) => void) | undefined,
    ]
>;
export async function runTransaction(
  db: SQLiteDatabase,
  queryObject: QueryObject,
) {
  db.withTransactionAsync(async () => {
    for (const [
      query,
      params,
      callback = noop,
      catchCallback = noop,
    ] of queryObject) {
      db.runAsync(query, params ?? [])
        .then(callback)
        .catch(catchCallback);
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

export function getFirstTransaction(
  db: SQLiteDatabase,
  queryObject: Array<[string] | [string, SQLiteBindParams | undefined]>,
) {
  return new Promise(resolve =>
    db.withTransactionAsync(async () => {
      for (const [query, params] of queryObject) {
        db.getFirstAsync(query, params ?? []).then(res => {
          resolve(res as any);
        });
      }
    }),
  );
}
