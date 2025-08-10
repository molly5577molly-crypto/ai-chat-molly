import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';           // GitHub风格Markdown支持（表格、删除线等）
import remarkMath from 'remark-math';         // 数学公式解析
import rehypeKatex from 'rehype-katex';       // 数学公式渲染
import rehypeHighlight from 'rehype-highlight'; // 代码语法高亮
import 'katex/dist/katex.min.css';            // 数学公式样式
import 'highlight.js/styles/github.css';      // 代码高亮样式

/**
 * Markdown消息渲染组件
 * 支持完整的Markdown语法、数学公式、代码高亮等功能
 * 专为AI聊天消息的富文本显示而设计
 */
interface MarkdownMessageProps {
  content: string;     // Markdown格式的内容
  className?: string;  // 额外的CSS类名
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ 
  content, 
  className = '' 
}) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          // 自定义代码块样式
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="relative">
                <div className="absolute top-2 right-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {match[1]}
                </div>
                <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto border">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code 
                className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono" 
                {...props}
              >
                {children}
              </code>
            );
          },
          // 自定义表格样式
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-gray-300 px-4 py-2">
                {children}
              </td>
            );
          },
          // 自定义链接样式
          a({ href, children }) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {children}
              </a>
            );
          },
          // 自定义列表样式
          ul({ children }) {
            return <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>;
          },
          // 自定义标题样式
          h1({ children }) {
            return <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900">{children}</h3>;
          },
          h4({ children }) {
            return <h4 className="text-base font-semibold mt-3 mb-2 text-gray-900">{children}</h4>;
          },
          // 自定义引用样式
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600">
                {children}
              </blockquote>
            );
          },
          // 自定义段落样式
          p({ children }) {
            return <p className="mb-3 leading-relaxed">{children}</p>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
