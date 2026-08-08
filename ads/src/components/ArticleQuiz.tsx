import { AnimatePresence, motion } from 'framer-motion';
import { Check, HelpCircle, RotateCcw, Sparkles, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { QuizQuestion } from '../types';
import AnimatedCheckmark from './AnimatedCheckmark';

interface ArticleQuizProps {
  articleId: string;
  questions: QuizQuestion[];
}

type AnswerState = Record<string, { index: number; correct: boolean }>;

export default function ArticleQuiz({ articleId, questions }: ArticleQuizProps) {
  const optionLetters = ['أ', 'ب', 'ج', 'د'];
  const persistedCorrect = useAppStore((state) => state.correctAnswersByArticle[articleId] ?? []);
  const markCorrect = useAppStore((state) => state.markQuestionCorrect);
  const completed = useAppStore((state) => state.completedArticleIds.includes(articleId));
  const [answers, setAnswers] = useState<AnswerState>({});
  const [celebrate, setCelebrate] = useState(false);
  const completionFired = useRef(completed);
  const correctCount = useMemo(() => new Set([...persistedCorrect, ...Object.entries(answers).filter(([, value]) => value.correct).map(([key]) => key)]).size, [persistedCorrect, answers]);

  const answer = (question: QuizQuestion, index: number) => {
    if (persistedCorrect.includes(question.id) || answers[question.id]?.correct) return;
    const isCorrect = index === question.correct_index;
    setAnswers((current) => ({ ...current, [question.id]: { index, correct: isCorrect } }));
    if (isCorrect) {
      const before = new Set([...persistedCorrect, ...Object.entries(answers).filter(([, value]) => value.correct).map(([key]) => key)]).size;
      markCorrect(articleId, question.id, questions.length);
      if (before + 1 === questions.length && !completionFired.current) {
        completionFired.current = true;
        setCelebrate(true);
        window.setTimeout(() => setCelebrate(false), 1800);
      }
    }
  };

  return (
    <section className="relative mt-10 overflow-hidden rounded-4xl border border-brand-200 bg-gradient-to-b from-brand-50 to-white p-4 shadow-soft dark:border-brand-800 dark:from-brand-950/55 dark:to-[rgb(var(--surface))] sm:p-6" aria-labelledby="quiz-title">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow"><HelpCircle size={23} /></span>
        <div className="min-w-0 flex-1"><p className="section-kicker">اختبر فهمك</p><h2 id="quiz-title" className="mt-0.5 text-xl font-extrabold">ثلاثة أسئلة لإكمال المقال</h2><p className="muted-text mt-1 text-xs leading-6">أجب بأي ترتيب. يمكنك تصحيح الإجابة فورًا، ولن يظهر الإنجاز قبل إتمام الأسئلة كلها.</p></div>
        <div className="hidden sm:block"><AnimatedCheckmark complete={completed} celebrate={celebrate} /></div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/70 p-3 dark:bg-white/[0.045]">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-100 dark:bg-white/10"><motion.div className="h-full rounded-full bg-gradient-to-l from-brand-600 to-emerald-400" animate={{ width: `${(correctCount / questions.length) * 100}%` }} /></div>
        <strong className="text-xs text-brand-700 dark:text-brand-300">{correctCount} / {questions.length}</strong>
      </div>

      <div className="mt-5 space-y-5">
        {questions.map((question, questionIndex) => {
          const persisted = persistedCorrect.includes(question.id);
          const current = answers[question.id];
          const correct = persisted || current?.correct;
          return (
            <article key={question.id} className={`rounded-3xl border p-4 transition-colors ${correct ? 'border-emerald-300 bg-emerald-50/80 dark:border-emerald-500/35 dark:bg-emerald-500/10' : 'border-[rgb(var(--border))] bg-[rgb(var(--surface))]'}`}>
              <div className="flex gap-3"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-extrabold ${correct ? 'bg-emerald-500 text-white' : 'bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200'}`}>{correct ? <Check size={16} /> : questionIndex + 1}</span><h3 className="pt-1 text-sm font-extrabold leading-6">{question.question}</h3></div>
              <div className="mt-4 grid gap-2">
                {question.options.map((option, optionIndex) => {
                  const chosen = current?.index === optionIndex;
                  const wrongChosen = chosen && !current.correct;
                  return (
                    <motion.button
                      whileTap={!correct ? { scale: .99 } : undefined}
                      key={option}
                      type="button"
                      disabled={correct}
                      onClick={() => answer(question, optionIndex)}
                      className={`flex min-h-11 items-center gap-2 rounded-2xl border px-3 py-2 text-right text-xs font-semibold transition-colors ${correct && optionIndex === question.correct_index ? 'border-emerald-400 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200' : wrongChosen ? 'border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200' : 'border-[rgb(var(--border))] bg-[rgb(var(--surface-soft))] hover:border-brand-400'} disabled:cursor-default`}
                    >
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border text-[10px] ${wrongChosen ? 'border-rose-400 bg-rose-500 text-white' : correct && optionIndex === question.correct_index ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-[rgb(var(--border))]'}`}>{wrongChosen ? <X size={13} /> : correct && optionIndex === question.correct_index ? <Check size={13} /> : optionLetters[optionIndex]}</span>
                      {option}
                    </motion.button>
                  );
                })}
              </div>
              <AnimatePresence mode="wait">
                {current && (
                  <motion.div key={current.correct ? 'correct' : 'wrong'} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mt-3 flex gap-2 rounded-2xl p-3 text-[11px] leading-5 ${current.correct ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200' : 'bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200'}`}>
                    {current.correct ? <Check size={15} className="mt-0.5 shrink-0" /> : <RotateCcw size={15} className="mt-0.5 shrink-0" />}
                    <p><strong>{current.correct ? 'إجابة صحيحة.' : 'ليست الإجابة الصحيحة، جرّب مرة أخرى.'}</strong> {question.explanation}</p>
                  </motion.div>
                )}
                {!current && persisted && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 rounded-2xl bg-emerald-100 p-3 text-[11px] leading-5 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200"><strong>أجبت عن هذا السؤال بنجاح.</strong> {question.explanation}</motion.div>}
              </AnimatePresence>
            </article>
          );
        })}
      </div>

      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 rounded-3xl bg-gradient-to-l from-emerald-500 to-teal-500 p-5 text-center text-white shadow-[0_12px_34px_rgba(16,185,129,.25)]">
            <div className="mx-auto w-fit"><AnimatedCheckmark complete size="lg" celebrate={celebrate} /></div>
            <h3 className="mt-3 text-xl font-extrabold">أحسنت، اكتمل المقال!</h3><p className="mt-1 text-xs text-white/80">ثلاث إجابات صحيحة أضيفت إلى تقدّمك المحفوظ.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
