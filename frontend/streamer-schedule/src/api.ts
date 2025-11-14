// api.ts 수정
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export interface User {
  id: number;
  nickname: string;
  password?: string;
  note: string;
  approved: boolean;
  isAdmin: boolean;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  createdBy: string;
}

// 방문자 카운트
export async function getVisitorCount() {
  const response = await fetch(`${API_URL}/visitor-count`);
  if (!response.ok) throw new Error("방문자 수를 가져오지 못했습니다");
  return response.json();
}

export async function incrementVisitorCount() {
  const response = await fetch(`${API_URL}/visitor-count`, { method: "POST" });
  if (!response.ok) throw new Error("방문자 수 증가 실패");
  return response.json();
}

// 회원가입
export async function register(nickname: string, password: string, note: string) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: 0, nickname, password, note }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "회원가입 실패");
  }
  return response.json();
}

// 로그인
export async function login(nickname: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "로그인 실패");
  }
  return response.json();
}

// 회원 목록
export async function getUsers() {
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) throw new Error("회원 목록을 가져오지 못했습니다");
  return response.json();
}

// 회원 승인/거절
export async function approveUser(userId: number, approved: boolean) {
  const response = await fetch(`${API_URL}/users/${userId}/approve?approved=${approved}`, {
    method: "PUT",
  });
  if (!response.ok) throw new Error("승인 처리 실패");
  return response.json();
}

// 일정 조회
export async function getEvents() {
  const response = await fetch(`${API_URL}/events`);
  if (!response.ok) throw new Error("일정을 가져오지 못했습니다");
  return response.json();
}

// 일정 추가
export async function addEvent(event: Omit<Event, "id">) {
  const response = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...event, id: 0 }),
  });
  if (!response.ok) throw new Error("일정 추가 실패");
  return response.json();
}

// 일정 수정
export async function editEvent(event: Event) {
  const response = await fetch(`${API_URL}/events/${event.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  if (!response.ok) throw new Error("일정 수정 실패");
  return response.json();
}

// 일정 삭제
export async function deleteEvent(eventId: number) {
  const response = await fetch(`${API_URL}/events/${eventId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("일정 삭제 실패");
  return response.json();
}

// 최근 일정
export async function getRecentEvents(limit: number = 10) {
  const response = await fetch(`${API_URL}/events/recent?limit=${limit}`);
  if (!response.ok) throw new Error("최근 일정을 가져오지 못했습니다");
  return response.json();
}