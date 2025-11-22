import React from 'react';
import { Author } from '../types';

interface AuthorProfileProps {
  author: Author;
}

export const AuthorProfile: React.FC<AuthorProfileProps> = ({ author }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start p-8 bg-slate-50/80 rounded-2xl border border-slate-100 transition-all hover:shadow-sm hover:border-indigo-100 hover:bg-slate-50">
      <div className="shrink-0 mb-4 sm:mb-0 sm:mr-6">
        <img
          src={author.avatar}
          alt={author.name}
          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md ring-1 ring-slate-100"
        />
      </div>
      <div className="text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-2 justify-center sm:justify-start">
            <h3 className="text-xl font-bold text-slate-900">{author.name}</h3>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wide">{author.role}</span>
        </div>
        <p className="text-slate-600 leading-relaxed">{author.bio}</p>
      </div>
    </div>
  );
};