import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSocket } from "../hooks/useSocket";

const chats = [
  { id: 1, name: "Personal Teacher", subtitle: "Твій особистий вчитель", icon: "👩‍🏫", bg: "from-emerald-400 to-teal-500", lastMessage: "Чудова робота з вчорашнім завданням!", time: "09:41", unread: 2, online: true },
  { id: 2, name: "Students Community", subtitle: "Спільнота студентів", icon: "👥", bg: "from-violet-400 to-purple-500", lastMessage: "Хтось може пояснити Present Perfect?", time: "Вчора", unread: 14, online: false },
];

const mockMessages: Record<number, { id: number; text: string; mine: boolean; time: string }[]> = {
  1: [
    { id: 1, text: "Привіт! Як справи з навчанням?", mine: false, time: "09:30" },
    { id: 2, text: "Все добре, вчора пройшов модуль 2!", mine: true, time: "09:32" },
    { id: 3, text: "Чудово! Давай сьогодні попрацюємо над вимовою.", mine: false, time: "09:35" },
    { id: 4, text: "Звісно, о котрій?", mine: true, time: "09:37" },
    { id: 5, text: "Чудова робота з вчорашнім завданням!", mine: false, time: "09:41" },
  ],
  2: [
    { id: 1, text: "Всім привіт! 👋", mine: false, time: "10:00" },
    { id: 2, text: "Привіт! Хтось може пояснити Present Perfect?", mine: false, time: "10:05" },
    { id: 3, text: "Present Perfect використовується коли дія відбулась у минулому, але пов'язана з теперішнім!", mine: true, time: "10:08" },
    { id: 4, text: "Дякую, тепер зрозуміло 🙏", mine: false, time: "10:10" },
  ],
};

export const ChatsPage = () => {
  const { t } = useTranslation();
  const [activeChat, setActiveChat] = useState(chats[0]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const { isConnected, sendMessage, onMessage } = useSocket(activeChat.id);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    onMessage((data) => {
      const newMsg = { id: Date.now(), text: data.text, mine: false, time: data.time ?? "" };
      setMessages((prev) => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id] ?? []), newMsg] }));
    });
  }, [activeChat.id, onMessage]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now(), text: input.trim(), mine: true,
      time: new Date().toLocaleTimeString("uk", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id] ?? []), newMsg] }));
    sendMessage(input.trim());
    setInput("");
  };

  const currentMessages = messages[activeChat.id] ?? [];

  return (
    <section className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-none sm:rounded-2xl
      border-0 sm:border border-slate-100 dark:border-slate-700
      bg-white dark:bg-slate-800 sm:shadow-sm">

      <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`} />

      {/* ── SIDEBAR ── */}
      <aside className={`flex-col flex-shrink-0 w-full md:w-64 lg:w-72
        border-r border-slate-100 dark:border-slate-700
        ${showSidebar ? "flex" : "hidden"} md:flex`}>

        <div className="px-4 pt-4 pb-3 border-b border-slate-50 dark:border-slate-700 flex-shrink-0">
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("chats.title")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-xs text-slate-400 dark:text-slate-500">
            {chats.length} {t("chats.conversations")}
          </motion.p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {chats.map((chat) => (
            <motion.button key={chat.id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }} viewport={{ once: true }}
              onClick={() => { setActiveChat(chat); setShowSidebar(false); }}
              className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3
                transition-colors duration-150 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50
                ${activeChat.id === chat.id ? "bg-emerald-50/70 dark:bg-emerald-900/20 border-r-2 border-emerald-400" : ""}`}>
              <div className="relative flex-shrink-0">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${chat.bg} flex items-center justify-center text-xl`}>
                  {chat.icon}
                </div>
                {chat.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-slate-800" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5 gap-1">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{chat.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">{chat.time}</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-white">{chat.unread}</span>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </aside>

      {/* ── CHAT AREA ── */}
      <div className={`flex-1 flex-col min-w-0 ${!showSidebar ? "flex" : "hidden"} md:flex`}>
        <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3
          border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
          <button onClick={() => setShowSidebar(true)} className="md:hidden w-8 h-8 flex items-center justify-center
            rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="relative flex-shrink-0">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br ${activeChat.bg} flex items-center justify-center text-base sm:text-lg`}>
              {activeChat.icon}
            </div>
            {activeChat.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white dark:border-slate-800" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{activeChat.name}</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate hidden sm:block">{activeChat.subtitle}</p>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-2 sm:gap-3
          bg-gradient-to-b from-slate-50/50 dark:from-slate-900/50 to-white dark:to-slate-800">
          {currentMessages.map((msg, i) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl
                ${msg.mine
                  ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-br-sm"
                  : "bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm"}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${msg.mine ? "text-white/70" : "text-slate-400"}`}>{msg.time}</p>
              </div>
            </motion.div>
          ))}
        </main>

        <footer className="px-2 sm:px-3 py-2 sm:py-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5
            border border-slate-100 dark:border-slate-700
            focus-within:border-emerald-300 dark:focus-within:border-emerald-600
            focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-200">
            <input type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={t("chats.placeholder")}
              className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200
                placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none min-w-0" />
            <button onClick={handleSend} disabled={!input.trim()}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-teal-500
                rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0
                disabled:opacity-40 hover:shadow-md hover:shadow-emerald-200 dark:hover:shadow-emerald-900
                active:scale-95 transition-all duration-150">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
};