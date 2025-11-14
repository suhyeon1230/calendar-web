from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 데이터 모델
class User(BaseModel):
    id: int
    nickname: str
    password: str
    note: str = ""
    approved: bool = False
    isAdmin: bool = False


class Event(BaseModel):
    id: int
    title: str
    date: str
    createdBy: str


class LoginRequest(BaseModel):
    nickname: str
    password: str


# 메모리 데이터베이스
users: List[User] = [
    User(id=1, nickname="suhyeon", password="ajs345", note="관리자 계정", approved=True, isAdmin=True)
]
events: List[Event] = []
visitor_count = 0


# 방문자 카운트 조회
@app.get("/visitor-count")
def get_visitor_count():
    return {"count": visitor_count}


# 방문자 카운트 증가
@app.post("/visitor-count")
def increment_visitor_count():
    global visitor_count
    visitor_count += 1
    return {"count": visitor_count}


# 회원가입 신청
@app.post("/register")
def register(user: User):
    # 중복 닉네임 체크
    if any(u.nickname == user.nickname for u in users):
        raise HTTPException(status_code=400, detail="이미 존재하는 닉네임입니다")

    # 새 ID 생성
    user.id = max([u.id for u in users], default=0) + 1
    user.approved = False
    user.isAdmin = False
    users.append(user)

    return {"message": "회원가입 신청이 완료되었습니다"}


# 로그인
@app.post("/login")
def login(req: LoginRequest):
    # 사용자 찾기
    user = next((u for u in users if u.nickname == req.nickname and u.password == req.password), None)

    if not user:
        raise HTTPException(status_code=401, detail="닉네임 또는 비밀번호가 잘못되었습니다")

    if not user.approved and not user.isAdmin:
        raise HTTPException(status_code=403, detail="승인 대기 중입니다")

    return {
        "id": user.id,
        "nickname": user.nickname,
        "isAdmin": user.isAdmin,
        "approved": user.approved,
        "note": user.note
    }


# 회원 목록 조회
@app.get("/users")
def get_users():
    return users


# 회원 승인/거절
@app.put("/users/{user_id}/approve")
def approve_user(user_id: int, approved: bool):
    user = next((u for u in users if u.id == user_id), None)

    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")

    user.approved = approved
    return {"message": "처리되었습니다", "user": user}


# 일정 전체 조회
@app.get("/events")
def read_events():
    return events


# 일정 추가
@app.post("/events")
def create_event(event: Event):
    event.id = max([e.id for e in events], default=0) + 1
    events.append(event)
    return event


# 일정 수정
@app.put("/events/{event_id}")
def update_event(event_id: int, updated: Event):
    for i, e in enumerate(events):
        if e.id == event_id:
            events[i] = updated
            return updated

    raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다")


# 일정 삭제
@app.delete("/events/{event_id}")
def delete_event(event_id: int):
    global events
    events = [e for e in events if e.id != event_id]
    return {"ok": True}


# 최근 추가된 일정 조회
@app.get("/events/recent")
def get_recent_events(limit: int = 10):
    return sorted(events, key=lambda x: x.id, reverse=True)[:limit]


# main.py에 추가
import sqlite3
from datetime import datetime


# DB 초기화
def init_db():
    conn = sqlite3.connect('calendar.db')
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY, nickname TEXT UNIQUE, 
                  password TEXT, note TEXT, approved BOOLEAN, isAdmin BOOLEAN)''')

    c.execute('''CREATE TABLE IF NOT EXISTS events
                 (id INTEGER PRIMARY KEY, title TEXT, date TEXT, createdBy TEXT)''')

    c.execute('''CREATE TABLE IF NOT EXISTS visitor_count
                 (count INTEGER)''')

    conn.commit()
    conn.close()


# 서버 시작 시 실행
init_db()