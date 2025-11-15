import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, X, Home, ArrowLeft } from "lucide-react";
import * as api from "./api";

interface User {
  id: number;
  nickname: string;
  password?: string;
  note: string;
  approved: boolean;
  isAdmin: boolean;
}

interface Event {
  id: number;
  title: string;
  date: string;
  createdBy: string;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<"home" | "register" | "login" | "calendar" | "admin" | "admin-events" | "admin-users">("home");
  const [events, setEvents] = useState<Event[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    api.incrementVisitorCount().then(data => setVisitorCount(data.count)).catch(console.error);
  }, []);

  const loadEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (view === "calendar") {
      loadEvents();
    }
  }, [view]);

  // 홈 화면
  const HomePage = () => (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-12">단답벌레 일정 달력</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <button
            onClick={() => setView("register")}
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-lg transition-all text-lg"
          >
            회원가입 신청
          </button>
          <button
            onClick={() => setView("login")}
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-lg transition-all text-lg"
          >
            로그인
          </button>
          <button
            onClick={() => {
              setCurrentUser({ id: -1, nickname: "비회원", note: "", approved: true, isAdmin: false });
              setView("calendar");
            }}
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-lg transition-all text-lg"
          >
            비회원 로그인
          </button>
          <button
            onClick={() => setView("login")}
            className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-4 px-8 rounded-lg transition-all text-lg"
          >
            관리자 로그인
          </button>
        </div>
      </div>
    </div>
  );

  // 회원가입 화면
  const RegisterPage = () => {
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [note, setNote] = useState("");

    const handleRegister = async () => {
      if (!nickname || !password) {
        alert("닉네임과 비밀번호를 입력해주세요");
        return;
      }
      if (note.length > 100) {
        alert("비고는 100자 이내로 입력해주세요");
        return;
      }
      try {
        await api.register(nickname, password, note);
        alert("회원가입 신청이 완료되었습니다. 관리자 승인을 기다려주세요.");
        setView("home");
      } catch (error: any) {
        alert(error.message);
      }
    };

    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 p-8 rounded-lg shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">회원가입 신청</h2>
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-4 py-3 mb-4 focus:outline-none focus:border-gray-500"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-4 py-3 mb-4 focus:outline-none focus:border-gray-500"
          />
          <textarea
            placeholder="비고 (100자 이내)"
            value={note}
            onChange={e => setNote(e.target.value)}
            maxLength={100}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-4 py-3 mb-6 h-24 resize-none focus:outline-none focus:border-gray-500"
          />
          <div className="flex gap-4">
            <button
              onClick={handleRegister}
              className="flex-1 bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded transition-all"
            >
              신청
            </button>
            <button
              onClick={() => setView("home")}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded transition-all"
            >
              취소
            </button>
          </div>
        </div>
        <button
          onClick={() => setView("home")}
          className="fixed bottom-4 left-4 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg"
        >
          <Home size={24} />
        </button>
      </div>
    );
  };

  // 로그인 화면
  const LoginPage = () => {
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
      if (!nickname || !password) {
        alert("닉네임과 비밀번호를 입력해주세요");
        return;
      }
      try {
        const userData = await api.login(nickname, password);
        setCurrentUser(userData);
        setView(userData.isAdmin ? "admin" : "calendar");
      } catch (error: any) {
        alert(error.message);
      }
    };

    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 p-8 rounded-lg shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">로그인</h2>
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-4 py-3 mb-4 focus:outline-none focus:border-gray-500"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyPress={e => e.key === "Enter" && handleLogin()}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-4 py-3 mb-6 focus:outline-none focus:border-gray-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded transition-all"
          >
            로그인
          </button>
        </div>
        <button
          onClick={() => setView("home")}
          className="fixed bottom-4 left-4 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg"
        >
          <Home size={24} />
        </button>
      </div>
    );
  };

  // 달력 화면
  const CalendarPage = () => {
    const [selectedDate, setSelectedDate] = useState("");
    const [eventTitle, setEventTitle] = useState("");
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [jumpYear, setJumpYear] = useState("");
    const [jumpMonth, setJumpMonth] = useState("");

    const isGuest = currentUser?.id === -1;

    const renderCalendar = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const days = [];
      const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

      weekDays.forEach(day => {
        days.push(
          <div key={`header-${day}`} className="text-center font-bold text-sm md:text-base py-2 border-b border-gray-300 bg-gray-50">
            {day}
          </div>
        );
      });

      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="bg-gray-100 border border-gray-300"></div>);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayEvents = events.filter(e => e.date === dateStr);

        days.push(
          <div key={day} className="bg-white border border-gray-300 p-2 min-h-[120px] hover:bg-gray-50 transition-colors">
            <div className="font-semibold text-sm md:text-base mb-1">{day}</div>
            <div className="space-y-1">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => !isGuest && setSelectedEvent(event)}
                  className={`text-xs md:text-sm bg-gray-800 text-white px-2 py-1 rounded truncate ${!isGuest && "cursor-pointer hover:bg-gray-700"}`}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        );
      }

      return days;
    };

    const handleAddEvent = async () => {
      if (!selectedDate || !eventTitle) {
        alert("날짜와 내용을 입력해주세요");
        return;
      }
      try {
        await api.addEvent({ title: eventTitle, date: selectedDate, createdBy: currentUser?.nickname || "비회원" });
        setEventTitle("");
        setSelectedDate("");
        setShowEventModal(false);
        loadEvents();
      } catch (error: any) {
        alert(error.message);
      }
    };

    const handleEditEvent = async () => {
      if (!selectedEvent || !eventTitle) return;
      try {
        await api.editEvent({ ...selectedEvent, title: eventTitle });
        setSelectedEvent(null);
        setEventTitle("");
        loadEvents();
      } catch (error: any) {
        alert(error.message);
      }
    };

    const handleDeleteEvent = async () => {
  if (!selectedEvent) return;
  if (!window.confirm("정말 삭제하시겠습니까?")) return;
  try {
    await api.deleteEvent(selectedEvent.id);
    setSelectedEvent(null);
    loadEvents();
  } catch (error: any) {
    alert(error.message);
  }
};

    const handleJumpToDate = () => {
      const year = parseInt(jumpYear);
      const month = parseInt(jumpMonth);
      if (!year || !month || month < 1 || month > 12) {
        alert("올바른 년도와 월을 입력해주세요");
        return;
      }
      setCurrentMonth(new Date(year, month - 1, 1));
      setJumpYear("");
      setJumpMonth("");
    };

    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </h1>
            <p className="text-gray-600">{currentUser?.nickname}님 환영합니다</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center items-center mb-6">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center justify-center"
            >
              <ChevronLeft size={20} />
            </button>

            <input
              type="text"
              placeholder="YYYY"
              value={jumpYear}
              onChange={e => setJumpYear(e.target.value)}
              className="w-20 border border-gray-300 rounded px-2 py-2 text-center"
            />
            <span className="text-gray-600">년</span>
            <input
              type="text"
              placeholder="MM"
              value={jumpMonth}
              onChange={e => setJumpMonth(e.target.value)}
              className="w-16 border border-gray-300 rounded px-2 py-2 text-center"
            />
            <span className="text-gray-600">월</span>
            <button
              onClick={handleJumpToDate}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              이동
            </button>

            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center justify-center"
            >
              <ChevronRight size={20} />
            </button>

            {!isGuest && (
              <button
                onClick={() => setShowEventModal(true)}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Plus size={20} />
                일정 추가
              </button>
            )}
          </div>

          <div className="grid grid-cols-7 gap-0 border border-gray-300 rounded-lg overflow-hidden shadow-lg">
            {renderCalendar()}
          </div>

          {showEventModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">일정 추가</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-4 py-2 mb-4"
                />
                <textarea
                  placeholder="내용을 입력하세요"
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded px-4 py-2 mb-4 h-24 resize-none"
                />
                <div className="flex gap-4">
                  <button
                    onClick={handleAddEvent}
                    className="flex-1 bg-black hover:bg-gray-800 text-white py-2 rounded"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => {
                      setShowEventModal(false);
                      setSelectedDate("");
                      setEventTitle("");
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-black py-2 rounded"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">일정 관리</h3>
                <p className="text-gray-600 mb-2">날짜: {selectedEvent.date}</p>
                <input
                  type="text"
                  value={eventTitle || selectedEvent.title}
                  onChange={e => setEventTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded px-4 py-2 mb-4"
                  placeholder="일정 내용"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleEditEvent}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} />
                    수정
                  </button>
                  <button
                    onClick={handleDeleteEvent}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    삭제
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEvent(null);
                      setEventTitle("");
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-black py-2 rounded flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-4 left-4 flex flex-col gap-2">
          <button
            onClick={() => {
              setCurrentUser(null);
              setView("home");
            }}
            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg"
          >
            <Home size={24} />
          </button>
          <button
            onClick={() => setView(currentUser?.isAdmin ? "admin" : "home")}
            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
      </div>
    );
  };

  // 관리자 메인 화면
  const AdminPage = () => {
    const [recentEvents, setRecentEvents] = useState<Event[]>([]);
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);

    useEffect(() => {
      api.getRecentEvents(10).then(setRecentEvents).catch(console.error);
      api.getUsers().then(data => {
        setPendingUsers(data.filter((u: User) => !u.approved && !u.isAdmin));
      }).catch(console.error);
      api.getVisitorCount().then(data => setVisitorCount(data.count)).catch(console.error);
    }, []);

    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">관리자 페이지</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 p-8 rounded-lg text-center">
              <h3 className="text-xl text-gray-400 mb-4">오늘 방문자 수</h3>
              <p className="text-5xl font-bold text-white">{visitorCount}</p>
              <p className="text-gray-500 mt-2">명</p>
            </div>

            <button
              onClick={() => setView("admin-events")}
              className="bg-gray-900 hover:bg-gray-800 p-8 rounded-lg text-center transition-all"
            >
              <h3 className="text-xl text-gray-400 mb-4">새로 입력된 일정</h3>
              <p className="text-5xl font-bold text-white">{recentEvents.length}</p>
              <p className="text-gray-500 mt-2">개</p>
            </button>

            <button
              onClick={() => setView("admin-users")}
              className="bg-gray-900 hover:bg-gray-800 p-8 rounded-lg text-center transition-all"
            >
              <h3 className="text-xl text-gray-400 mb-4">회원가입 신청자</h3>
              <p className="text-5xl font-bold text-white">{pendingUsers.length}</p>
              <p className="text-gray-500 mt-2">명</p>
            </button>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setView("calendar")}
              className="bg-white hover:bg-gray-200 text-black font-semibold py-3 px-8 rounded-lg transition-all"
            >
              달력 보기
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            setCurrentUser(null);
            setView("home");
          }}
          className="fixed bottom-4 left-4 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg"
        >
          <Home size={24} />
        </button>
      </div>
    );
  };

  // 관리자 - 최근 일정 화면
  const AdminEventsPage = () => {
    const [recentEvents, setRecentEvents] = useState<Event[]>([]);

    useEffect(() => {
      api.getRecentEvents(10).then(setRecentEvents).catch(console.error);
    }, []);

    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">최근 추가된 일정</h1>

          <div className="bg-gray-900 rounded-lg p-6">
            {recentEvents.length === 0 ? (
              <p className="text-gray-400 text-center py-8">최근 추가된 일정이 없습니다</p>
            ) : (
              <div className="space-y-4">
                {recentEvents.map(event => (
                  <div key={event.id} className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-white font-semibold">{event.date}</p>
                    <p className="text-gray-300">{event.title}</p>
                    <p className="text-gray-500 text-sm">작성자: {event.createdBy}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setView("admin")}
              className="bg-white hover:bg-gray-200 text-black font-semibold py-3 px-8 rounded-lg transition-all"
            >
              뒤로가기
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            setCurrentUser(null);
            setView("home");
          }}
          className="fixed bottom-4 left-4 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg"
        >
          <Home size={24} />
        </button>
      </div>
    );
  };

  // 관리자 - 회원가입 신청자 화면
  const AdminUsersPage = () => {
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);

    useEffect(() => {
      loadPendingUsers();
    }, []);

    const loadPendingUsers = async () => {
      try {
        const data = await api.getUsers();
        setPendingUsers(data.filter((u: User) => !u.approved && !u.isAdmin));
      } catch (error) {
        console.error(error);
      }
    };

    const handleApprove = async (userId: number, approved: boolean) => {
      try {
        await api.approveUser(userId, approved);
        alert(approved ? "승인되었습니다" : "거절되었습니다");
        loadPendingUsers();
      } catch (error: any) {
        alert(error.message);
      }
    };

    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">회원가입 신청자</h1>

          <div className="bg-gray-900 rounded-lg p-6">
            {pendingUsers.length === 0 ? (
              <p className="text-gray-400 text-center py-8">대기 중인 신청자가 없습니다</p>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map(user => (
                  <div key={user.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-white font-semibold text-lg">{user.nickname}</p>
                        <p className="text-gray-400 text-sm mt-1">비고: {user.note || "없음"}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(user.id, true)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold transition-all"
                        >
                          O
                        </button>
                        <button
                          onClick={() => handleApprove(user.id, false)}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold transition-all"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setView("admin")}
              className="bg-white hover:bg-gray-200 text-black font-semibold py-3 px-8 rounded-lg transition-all"
            >
              뒤로가기
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            setCurrentUser(null);
            setView("home");
          }}
          className="fixed bottom-4 left-4 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg"
        >
          <Home size={24} />
        </button>
      </div>
    );
  };

  // 메인 렌더링
  if (view === "home") return <HomePage />;
  if (view === "register") return <RegisterPage />;
  if (view === "login") return <LoginPage />;
  if (view === "calendar") return <CalendarPage />;
  if (view === "admin") return <AdminPage />;
  if (view === "admin-events") return <AdminEventsPage />;
  if (view === "admin-users") return <AdminUsersPage />;

  return <HomePage />;
};

export default App;