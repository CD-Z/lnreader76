import * as SQLite from 'expo-sqlite';
import {
  createCategoriesTableQuery,
  createCategoryDefaultQuery,
  createCategoryTriggerQuery,
} from './tables/CategoryTable';
import {createNovelTableQuery} from './tables/NovelTable';
import {createNovelCategoryTableQuery} from './tables/NovelCategoryTable';
import {
  createChapterTableQuery,
  createChapterNovelIdIndexQuery,
} from './tables/ChapterTable';

import {createRepositoryTableQuery} from './tables/RepositoryTable';

const dbName = 'lnreader.db';

const db = SQLite.openDatabaseSync(dbName);

export const createTables = async () => {
  await db.execAsync('PRAGMA foreign_keys = ON');
  db.withTransactionSync(() => {
    db.runAsync(createNovelTableQuery);
    db.runAsync(createCategoriesTableQuery);
    db.runAsync(createCategoryDefaultQuery);
    db.runAsync(createCategoryTriggerQuery);
    db.runAsync(createNovelCategoryTableQuery);
    db.runAsync(createChapterTableQuery);
    db.runAsync(createChapterNovelIdIndexQuery);
  });

  db.withTransactionAsync(async () => {
    db.runAsync(createRepositoryTableQuery);
  });
};

/**
 * For Testing
 */
export const deleteDatabase = async () => {
  db.withTransactionSync(() => {
    db.runAsync('DROP TABLE Category');
    db.runAsync('DROP TABLE Novel');
    db.runAsync('DROP TABLE NovelCategory');
    db.runAsync('DROP TABLE Chapter');
    db.runAsync('DROP TABLE Download');
    db.runAsync('DROP TABLE Repository');
  });
};
