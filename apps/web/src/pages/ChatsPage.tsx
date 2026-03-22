import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchRooms,
  fetchMessages,
  addMessage,
  clearUnread,
} from "../store/chatSlice";
import { useSocket } from "../hooks/useSocket";

export const ChatsPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { rooms, messages, roomsLoading, messagesLoading } = useAppSelector(
    (s) => s.chat,
  );
  const currentUser = useAppSelector((s) => s.auth.user);

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // fallback на першу кімнату якщо нічого не вибрано
  const resolvedRoomId = activeRoomId ?? rooms[0]?.id ?? null;
  const activeRoom = rooms.find((r) => r.id === resolvedRoomId) ?? null;

  const { isConnected, sendMessage, onMessage } = useSocket(
    resolvedRoomId ?? "",
  );

  const currentMessages = (
    resolvedRoomId ? (messages[resolvedRoomId] ?? []) : []
  ).map((msg) => ({
    ...msg,
    mine: msg.userId === currentUser?.id,
  }));

  // завантажити кімнати
  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  // завантажити повідомлення при зміні кімнати
  useEffect(() => {
    if (!resolvedRoomId) return;
    if (!messages[resolvedRoomId]) {
      dispatch(fetchMessages(resolvedRoomId));
    }
    dispatch(clearUnread(resolvedRoomId));
  }, [resolvedRoomId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, resolvedRoomId]);

  // слухати нові повідомлення через WebSocket
  useEffect(() => {
    onMessage((data) => {
      if (!resolvedRoomId) return;
      dispatch(
        addMessage({
          roomId: resolvedRoomId,
          message: {
            id: String(Date.now()),
            text: data.text,
            mine: data.userId === currentUser?.id,
            time:
              data.time ??
              new Date().toLocaleTimeString("uk", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            userId: data.userId,
            userName: data.userName,
          },
        }),
      );
    });
  }, [resolvedRoomId, currentUser?.id, onMessage, dispatch]);

  const handleSend = () => {
    if (!input.trim() || !resolvedRoomId) return;
    sendMessage(input.trim()); // ← тільки відправляємо, не додаємо локально
    setInput("");
  };

  if (roomsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg
          className="animate-spin w-8 h-8 text-emerald-500"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="28"
            strokeDashoffset="10"
          />
        </svg>
      </div>
    );
  }

  return (
    <section className="w-full h-full max-h-full min-h-0 bg-white/90 dark:bg-[#0A1118]/80 backdrop-blur-3xl rounded-3xl border border-slate-200/50 dark:border-white/5 flex overflow-hidden shadow-2xl relative">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-emerald-300/30 dark:bg-emerald-500/20 blur-[130px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-300/30 dark:bg-teal-500/20 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

      {/* ── SIDEBAR ── */}
      <aside
        className={`flex flex-col flex-shrink-0 transition-opacity duration-300 
        w-full md:w-[300px] lg:w-[350px] relative z-10 border-r border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-white/5
        ${showSidebar ? "block" : "hidden"} md:block`}
      >
        <div className="px-5 py-5 border-b border-slate-200/50 dark:border-white/5 flex-shrink-0 bg-transparent">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-black text-slate-900 dark:text-white"
              >
                {t("chats.title", "Повідомлення")}
              </motion.h1>
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mt-1">
                {rooms.length} {t("chats.conversations", "діалогів")}
              </p>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                isConnected
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  : "bg-slate-500/10 border-slate-500/30 text-slate-400"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" : "bg-slate-400"}`} />
              <span className="text-[10px] font-black uppercase tracking-wider">{isConnected ? "Live" : "Off"}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => {
                setActiveRoomId(room.id);
                setShowSidebar(false);
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 transition-colors text-left border-l-[3px]
                ${activeRoom?.id === room.id 
                  ? "bg-emerald-500/10 border-emerald-500" 
                  : "border-transparent hover:bg-white/10"}`}
            >
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${room.bg} flex items-center justify-center text-xl shadow-lg`}>
                  {room.icon}
                </div>
                {room.online && (
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0A1118]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-bold truncate ${activeRoom?.id === room.id ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"}`}>
                    {room.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 flex-shrink-0 ml-2">
                    {room.time}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 truncate">
                  {room.lastMessage || "Немає повідомлень"}
                </p>
              </div>
              {room.unread > 0 && (
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                  <span className="text-[10px] font-black text-white">{room.unread}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* ── CHAT AREA ── */}
      <div className={`flex-1 flex flex-col min-w-0 relative z-10 bg-white/20 dark:bg-black/20 ${!showSidebar ? "block" : "hidden"} md:flex`}>
        {activeRoom ? (
          <>
            <header className="flex items-center gap-4 px-6 py-4 border-b border-slate-200/50 dark:border-white/5 bg-transparent flex-shrink-0">
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-slate-400"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeRoom.bg} flex items-center justify-center text-xl shadow-lg`}>
                  {activeRoom.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {activeRoom.name}
                </h2>
                <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-widest mt-0.5">
                  {activeRoom.subtitle ?? "Active Chat"}
                </p>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar relative">
              {messagesLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              ) : (
                currentMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.mine ? "justify-end" : "justify-start"} w-full`}
                  >
                    <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${msg.mine ? "items-end" : "items-start"}`}>
                      {!msg.mine && (
                        <span className="text-[11px] font-bold text-slate-400 mb-1.5 px-2">
                          {msg.userName ?? "Користувач"}
                        </span>
                      )}
                      <div
                        className={`px-5 py-3.5 rounded-2xl relative shadow-lg ${
                          msg.mine
                            ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-br-none"
                            : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/5 text-slate-800 dark:text-slate-200 rounded-bl-none"
                        }`}
                      >
                        <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap word-break break-words">
                          {msg.text}
                        </p>
                        <div className={`flex items-center gap-1.5 mt-2 justify-end ${msg.mine ? "text-emerald-100" : "text-slate-400"}`}>
                          <span className="text-[10px] font-bold tracking-wider">{msg.time}</span>
                          {msg.mine && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                               <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} className="h-4 flex-shrink-0" />
            </main>

            <footer className="p-4 border-t border-slate-200/50 dark:border-white/5 bg-transparent flex-shrink-0">
              <div className="flex items-center gap-3 bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-2 border border-slate-200 dark:border-white/10 focus-within:border-emerald-500/50 transition-colors shadow-inner">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={t("chats.placeholder", "Написати повідомлення...")}
                  className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 dark:text-white px-3 outline-none placeholder:text-slate-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex-shrink-0 w-10 h-10 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50
                    rounded-xl flex items-center justify-center text-white transition-colors shadow-lg"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="translate-x-[1px] translate-y-[-1px]">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <div className="w-20 h-20 mb-4 rounded-3xl bg-white/5 flex items-center justify-center shadow-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-slate-600">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest">{t("chats.selectChat", "Оберіть чат зі списку")}</p>
          </div>
        )}
      </div>
    </section>
  );
};
