// 🔧 API 기본 URL 설정 (Render / Vercel / Local 자동 대응)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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

// 👉 방문자 카운트 조회
export async function getVisitorCount() {
  const response = await fetch(`${API_BASE_URL}/visitor-count`);
  if (!response.ok) throw new Error("방문자 수를 가져오지 못했습니다");
  return response.json();
}

// 👉 방문자 카운트 증가
export async function incrementVisitorCount() {
  const response = await fetch(`${API_BASE_URL}/visitor-count`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("방문자 수 증가 실패");
  return response.json();
}

// 👉 회원가입
export async function register(nickname: string, password: string, note: string) {
  const response = await fetch(`${API_BASE_URL}/register`, {
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

// 👉 로그인
export async function login(nickname: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/login`, {
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

// 👉 회원 목록 조회
export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) throw new Error("회원 목록을 가져오지 못했습니다");
  return response.json();
}

// 👉 회원 승인/거절
export async function approveUser(userId: number, approved: boolean) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/approve?approved=${approved}`, {
    method: "PUT",
  });
  if (!response.ok) throw new Error("승인 처리 실패");
  return response.json();
}

// 👉 일정 목록 조회
export async function getEvents(limit?: number) {
  const url = limit
    ? `${API_BASE_URL}/events/recent?limit=${limit}`
    : `${API_BASE_URL}/events`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("일정을 가져오지 못했습니다");
  return response.json();
}

// 👉 일정 추가
export async function addEvent(event: Omit<Event, "id">) {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...event, id: 0 }),
  });
  if (!response.ok) throw new Error("일정 추가 실패");
  return response.json();
}

// 👉 일정 수정
export async function editEvent(event: Event) {
  const response = await fetch(`${API_BASE_URL}/events/${event.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  if (!response.ok) throw new Error("일정 수정 실패");
  return response.json();
}

// 👉 일정 삭제
export async function deleteEvent(eventId: number) {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("일정 삭제 실패");
  return response.json();
}


export async function getUserEvents(userId: number) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/events`);
  if (!res.ok) throw new Error("회원 일정 조회 실패");
  return res.json();
}

export async function getUserEventCount(userId: number) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/events/count`);
  if (!res.ok) throw new Error("회원 일정 수 조회 실패");
  return res.json();
}

export async function deleteUser(userId: number) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("회원 삭제 실패");
  return res.json();
}
