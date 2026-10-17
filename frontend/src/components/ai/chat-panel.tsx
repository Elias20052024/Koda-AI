import React from 'react';

type ChatRole = 'user' | 'assistant' | 'error';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type ChatPanelProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  suggestions: string[];
};

function makeBubbleClass(role: ChatRole) {
  if (role === 'error') {
    return 'mr-auto bg-amber-950/60 text-amber-100 border border-amber-700';
  }

  return role === 'assistant'
    ? 'mr-auto bg-slate-900 text-slate-50 border border-slate-700'
    : 'ml-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white border border-purple-400';
}

export default function ChatPanel({ messages, isLoading, onSendMessage, suggestions }: ChatPanelProps) {
  const [input, setInput] = React.useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput('');
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/80 shadow-2xl shadow-slate-950/30">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-purple-300">AI assistant</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Koda AI Helper</h2>
        </div>
        <div className="rounded-full border border-purple-500/40 bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-200">
          Gemini AI
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              role={message.role === 'error' ? 'alert' : undefined}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${makeBubbleClass(message.role)}`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 bg-slate-950/80 px-5 py-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSendMessage(suggestion)}
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-purple-400 hover:text-white"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={10_000}
            placeholder="Ask about internships, applications, or profile improvements..."
            className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-purple-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
