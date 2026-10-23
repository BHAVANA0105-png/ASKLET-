import React, { useState } from 'react';
import { marked } from 'marked';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Configure marked options
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  // Extract code blocks to render with copy button
  const renderCustomMarkdown = () => {
    try {
      const rawHtml = marked.parse(content || '') as string;
      return { __html: rawHtml };
    } catch (e) {
      return { __html: `<p>${content}</p>` };
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className={`prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed ${className}`}>
      <div 
        dangerouslySetInnerHTML={renderCustomMarkdown()}
        className="markdown-body space-y-3 [&_h1]:text-xl [&_h1]:font-extrabold [&_h1]:text-white [&_h1]:mt-4 [&_h1]:mb-2
          [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-3 [&_h2]:mb-2
          [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-2
          [&_p]:leading-relaxed [&_p]:text-white [&_p]:mb-2.5
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:my-2
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:my-2
          [&_li]:text-white
          [&_blockquote]:border-l-2 [&_blockquote]:border-white [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[#A3A3A3] [&_blockquote]:my-3
          [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-[#333333] [&_table]:my-3 [&_table]:text-xs sm:[&_table]:text-sm
          [&_th]:border [&_th]:border-[#333333] [&_th]:bg-[#181818] [&_th]:p-2 [&_th]:font-bold [&_th]:text-left [&_th]:text-white
          [&_td]:border [&_td]:border-[#333333] [&_td]:p-2 [&_td]:text-white
          [&_hr]:my-4 [&_hr]:border-[#333333]
          [&_a]:text-white [&_a]:underline [&_a]:font-medium hover:[&_a]:text-[#eaeaea]
          [&_code]:bg-[#181818] [&_code]:border [&_code]:border-[#333333] [&_code]:text-white [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-xs sm:[&_code]:text-sm [&_code]:font-mono
          [&_pre]:bg-[#181818] [&_pre]:border [&_pre]:border-[#333333] [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-2xl [&_pre]:overflow-x-auto [&_pre]:my-3 [&_pre]:shadow-md
          [&_pre_code]:bg-transparent [&_pre_code]:border-0 [&_pre_code]:text-white [&_pre_code]:p-0"
      />
    </div>
  );
};
