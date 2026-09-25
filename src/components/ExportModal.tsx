import React from 'react';
import { StudySet } from '../types/study';
import { X, FileText, Download, Printer, Copy, Check } from 'lucide-react';

interface ExportModalProps {
  studySet: StudySet;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ studySet, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const generateMarkdown = () => {
    let md = `# ${studySet.title}\nSubject: ${studySet.subject}\n\n`;
    if (studySet.summary) {
      md += `## TL;DR\n${studySet.summary.headline}\n\n`;
      md += `## Overview\n${studySet.summary.overview}\n\n`;
      md += `## Key Takeaways\n`;
      studySet.summary.keyTakeaways.forEach((t) => (md += `- ${t}\n`));
      md += `\n## Key Concepts\n`;
      studySet.summary.keyConcepts.forEach((c) => (md += `### ${c.title} (${c.importance} priority)\n${c.explanation}\n\n`));
      md += `## Glossary\n`;
      studySet.summary.glossary.forEach((g) => (md += `- **${g.term}**: ${g.definition}\n`));
    }
    if (studySet.flashcards?.length) {
      md += `\n## Flashcards\n`;
      studySet.flashcards.forEach((fc, i) => (md += `${i + 1}. **Q:** ${fc.front}\n   **A:** ${fc.back}\n\n`));
    }
    return md;
  };

  const handleDownloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white font-display">
              Export Study Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Export "{studySet.title}" into your preferred study format:
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            
            <button
              onClick={() => handleDownloadFile(generateMarkdown(), `${studySet.title.toLowerCase().replace(/\s+/g, '_')}_study_guide.md`, 'text/markdown')}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left transition-colors flex items-center justify-between text-xs font-semibold text-white"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Markdown (.md) File</span>
              </div>
              <Download className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={handlePrintPDF}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left transition-colors flex items-center justify-between text-xs font-semibold text-white"
            >
              <div className="flex items-center gap-3">
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print or Save to PDF</span>
              </div>
              <Download className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => handleDownloadFile(JSON.stringify(studySet, null, 2), `${studySet.title.toLowerCase().replace(/\s+/g, '_')}.json`, 'application/json')}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left transition-colors flex items-center justify-between text-xs font-semibold text-white"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>JSON Data Backup</span>
              </div>
              <Download className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={handleCopy}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left transition-colors flex items-center justify-between text-xs font-semibold text-white"
            >
              <div className="flex items-center gap-3">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Markdown'}</span>
              </div>
            </button>

          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
