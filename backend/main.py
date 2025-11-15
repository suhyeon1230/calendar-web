import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import sqlite3

app = FastAPI()


# 현재 파일 기준 frontend/dist 경로
frontend_dist = os.path.join(os.path.dirname(__file__), r"C:\dev\dan_calender_project\frontend\frontend\dist")

# 정적 파일 마운트
app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")


app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",    # local dev
        "https://calendar-web-ashen.vercel.app",  # ← Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------
# 데이터 모델
# -----------------------
class User(BaseModel):
    id: int
    nickname: str
    password: str
    note: str = ""
    approved: bool = False
    isAdmin: bool = False


# 회원가입용
class UserCreate(BaseModel):
    nickname: str
    password: str
    note: str = ""


class Event(BaseModel):
    id: int
    title: str
    date: str
    createdBy: str


# 일정 생성용
class EventCreate(BaseModel):
    title: str
    date: str
    createdBy: str


class LoginRequest(BaseModel):
    nickname: str
    password: str


# -----------------------
# DB 초기화
# -----------------------
def init_db():
    conn = sqlite3.connect("calendar.db")
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, nickname TEXT UNIQUE,
                  password TEXT, note TEXT, approved BOOLEAN, isAdmin BOOLEAN)''')

    c.execute('''CREATE TABLE IF NOT EXISTS events
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, date TEXT, createdBy TEXT)''')

    c.execute('''CREATE TABLE IF NOT EXISTS visitor_count
                 (count INTEGER)''')

    # 방문자 테이블 초기값
    c.execute("INSERT OR IGNORE INTO visitor_count(count) VALUES(0)")

    # 관리자 계정 초기값
    c.execute(
        "INSERT OR IGNORE INTO users(id, nickname, password, note, approved, isAdmin) VALUES(1, 'suhyeon', 'ajs345', '관리자 계정', 1, 1)"
    )

    conn.commit()
    conn.close()


init_db()


# -----------------------
# 헬퍼 함수
# -----------------------
def query_users():
    conn = sqlite3.connect("calendar.db")
    c = conn.cursor()
    c.execute("SELECT id, nickname, password, note, approved, isAdmin FROM users")
    rows = c.fetchall()
    conn.close()
    return [
        User(id=r[0], nickname=r[1], password=r[2], note=r[3], approved=bool(r[4]), isAdmin=bool(r[5]))
        for r in rows
    ]


def query_events():
    conn = sqlite3.connect("calendar.db")
    c = conn.cursor()
    c.execute("SELECT id, title, date, createdBy FROM events")
    rows = c.fetchall()
    conn.close()
    return [
        Event(id=r[0], title=r[1], date=r[2], createdBy=r[3])
        for r in rows
    ]


def get_visitor_count_db():
    conn = sqlite3.connect("calendar.db")
    c = conn.cursor()
    c.execute("SELECT count FROM visitor_count LIMIT 1")
    count = c.fetchone()[0]
    conn.close()
    return count


def set_visitor_count_db(count: int):
    conn = sqlite3.connect("calendar.db")
    c = conn.cursor()
    c.execute("UPDATE visitor_count SET count = ?", (count,))
    conn.commit()
    conn.close()


# -----------------------
# API
# -----------------------

# 방문자 카운트 -------------------
@app.get("/visitor-count")
def get_visitor_count():
    return {"count": get_visitor_count_db()}


@app.post("/visitor-count")
def increment_visitor_count():
    count = get_visitor_count_db() + 1
    set_visitor_count_db(count)
    return {"count": count}


# 회원가입 ------------------------
@app.post("/register")
def register(user: UserCreate):
    conn = sqlite3.connect("calendar.db")
    c = conn.cursor()

    # 중복 닉네임 체크
    c.execute("SELECT * FROM users WHERE nickname=?", (user.nickname,))
    if c.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="이미 존재하는 닉네임입니다")

    # id는 자동 증가, approved=False 기본
    c.execute(
        "INSERT INTO users(nickname, password, note, approved, isAdmin) VALUES (?, ?, ?, ?, ?)",
        (user.nickname, user.password, user.note, False, False)
    )

    conn.commit()
    conn.close()
    return {"message": "회원가입 신청이 완료되었습니다"}


# 로그인 -------------------------
@app.post("/login")
def login(req: LoginRequest):
    conn = sqlite3.connect("calendar.db")
    c = conn.cursor()
    c.execute(
        "SELECT id, nickname, password, note, approved, isAdmin FROM users WHERE nickname=? AND password=?",
        (req.nickname, req.password)
    )
    row = c.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="닉네임 또는 비밀번호가 잘못되었습니다")

    user = User(
        id=row[0], nickname=row[1], password=row[2],
        note=row[3], approved=bool(row[4]), isAdmin=bool(row[5])
    )

    if not user.approved and not user.isAdmin:
        raise HTTPException(status_code=403, detail="승인 대기 중입니다")

    return {
        "id": user.id,
        "nickname": user.nickname,
        "isAdmin": user.isAdmin,
        "approved": user.approved,
        "note": user.note
    }


# 회원 목록 ------------------------
@app.get("/users")
def get_users():
    return query_users()


# 회원 승인 ------------------------
@app.put("/users/{user_id}/approve")
def approve_user(user_id: int, approved: bool = Query(...)):
    conn = sqlite3.connect("calendar.db")
    c = conn.cursor()
    c.execute("UPDATE users SET approved=? WHERE id=?", (approved, user_id))

    if c.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")

    conn.commit()
    conn.close()
    return {"message": "처리되었습니다"}


# 이벤트 ---------------------------
@app.get("/events")
def read_events():
    return query_events()


@app.post("/events")
def create_event(event: EventCreate):
    conn = sqlite3.connect("calendar.db")
    c = conn.cursor()
    c.execute(
        "INSERT INTO events(title, date, createdBy) VALUES (?, ?, ?)",
        (event.title, event.date, event.createdBy)
    )
    event_id = c.lastrowid
    conn.commit()
    conn.close()

    return Event(id=event_id, **event.dict())


@app.put("/events/{event_id}")
def update_event(event_id: int, updated: EventCreate):
    conn = sqlite3.connect("calendar.db")
    c = conn.cursor()
    c.execute(
        "UPDATE events SET title=?, date=?, createdBy=? WHERE id=?",
        (updated.title, updated.date, updated.createdBy, event_id)
    )

    if c.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다")

    conn.commit()
    conn.close()
    return Event(id=event_id, **updated.dict())


@app.delete("/events/{event_id}")
def delete_event(event_id: int):
    conn = sqlite3.connect("calendar.db")
    c = conn.cursor()
    c.execute("DELETE FROM events WHERE id=?", (event_id,))
    conn.commit()
    conn.close()
    return {"ok": True}


@app.get("/events/recent")
def get_recent_events(limit: int = 10):
    events = query_events()
    return sorted(events, key=lambda x: x.id, reverse=True)[:limit]

@app.get("/users/{user_id}/events")
def get_user_events(user_id: int):
    events = load_events()  # events.json
    user_events = [e for e in events if e["createdBy"] == user_id]
    return user_events

@app.get("/users/{user_id}/events/count")
def get_user_event_count(user_id: int):
    events = load_events()
    count = sum(1 for e in events if e["createdBy"] == user_id)
    return {"count": count}

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    users = load_users()
    users = [u for u in users if u["id"] != user_id]
    save_users(users)

    # 사용자가 만든 일정도 삭제 (권장)
    events = load_events()
    events = [e for e in events if e["createdBy"] != user_id]
    save_events(events)

    return {"message": "회원 삭제 완료"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)


# 서버 시작 시 실행
init_db()