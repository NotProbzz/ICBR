import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareHeart, 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  RefreshCw, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';
import { ChatExpertMessage } from '../types';

interface VeterinaryAssistantProps {
  initialBreedContext?: string | null;
}

const PRESET_QUESTIONS = [
  'How to distinguish pure Gir from Gir-cross cattle using horn and ear markers?',
  'What is the ideal feeding ration to maximize milk yield in Murrah buffaloes?',
  'Why do Indian zebu cattle (Bos indicus) produce exclusively A2 beta-casein milk?',
  'What is the standard vaccination schedule for FMD, HS, and BQ in India?',
  'Explain the "Panch Kalyani" markings and "Wall Eyes" of Nili-Ravi buffalo.',
  'How does Bhadawari buffalo achieve up to 13% butterfat in harsh ravine climates?'
];

export const VeterinaryAssistant: React.FC<VeterinaryAssistantProps> = ({ initialBreedContext }) => {
  const [messages, setMessages] = useState<ChatExpertMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Namaste! I am Dr. PashuMitra, your AI Veterinary Bovine Specialist grounded in ICAR-NBAGR, NDRI, and IVRI standards.\n\n${
        initialBreedContext
          ? `I see you are currently examining the **${initialBreedContext}** breed. You can ask me anything regarding its morphological purity, lactation potential, fodder requirements, or disease resistance.`
          : `I can assist you with:\n- Precise morphological identification of Indian Cattle & Buffaloes\n- Feeding rations & bypass nutrient strategies for indigenous breeds\n- Disease prevention, vaccination calendars & heat stress mitigation\n- A2 milk production and conservation of indigenous germplasm.`
      }`,
      timestamp: Date.now(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage.trim();
    if (!text || isLoading) return;

    const userMsg: ChatExpertMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          breedContext: initialBreedContext ? { breedName: initialBreedContext } : undefined,
          history: messages.slice(-6),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to get consultation response');
      }

      const data = await response.json();

      const assistantMsg: ChatExpertMessage = {
        id: 'ast_' + Date.now(),
        role: 'assistant',
        content: data.reply || 'Apologies, I could not generate a response. Please try rephrasing.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg: ChatExpertMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: `I encountered an issue connecting with the veterinary AI service (${err.message || 'temporary service spike'}). Please send your question again in a moment.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[750px] max-w-5xl mx-auto">
      
      {/* Top Bar */}
      <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Dr. PashuMitra - AI Bovine Veterinary Consultant
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                ICAR Standards
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Indigenous cattle & buffalo genetic purity, nutrition & herd health advisor
            </p>
          </div>
        </div>

        {initialBreedContext && (
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-900/60 text-amber-200 border border-amber-700">
            Context: {initialBreedContext}
          </span>
        )}
      </div>

      {/* Preset Question Chips */}
      <div className="p-3 bg-stone-50 border-b border-stone-100 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Common Inquiries:
          </span>
          {PRESET_QUESTIONS.map((pq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(pq)}
              disabled={isLoading}
              className="text-xs px-2.5 py-1 rounded-full bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 text-stone-700 transition-all shrink-0"
            >
              {pq}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/40">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-900 text-amber-400 border border-stone-800'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-amber-600 text-white rounded-tr-none'
                    : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-2xs whitespace-pre-line'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-2xl mr-auto">
            <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-400 border border-stone-800 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-stone-200 text-stone-500 text-xs rounded-tl-none flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>Dr. PashuMitra is formulating expert veterinary response...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t border-stone-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            id="chat-expert-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about bovine morphology, breed purity, high-yield feeding, or vaccination..."
            disabled={isLoading}
            className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
          <button
            type="submit"
            id="send-chat-btn"
            disabled={isLoading || !inputMessage.trim()}
            className="p-3 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white disabled:opacity-50 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
