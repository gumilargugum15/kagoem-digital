import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="max-w-none text-[15px] leading-relaxed text-muted-foreground sm:text-base">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-10 font-display text-2xl font-extrabold text-navy sm:text-3xl">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 font-display text-xl font-bold text-navy sm:text-2xl">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 font-display text-lg font-bold text-navy">{children}</h3>
          ),
          p: ({ children }) => <p className="mt-4">{children}</p>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="mt-4 list-disc space-y-1.5 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="mt-4 list-decimal space-y-1.5 pl-6">{children}</ol>,
          li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mt-4 rounded-2xl border-l-4 border-primary bg-muted/60 px-5 py-3 text-navy">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold text-navy">{children}</strong>,
          table: ({ children }) => (
            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border bg-muted px-3 py-2 font-semibold text-navy">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border-b border-border px-3 py-2">{children}</td>,
          code: ({ className, children, ...props }) => {
            const isBlock = /language-/.test(className ?? "");
            if (!isBlock) {
              return (
                <code
                  className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-navy"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mt-5 overflow-x-auto rounded-2xl bg-[#0d1117] p-5 text-[13px] shadow-elegant">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
