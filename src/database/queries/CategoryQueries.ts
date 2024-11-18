import * as SQLite from 'expo-sqlite';
import {BackupCategory, Category, NovelCategory, CCategory} from '../types';
import {showToast} from '@utils/showToast';
import {getString} from '@strings/translations';
const db = SQLite.openDatabaseSync('lnreader.db');

const getCategoriesQuery = `
  SELECT * FROM Category ORDER BY sort
	`;

export const getCategoriesFromDb = async (): Promise<Category[]> => {
  return new Promise(resolve =>
    db.withTransactionAsync(async () => {
      db.getAllAsync(getCategoriesQuery).then(res => {
        resolve(res as any);
      });
    }),
  );
};

export const getCategoriesWithCount = async (
  novelIds: number[],
): Promise<CCategory[]> => {
  const getCategoriesWithCountQuery = `
  SELECT *, novelsCount 
  FROM Category LEFT JOIN 
  (
    SELECT categoryId, COUNT(novelId) as novelsCount 
    FROM NovelCategory WHERE novelId in (${novelIds.join(
      ',',
    )}) GROUP BY categoryId 
  ) as NC ON Category.id = NC.categoryId
  WHERE Category.id != 2
  ORDER BY sort
	`;

  return new Promise(resolve =>
    db.withTransactionAsync(async () => {
      db.getAllAsync(getCategoriesWithCountQuery).then(res => {
        resolve(res as any);
      });
    }),
  );
};

const createCategoryQuery = 'INSERT INTO Category (name) VALUES (?)';

export const createCategory = async (categoryName: string): Promise<void> =>
  db.withTransactionAsync(async () => {
    db.runAsync(createCategoryQuery, [categoryName]);
  });

const beforeDeleteCategoryQuery = `
    UPDATE NovelCategory SET categoryId = (SELECT id FROM Category WHERE sort = 1)
    WHERE novelId IN (
      SELECT novelId FROM NovelCategory
      GROUP BY novelId
      HAVING COUNT(categoryId) = 1
    )
    AND categoryId = ?;
`;
const deleteCategoryQuery = 'DELETE FROM Category WHERE id = ?';

export const deleteCategoryById = (category: Category): void => {
  if (category.sort === 1 || category.id === 2) {
    return showToast(getString('categories.cantDeleteDefault'));
  }
  db.withTransactionAsync(async () => {
    db.runAsync(beforeDeleteCategoryQuery, [category.id]);
    db.runAsync(deleteCategoryQuery, [category.id]);
  });
};

const updateCategoryQuery = 'UPDATE Category SET name = ? WHERE id = ?';

export const updateCategory = async (
  categoryId: number,
  categoryName: string,
): Promise<void> =>
  db.withTransactionAsync(async () => {
    db.runAsync(updateCategoryQuery, [categoryName, categoryId]);
  });

const isCategoryNameDuplicateQuery = `
  SELECT COUNT(*) as isDuplicate FROM Category WHERE name = ?
	`;

export const isCategoryNameDuplicate = (
  categoryName: string,
): Promise<boolean> => {
  return new Promise(resolve =>
    db.withTransactionAsync(async () => {
      db.getAllAsync(isCategoryNameDuplicateQuery, [categoryName]).then(res => {
        const {_array} = res as any;
        resolve(Boolean(_array[0]?.isDuplicate));
      });
    }),
  );
};

const updateCategoryOrderQuery = 'UPDATE Category SET sort = ? WHERE id = ?';

export const updateCategoryOrderInDb = (categories: Category[]): void => {
  // Do not set local as default one
  if (categories.length && categories[0].id === 2) {
    return;
  }
  db.withTransactionAsync(async () => {
    categories.map(category => {
      db.runAsync(updateCategoryOrderQuery, [category.sort, category.id]);
    });
  });
};

export const getAllNovelCategories = (): Promise<NovelCategory[]> => {
  return new Promise(resolve =>
    db.withTransactionAsync(async () => {
      db.getAllAsync('SELECT * FROM NovelCategory').then(res => {
        resolve(res as any);
      });
    }),
  );
};

export const _restoreCategory = (category: BackupCategory) => {
  db.withTransactionAsync(async () => {
    db.runAsync('DELETE FROM Category WHERE id = ? OR sort = ?', [
      category.id,
      category.sort,
    ]);

    db.runAsync('INSERT INTO Category (id, name, sort) VALUES (?, ?, ?)', [
      category.id,
      category.name,
      category.sort,
    ]);
    for (const novelId of category.novelIds) {
      db.runAsync(
        'INSERT INTO NovelCategory (categoryId, novelId) VALUES (?, ?)',
        [category.id, novelId],
      );
    }
  });
};
