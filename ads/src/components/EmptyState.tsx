import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="surface-card grid min-h-64 place-items-center rounded-4xl px-6 py-10 text-center">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand-100 text-brand-700 dark:bg-brand-900/45 dark:text-brand-300">
          <Icon size={28} aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
        <p className="muted-text mx-auto mt-2 max-w-sm text-sm leading-7">{description}</p>
        {actionLabel && onAction && (
          <button type="button" className="secondary-button mt-5" onClick={onAction}>{actionLabel}</button>
        )}
      </div>
    </div>
  );
}
