import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';

import {getCategoriesFromDb} from '@database/queries/CategoryQueries';
import {
  getLibraryWithCategory,
  getLibraryNovelsFromDb,
} from '@database/queries/LibraryQueries';

import {Category, LibraryNovelInfo, NovelInfo} from '@database/types';

import {useLibrarySettings} from '@hooks/persisted';
import {LibrarySortOrder} from '../constants/constants';

type Library = Category & {novels: LibraryNovelInfo[]};

export const useLibrary = ({searchText}: {searchText?: string}) => {
  const {
    filter,
    sortOrder = LibrarySortOrder.DateAdded_DESC,
    downloadedOnlyMode = false,
  } = useLibrarySettings();

  const [library, setLibrary] = useState<Library[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getLibrary = async () => {
    if (searchText) {
      setIsLoading(true);
    }
    console.log('called1');
    const categories = await getCategoriesFromDb();
    console.log('called2');
    const novels = await getLibraryWithCategory({
      searchText,
      filter,
      sortOrder,
      downloadedOnlyMode,
    });

    // const [categories, novels] = await Promise.all([
    //   getCategoriesFromDb(),
    //   getLibraryWithCategory({
    //     searchText,
    //     filter,
    //     sortOrder,
    //     downloadedOnlyMode,
    //   }),
    // ]);
    console.log(categories, novels);

    const res = categories.map(category => ({
      ...category,
      novels: novels.filter(novel => novel.category === category.name),
    }));

    setLibrary(res);
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      console.log('called');

      getLibrary();
    }, [searchText, filter, sortOrder, downloadedOnlyMode]),
  );

  return {library, isLoading, refetchLibrary: getLibrary};
};

export const useLibraryNovels = () => {
  const [library, setLibrary] = useState<NovelInfo[]>([]);

  const getLibrary = async () => {
    const novels = await getLibraryNovelsFromDb();

    setLibrary(novels);
  };

  useFocusEffect(
    useCallback(() => {
      getLibrary();
    }, []),
  );

  return {library, setLibrary};
};
