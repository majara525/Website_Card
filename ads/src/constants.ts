import type { AdCategory } from './types';

export const AD_CATEGORIES: Array<{ label: AdCategory; emoji: string }> = [
  { label: 'أثاث', emoji: '🛋️' },
  { label: 'ملابس', emoji: '👕' },
  { label: 'إلكترونيات', emoji: '📱' },
  { label: 'طعام', emoji: '🍽️' },
  { label: 'سيارات', emoji: '🚗' },
  { label: 'سفر', emoji: '✈️' },
  { label: 'عناية', emoji: '✨' },
  { label: 'تعليم', emoji: '🎓' },
];

export const ARTICLE_CATEGORIES = ['الكل', 'تاريخ الإعلان', 'جذب الانتباه', 'القياس والتحليل', 'منصات التواصل'];

export const ARTICLE_TAGS = [
  'تاريخ', 'إعلانات كلاسيكية', 'تطور الإعلان', 'التلفزيون', 'الرقمنة', 'دراسة حالة',
  'حملات ناجحة', 'الإبداع', 'أشكال الإعلان', 'الفيديو', 'الطباعة', 'جذب الانتباه',
  'الخطاف', 'فيديو قصير', 'علم النفس', 'التصميم', 'الصوت', 'سرد القصص', 'العاطفة',
  'دعوة لاتخاذ إجراء', 'التحويل', 'المؤشرات', 'تحليل البيانات', 'التقارير', 'الأدوات',
  'اختبار A/B', 'التجريب', 'التحسين', 'قمع التحويل', 'رحلة العميل', 'فيسبوك',
  'إنستغرام', 'أوقات النشر', 'تيك توك', 'يوتيوب شورتس', 'الجيل زد', 'لينكدإن',
  'سناب شات', 'استهداف الجمهور',
];

export const CATEGORY_COLORS: Record<string, string> = {
  'تاريخ الإعلان': 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  'جذب الانتباه': 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
  'القياس والتحليل': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300',
  'منصات التواصل': 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
};
