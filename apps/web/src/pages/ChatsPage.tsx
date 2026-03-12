import { useEffect, useState } from "react";
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

  // fallback на першу кімнату якщо нічого не вибрано
  const resolvedRoomId = activeRoomId ?? rooms[0]?.id ?? null;
  const activeRoom = rooms.find((r) => r.id === resolvedRoomId) ?? null;

  const { isConnected, sendMessage, onMessage } = useSocket(
    resolvedRoomId ?? "",
  );

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

  const currentMessages = (
    resolvedRoomId ? (messages[resolvedRoomId] ?? []) : []
  ).map((msg) => ({
    ...msg,
    mine: msg.userId === currentUser?.id,
  }));

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
    <section
      className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-none sm:rounded-2xl
      border-0 sm:border border-slate-100 dark:border-slate-700
      bg-white dark:bg-slate-800 sm:shadow-sm"
    >
      {/* ── SIDEBAR ── */}
      <aside
        className={`flex-col flex-shrink-0 w-full md:w-64 lg:w-72
        border-r border-slate-100 dark:border-slate-700
        ${showSidebar ? "flex" : "hidden"} md:flex overflow-x-hidden`}
      >
        <div className="px-4 pt-4 pb-3 border-b border-slate-50 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight"
              >
                {t("chats.title")}
              </motion.h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {rooms.length} {t("chats.conversations")}
              </p>
            </div>
            {/* індикатор з'єднання */}
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold
              ${
                isConnected
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-400"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-400"}`}
              />
              {isConnected ? "Live" : "Off"}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {rooms.map((room) => (
            <motion.button
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              onClick={() => {
                setActiveRoomId(room.id);
                setShowSidebar(false);
              }}
              className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3
                transition-colors duration-150 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50
                ${activeRoom?.id === room.id ? "bg-emerald-50/70 dark:bg-emerald-900/20 border-r-2 border-emerald-400" : ""}`}
            >
              <div className="relative flex-shrink-0">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${room.bg} flex items-center justify-center text-xl`}
                >
                  {room.icon}
                </div>
                {room.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-slate-800" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5 gap-1">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {room.name}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                    {room.time}
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                  {room.lastMessage}
                </p>
              </div>
              {room.unread > 0 && (
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-white">
                    {room.unread}
                  </span>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </aside>

      {/* ── CHAT AREA ── */}
      <div
        className={`flex-1 flex-col min-w-0 ${!showSidebar ? "flex" : "hidden"} md:flex`}
      >
        {activeRoom ? (
          <>
            <header
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3
              border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0"
            >
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden w-8 h-8 flex items-center justify-center
                rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="relative flex-shrink-0">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br ${activeRoom.bg} flex items-center justify-center text-base sm:text-lg`}
                >
                  {activeRoom.icon}
                </div>
                {activeRoom.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white dark:border-slate-800" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {activeRoom.name}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
                  {activeRoom.subtitle}
                </p>
              </div>
            </header>

            <main
              className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-2 sm:gap-3
              bg-gradient-to-b from-slate-50/50 dark:from-slate-900/50 to-white dark:to-slate-800"
            >
              {messagesLoading ? (
                <div className="flex items-center justify-center flex-1">
                  <svg
                    className="animate-spin w-6 h-6 text-emerald-500"
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
              ) : (
                currentMessages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl
                      ${
                        msg.mine
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-br-sm"
                          : "bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p
                        className={`text-[10px] mt-1 text-right ${msg.mine ? "text-white/70" : "text-slate-400"}`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </main>

            <footer className="px-2 sm:px-3 py-2 sm:py-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
              <div
                className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5
                border border-slate-100 dark:border-slate-700
                focus-within:border-emerald-300 dark:focus-within:border-emerald-600
                focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-200"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={t("chats.placeholder")}
                  className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200
                    placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none min-w-0"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-teal-500
                    rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0
                    disabled:opacity-40 hover:shadow-md active:scale-95 transition-all duration-150"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
            Оберіть чат зі списку
          </div>
        )}
      </div>
    </section>
  );
};
