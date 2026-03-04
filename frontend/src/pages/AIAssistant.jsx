import { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '../api/ai'
import TopBar from '../components/TopBar'
import ChatMessage from '../components/ChatMessage'
import { Send, Sparkles, Loader2, Trash2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const SUGGESTED = [
  'What skills should I focus on improving?',
  'Create a 4-week learning roadmap for Python',
  'What are the biggest skill gaps in my department?',
  'Recommend resources for leadership development',
]

export default function AIAssistant() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your TalentOS AI Assistant. I can help you with skill development, learning plans, and career advice. How can I assist you today?`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (msg) => {
    if (!msg.trim() || loading) return
    const userMsg = { role: 'user', content: msg }
    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const r = await sendChatMessage({
        message: msg,
        history,
        employee_id: user?.id,
      })
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: r.data.reply, sources: r.data.sources },
      ])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    send(input)
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="AI Assistant" subtitle="Powered by Cohere Command R+" />
      <div className="flex-1 overflow-hidden flex flex-col p-8 pt-6 max-w-4xl mx-auto w-full gap-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader2 size={16} className="animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-left text-sm p-3 rounded-xl border border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50 transition-all text-gray-600"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Ask about skills, development plans, career advice…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setMessages([{ role: 'assistant', content: 'Chat cleared. How can I help you?' }])}
            className="btn-secondary p-2"
            title="Clear chat"
          >
            <Trash2 size={15} />
          </button>
          <button type="submit" disabled={!input.trim() || loading} className="btn-primary px-5">
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  )
}
