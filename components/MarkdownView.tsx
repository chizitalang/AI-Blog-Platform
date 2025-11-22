import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  return (
    <div className="prose prose-slate prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-slate-900 mb-6 mt-8" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-semibold text-slate-800 mb-4 mt-8" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6" {...props} />,
          p: ({node, ...props}) => <p className="text-slate-600 leading-relaxed mb-4" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2 text-slate-600" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-slate-600" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic my-4 text-slate-700 bg-slate-50 py-2 pr-2 rounded-r" {...props} />,
          a: ({node, ...props}) => <a className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2" {...props} />,
          
          // Override pre to simply yield children to avoid double nesting with SyntaxHighlighter's container
          pre: ({children}) => <>{children}</>,
          
          code({node, className, children, ...props}: any) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');

            if (isInline) {
              return (
                <code className="bg-slate-100 text-pink-600 rounded px-1.5 py-0.5 text-sm font-mono border border-slate-200" {...props}>
                  {children}
                </code>
              );
            }

            // Code block with language
            if (match) {
               return (
                <div className="relative my-6 rounded-lg overflow-hidden shadow-lg border border-slate-800/50 group">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-white/10">
                     <span className="text-xs text-slate-400 font-mono select-none">{match[1]}</span>
                     <div className="flex space-x-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                       <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 group-hover:bg-red-500"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 group-hover:bg-green-500"></div>
                     </div>
                  </div>
                  <SyntaxHighlighter
                    {...props}
                    children={String(children).replace(/\n$/, '')}
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: '1.5rem',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      backgroundColor: '#1e1e1e', 
                    }}
                  />
                </div>
              );
            }

            // Block without language detected (generic pre/code)
            return (
              <div className="relative my-6 rounded-lg overflow-hidden shadow-lg border border-slate-800/50 bg-[#1e1e1e] p-6 text-slate-200 text-sm font-mono overflow-x-auto">
                 <code {...props}>{children}</code>
              </div>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};