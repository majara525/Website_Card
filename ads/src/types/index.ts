export type ThemeMode = 'light' | 'dark';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  category: 'تاريخ الإعلان' | 'جذب الانتباه' | 'القياس والتحليل' | 'منصات التواصل';
  tags: string[];
  read_time: number;
  excerpt: string;
  body: string;
  premium?: boolean;
  questions: QuizQuestion[];
}

export type AdCategory = 'أثاث' | 'ملابس' | 'إلكترونيات' | 'طعام' | 'سيارات' | 'سفر' | 'عناية' | 'تعليم';

export interface Ad {
  id: string;
  title: string;
  brand: string;
  category: AdCategory;
  thumbnail_url: string;
  video_url: string | null;
  view_count: number;
  is_playable: boolean;
  is_sponsored?: boolean;
  mock_target_age_range: string;
  mock_target_gender: string;
  mock_target_locations: string[];
  creative_note?: string;
}

export interface TargetingSnapshot {
  ageRange: string;
  gender: string;
  locations: string[];
  source: 'mock' | 'meta' | 'tiktok';
}

export interface StudentProgress {
  id: string;
  name: string;
  avatarInitials: string;
  completedArticles: number;
  totalArticles: number;
  averageQuizScore: number;
}
