import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '../types';

interface AppState {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  completedArticleIds: string[];
  correctAnswersByArticle: Record<string, string[]>;
  unlockedArticleIds: string[];
  articleSearch: string;
  articleCategory: string;
  articleTags: string[];
  settingsOpen: boolean;
  filtersOpen: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleNotifications: () => void;
  markQuestionCorrect: (articleId: string, questionId: string, totalQuestions: number) => void;
  unlockArticle: (articleId: string) => void;
  setArticleSearch: (value: string) => void;
  setArticleCategory: (value: string) => void;
  toggleArticleTag: (tag: string) => void;
  clearArticleFilters: () => void;
  setSettingsOpen: (open: boolean) => void;
  setFiltersOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      notificationsEnabled: true,
      completedArticleIds: [],
      correctAnswersByArticle: {},
      unlockedArticleIds: [],
      articleSearch: '',
      articleCategory: 'الكل',
      articleTags: [],
      settingsOpen: false,
      filtersOpen: false,
      setTheme: (theme) => set({ theme }),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      markQuestionCorrect: (articleId, questionId, totalQuestions) => set((state) => {
        const current = state.correctAnswersByArticle[articleId] ?? [];
        const next = current.includes(questionId) ? current : [...current, questionId];
        const completed = next.length >= totalQuestions && !state.completedArticleIds.includes(articleId)
          ? [...state.completedArticleIds, articleId]
          : state.completedArticleIds;
        return {
          correctAnswersByArticle: { ...state.correctAnswersByArticle, [articleId]: next },
          completedArticleIds: completed,
        };
      }),
      unlockArticle: (articleId) => set((state) => ({
        unlockedArticleIds: state.unlockedArticleIds.includes(articleId)
          ? state.unlockedArticleIds
          : [...state.unlockedArticleIds, articleId],
      })),
      setArticleSearch: (articleSearch) => set({ articleSearch }),
      setArticleCategory: (articleCategory) => set({ articleCategory }),
      toggleArticleTag: (tag) => set((state) => ({
        articleTags: state.articleTags.includes(tag)
          ? state.articleTags.filter((item) => item !== tag)
          : [...state.articleTags, tag],
      })),
      clearArticleFilters: () => set({ articleCategory: 'الكل', articleTags: [] }),
      setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
      setFiltersOpen: (filtersOpen) => set({ filtersOpen }),
    }),
    {
      name: 'adwatch-state-v1',
      partialize: (state) => ({
        theme: state.theme,
        notificationsEnabled: state.notificationsEnabled,
        completedArticleIds: state.completedArticleIds,
        correctAnswersByArticle: state.correctAnswersByArticle,
        unlockedArticleIds: state.unlockedArticleIds,
      }),
    },
  ),
);
