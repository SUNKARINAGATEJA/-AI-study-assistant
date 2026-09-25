import React from 'react';
import { SubjectCategory } from '../types/study';
import { Dna, Cpu, Landmark, TrendingUp, Atom, Languages, FileText } from 'lucide-react';

interface SubjectBadgeProps {
  subject: SubjectCategory;
  showIcon?: boolean;
}

export const SubjectBadge: React.FC<SubjectBadgeProps> = ({ subject, showIcon = true }) => {
  const getSubjectDetails = (sub: SubjectCategory) => {
    switch (sub) {
      case 'Biology':
        return { color: 'text-emerald-400', Icon: Dna };
      case 'Computer Science':
        return { color: 'text-cyan-400', Icon: Cpu };
      case 'History':
        return { color: 'text-amber-400', Icon: Landmark };
      case 'Economics':
        return { color: 'text-indigo-400', Icon: TrendingUp };
      case 'Physics & Math':
        return { color: 'text-purple-400', Icon: Atom };
      case 'Languages':
        return { color: 'text-rose-400', Icon: Languages };
      default:
        return { color: 'text-slate-400', Icon: FileText };
    }
  };

  const { color, Icon } = getSubjectDetails(subject);

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${color}`}>
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{subject}</span>
    </span>
  );
};
