import React from 'react';

interface SectionHeadingProps {
  id?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  id,
  badge,
  title,
  subtitle,
  center = true,
  className = ''
}) => {
  return (
    <div id={id} className={`mb-8 sm:mb-12 ${center ? 'text-center' : 'text-left'} ${className}`}>
      {badge && (
        <div className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-3">
          {badge}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-2.5 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed ${center ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
