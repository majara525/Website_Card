export function HomeSkeleton() {
  return (
    <div className="page-container space-y-7" aria-label="جارٍ تحميل الإعلانات" aria-busy="true">
      <div className="skeleton h-44 rounded-4xl" />
      <div className="space-y-3"><div className="skeleton h-6 w-36 rounded-lg" /><div className="flex gap-3 overflow-hidden"><div className="skeleton h-56 min-w-64 rounded-3xl" /><div className="skeleton h-56 min-w-64 rounded-3xl" /></div></div>
      <div className="grid grid-cols-2 gap-3"><div className="skeleton h-20 rounded-2xl" /><div className="skeleton h-20 rounded-2xl" /><div className="skeleton h-20 rounded-2xl" /><div className="skeleton h-20 rounded-2xl" /></div>
    </div>
  );
}

export function ArticlesSkeleton() {
  return (
    <div className="page-container space-y-4" aria-label="جارٍ تحميل المقالات" aria-busy="true">
      <div className="skeleton h-28 rounded-4xl" />
      {[1, 2, 3, 4].map((item) => <div key={item} className="skeleton h-44 rounded-3xl" />)}
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="page-container space-y-4" aria-label="جارٍ تحميل المقال" aria-busy="true">
      <div className="skeleton h-10 w-24 rounded-xl" />
      <div className="skeleton h-32 rounded-3xl" />
      {[1, 2, 3, 4, 5].map((item) => <div key={item} className="skeleton h-24 rounded-2xl" />)}
    </div>
  );
}
