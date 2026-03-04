import { Sparkles, User } from 'lucide-react'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-brand-600' : 'bg-gray-800'
      }`}>
        {isUser ? <User size={14} className="text-white" /> : <Sparkles size={14} className="text-white" />}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-brand-600 text-white rounded-tr-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
        }`}>
          {message.content}
        </div>
        {message.sources?.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {message.sources.map((s, i) => (
              <span key={i} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
