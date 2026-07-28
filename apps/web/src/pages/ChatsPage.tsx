import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchRooms,
  fetchMessages,
  addMessage,
  clearUnread,
  createChatRoom,
} from "../store/chatSlice";
import { chatApi, type ChatUser } from "../api/chat";
import { useSocket } from "../hooks/useSocket";

type ChatTab = "PRIVATE" | "GROUP";
type CreateMode = "PRIVATE" | "GROUP" | null;

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Студент",
  TEACHER: "Викладач",
  ADMIN: "Адмін",
};

export const ChatsPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { rooms, messages, roomsLoading, messagesLoading, creatingRoom, error } =
    useAppSelector((s) => s.chat);
  const currentUser = useAppSelector((s) => s.auth.user);
  const canManageChats =
    currentUser?.role === "TEACHER" || currentUser?.role === "ADMIN";

  const [tab, setTab] = useState<ChatTab>("PRIVATE");
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [createMode, setCreateMode] = useState<CreateMode>(null);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (tab === "PRIVATE") return r.type === "PRIVATE";
      return r.type === "GROUP" || r.type === "PUBLIC";
    });
  }, [rooms, tab]);

  const resolvedRoomId = useMemo(() => {
    if (activeRoomId && filteredRooms.some((r) => r.id === activeRoomId)) {
      return activeRoomId;
    }
    return filteredRooms[0]?.id ?? null;
  }, [activeRoomId, filteredRooms]);

  const activeRoom = rooms.find((r) => r.id === resolvedRoomId) ?? null;

  const { isConnected, sendMessage, onMessage } = useSocket(resolvedRoomId ?? "");

  const currentMessages = (
    resolvedRoomId ? (messages[resolvedRoomId] ?? []) : []
  ).map((msg) => ({
    ...msg,
    mine: msg.userId === currentUser?.id,
  }));

  useEffect(() => {
    void dispatch(fetchRooms());
  }, [dispatch]);

  useEffect(() => {
    if (!resolvedRoomId) return;
    if (!messages[resolvedRoomId]) {
      void dispatch(fetchMessages(resolvedRoomId));
    }
    dispatch(clearUnread(resolvedRoomId));
  }, [resolvedRoomId, dispatch, messages]);

  useEffect(() => {
    const end = messagesEndRef.current;
    if (!end) return;
    const scroller = end.parentElement;
    if (scroller) {
      scroller.scrollTop = scroller.scrollHeight;
    }
  }, [currentMessages, resolvedRoomId]);

  useEffect(() => {
    onMessage((data) => {
      if (!resolvedRoomId) return;
      dispatch(
        addMessage({
          roomId: resolvedRoomId,
          message: {
            id: data.id ?? String(Date.now()),
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

  const openCreate = async (mode: CreateMode) => {
    if (!mode || !canManageChats) return;
    setCreateMode(mode);
    setSelectedUserIds([]);
    setGroupName("");
    setUserQuery("");
    setCreateError(null);
    setUsersError(null);
    setUsersLoading(true);
    try {
      const users = await chatApi.getUsers();
      setChatUsers(users);
    } catch (e) {
      setUsersError(e instanceof Error ? e.message : "Не вдалося завантажити користувачів");
      setChatUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return chatUsers;
    return chatUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }, [chatUsers, userQuery]);

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) => {
      if (createMode === "PRIVATE") {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= 2) return [prev[1], id];
        return [...prev, id];
      }
      return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
    });
  };

  const submitCreate = async () => {
    if (!createMode) return;
    setCreateError(null);

    if (createMode === "PRIVATE") {
      if (selectedUserIds.length !== 2) {
        setCreateError("Оберіть рівно двох учасників");
        return;
      }
      const result = await dispatch(
        createChatRoom({ type: "PRIVATE", memberIds: selectedUserIds }),
      );
      if (createChatRoom.fulfilled.match(result)) {
        setCreateMode(null);
        setTab("PRIVATE");
        setActiveRoomId(result.payload.id);
        setShowSidebar(false);
      } else {
        setCreateError((result.payload as string) || "Не вдалося створити чат");
      }
      return;
    }

    if (!groupName.trim()) {
      setCreateError("Вкажіть назву групи");
      return;
    }
    if (selectedUserIds.length < 1) {
      setCreateError("Оберіть хоча б одного учасника");
      return;
    }
    const result = await dispatch(
      createChatRoom({
        type: "GROUP",
        name: groupName.trim(),
        memberIds: selectedUserIds,
      }),
    );
    if (createChatRoom.fulfilled.match(result)) {
      setCreateMode(null);
      setTab("GROUP");
      setActiveRoomId(result.payload.id);
      setShowSidebar(false);
    } else {
      setCreateError((result.payload as string) || "Не вдалося створити групу");
    }
  };

  const handleSend = () => {
    if (!input.trim() || !resolvedRoomId) return;
    if (!isConnected) return;
    sendMessage(input.trim());
    setInput("");
  };

  if (roomsLoading && rooms.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" />
        </svg>
      </div>
    );
  }

  return (
    <div className="box-border flex h-full min-h-0 w-full flex-1 flex-col p-3 md:p-4">
      <section className="relative flex min-h-0 flex-1 overflow-hidden rounded-3xl border border-slate-200/50 bg-white/90 shadow-2xl backdrop-blur-3xl dark:border-white/5 dark:bg-[#0A1118]/80">
        <div className="pointer-events-none absolute top-[-20%] left-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-300/30 blur-[130px] mix-blend-multiply dark:bg-emerald-500/20 dark:mix-blend-screen" />
        <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-[50%] w-[50%] rounded-full bg-teal-300/30 blur-[150px] mix-blend-multiply dark:bg-teal-500/20 dark:mix-blend-screen" />

        <aside
          className={`relative z-10 flex h-full min-h-0 w-full flex-shrink-0 flex-col border-r border-slate-200/50 bg-white/40 dark:border-white/5 dark:bg-white/5 md:w-[300px] lg:w-[350px]
          ${showSidebar ? "flex" : "hidden"} md:flex`}
        >
          <div className="flex-shrink-0 border-b border-slate-200/50 px-5 pb-4 pt-5 dark:border-white/5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <motion.h1
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="truncate text-xl font-black text-slate-900 dark:text-white"
                >
                  {t("chats.title", "Повідомлення")}
                </motion.h1>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  {filteredRooms.length} у вкладці
                </p>
              </div>
              <div
                className={`flex flex-shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 ${
                  isConnected
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    : "border-slate-500/30 bg-slate-500/10 text-slate-400"
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" : "bg-slate-400"}`} />
                <span className="text-[10px] font-black uppercase tracking-wider">{isConnected ? "Live" : "Off"}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setTab("PRIVATE")}
                className={`rounded-lg py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors ${
                  tab === "PRIVATE"
                    ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-800"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Приватні
              </button>
              <button
                type="button"
                onClick={() => setTab("GROUP")}
                className={`rounded-lg py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors ${
                  tab === "GROUP"
                    ? "bg-white text-violet-600 shadow-sm dark:bg-slate-800"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Групи
              </button>
            </div>

            {canManageChats && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void openCreate("PRIVATE")}
                  className="flex-1 rounded-xl border border-emerald-300/60 bg-emerald-50 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                >
                  + Приватний
                </button>
                <button
                  type="button"
                  onClick={() => void openCreate("GROUP")}
                  className="flex-1 rounded-xl border border-violet-300/60 bg-violet-50 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-violet-800 hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-200"
                >
                  + Група
                </button>
              </div>
            )}
            {error && (
              <p className="mt-2 text-xs font-semibold text-rose-500">{error}</p>
            )}
          </div>

          <div className="custom-scrollbar min-h-0 w-full flex-1 overflow-y-auto">
          {filteredRooms.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-500">
              {tab === "PRIVATE" ? "Немає приватних чатів" : "Немає групових чатів"}
              {canManageChats && (
                <p className="mt-2 text-xs text-slate-400">Створіть новий кнопкою вище</p>
              )}
            </div>
          ) : (
            filteredRooms.map((room) => (
              <button
                key={room.id}
                type="button"
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
                    {room.lastMessage || room.subtitle || "Немає повідомлень"}
                  </p>
                </div>
                {room.unread > 0 && (
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                    <span className="text-[10px] font-black text-white">{room.unread}</span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 min-h-0 h-full relative z-10 bg-white/20 dark:bg-black/20 ${!showSidebar ? "flex" : "hidden"} md:flex`}>
        {activeRoom ? (
          <>
            <header className="flex items-center gap-4 px-6 py-4 border-b border-slate-200/50 dark:border-white/5 bg-transparent flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowSidebar(true)}
                className="md:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-slate-400"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeRoom.bg} flex items-center justify-center text-xl shadow-lg flex-shrink-0`}>
                {activeRoom.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {activeRoom.name}
                </h2>
                <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-widest mt-0.5">
                  {activeRoom.subtitle ?? (activeRoom.type === "PRIVATE" ? "Приватний чат" : "Група")}
                </p>
              </div>
            </header>

            <main className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar relative">
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
                        <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                        <div className={`flex items-center gap-1.5 mt-2 justify-end ${msg.mine ? "text-emerald-100" : "text-slate-400"}`}>
                          <span className="text-[10px] font-bold tracking-wider">{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} className="h-4 flex-shrink-0" />
            </main>

            <footer className="p-4 border-t border-slate-200/50 dark:border-white/5 bg-transparent flex-shrink-0">
              {!isConnected && (
                <p className="mb-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Немає Live-зʼєднання — повідомлення зараз не надіслати.
                </p>
              )}
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
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || !isConnected}
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

      <AnimatePresence>
        {createMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => !creatingRoom && setCreateMode(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {createMode === "PRIVATE" ? "Новий приватний чат" : "Нова група"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {createMode === "PRIVATE"
                      ? "Оберіть двох людей, які матимуть цей чат"
                      : "Назва групи та учасники"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateMode(null)}
                  disabled={creatingRoom}
                  className="w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  ×
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {createMode === "GROUP" && (
                  <label className="block">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Назва групи</span>
                    <input
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Наприклад: A2 Speaking"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    {createMode === "PRIVATE"
                      ? `Учасники (${selectedUserIds.length}/2)`
                      : "Користувачі"}
                  </span>
                  <input
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Пошук за іменем, email або роллю…"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </label>

                {createMode === "PRIVATE" && selectedUserIds.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedUserIds.map((id) => {
                      const u = chatUsers.find((x) => x.id === id);
                      if (!u) return null;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleUser(id)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-200"
                        >
                          {u.name}
                          <span aria-hidden>×</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-64 overflow-y-auto">
                  {usersLoading ? (
                    <div className="py-8 text-center text-sm text-slate-400">Завантаження…</div>
                  ) : usersError ? (
                    <div className="py-6 px-4 text-center text-sm text-rose-500">{usersError}</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-400">Нікого не знайдено</div>
                  ) : (
                    filteredUsers.map((u) => {
                      const selected = selectedUserIds.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => toggleUser(u.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors ${
                            selected
                              ? "bg-emerald-50 dark:bg-emerald-950/40"
                              : "hover:bg-slate-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md border flex items-center justify-center text-[11px] font-black ${
                              selected
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-slate-300 dark:border-slate-600 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-bold text-slate-900 dark:text-white truncate">
                              {u.name}
                              {u.id === currentUser?.id ? " (ви)" : ""}
                            </span>
                            <span className="block text-xs text-slate-500 truncate">{u.email}</span>
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {ROLE_LABEL[u.role] ?? u.role}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {createError && (
                  <p className="text-sm font-semibold text-rose-500">{createError}</p>
                )}
              </div>

              <div className="px-5 py-4 border-t border-slate-200/70 dark:border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateMode(null)}
                  disabled={creatingRoom}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  Скасувати
                </button>
                <button
                  type="button"
                  onClick={() => void submitCreate()}
                  disabled={
                    creatingRoom ||
                    usersLoading ||
                    (createMode === "PRIVATE" && selectedUserIds.length !== 2)
                  }
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2.5 text-sm font-black text-white"
                >
                  {creatingRoom ? "Створення…" : "Створити"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
    </div>
  );
};
