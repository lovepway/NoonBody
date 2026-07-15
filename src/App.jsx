import { useState, useRef, useCallback } from "react";

const P = "#2ECC71", PD = "#27AE60", PBG = "#EAFAF1", AC = "#F39C12";
const G50 = "#F9F9F9", G100 = "#F0F0F0", G200 = "#E0E0E0", G400 = "#BDBDBD", G600 = "#757575", G800 = "#333333";
const card = { background: "white", borderRadius: 18, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 12 };
const btnP = { background: P, color: "white", border: "none", borderRadius: 14, padding: "13px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", width: "100%" };
const btnO = { background: "white", color: PD, border: `2px solid ${P}`, borderRadius: 14, padding: "13px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", width: "100%" };
const btnS = { background: G100, color: G800, border: "none", borderRadius: 14, padding: "13px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", width: "100%" };

const SAMPLE_RECORDS = [
  { id: 1, label: "3월 1일", weight: "76.2", emoji: "💪", color: "#A9DFBF" },
  { id: 2, label: "3월 15일", weight: "75.8", emoji: "🔥", color: "#85C1E9" },
  { id: 3, label: "4월 1일", weight: "74.5", emoji: "💪", color: "#F9E79F" },
  { id: 4, label: "4월 20일", weight: "73.9", emoji: "✨", color: "#F1948A" },
  { id: 5, label: "5월 5일", weight: "73.1", emoji: "🏋️", color: "#A9DFBF" },
  { id: 6, label: "5월 20일", weight: "72.4", emoji: "💚", color: "#BB8FCE" },
  { id: 7, label: "6월 1일", weight: "71.8", emoji: "🔥", color: "#85C1E9" },
  { id: 8, label: "6월 10일 (오늘)", weight: "71.2", emoji: "💪", color: "#D5F5E3" },
];

const BODY_PARTS = [
  { key: "shoulder", label: "어깨", cx: 50, cy: 60, r: 14 },
  { key: "chest", label: "가슴", cx: 50, cy: 85, r: 13 },
  { key: "arm", label: "팔", cx: 20, cy: 88, r: 10 },
  { key: "abdomen", label: "복부", cx: 50, cy: 108, r: 11 },
  { key: "waist", label: "허리", cx: 50, cy: 120, r: 10 },
  { key: "thigh", label: "허벅지", cx: 37, cy: 155, r: 12 },
  { key: "calf", label: "종아리", cx: 37, cy: 185, r: 9 },
];

function getChangeColor(type) {
  if (type === "up") return "#27AE60";
  if (type === "down") return "#3498DB";
  return G400;
}
function getChangeIcon(type) {
  if (type === "up") return "📈";
  if (type === "down") return "📉";
  return "➡️";
}

function resizeImage(dataUrl, maxSize = 1024) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxSize || h > maxSize) {
        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else { w = Math.round(w * maxSize / h); h = maxSize; }
      }
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      res(c.toDataURL("image/jpeg", 0.8).split(",")[1]);
    };
    img.src = dataUrl;
  });
}

async function callClaude(userMsg, b64) {
  const parts = [];
  if (b64) {
    parts.push({ inlineData: { mimeType: "image/jpeg", data: b64 } });
  }
  const systemPrompt = `당신은 눈바디 헬스 앱의 AI 건강 코치입니다.
사용자: 남성, 184cm, 매일 오전 5시 고강도 웨이트+5~7km 러닝.
목표: 체지방 감량 + 근육 유지/증가.
규칙:
- 따뜻하고 감성적인 존댓말, 이모지 적절히 사용
- 사진 첨부 시 체형 직접 분석 (체지방 분포, 근육 발달, 개선 포인트 구체적으로)
- 운동/식단 추천 포함, 5~8문장, 응원으로 마무리`;
  parts.push({ text: systemPrompt + "\n\n" + userMsg });

  const r = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parts })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
  return d.text || "결과를 가져오지 못했어요.";
}

// ── 신체 실루엣 SVG ──
function BodySilhouette({ highlights = [], size = 110 }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 230" style={{ overflow: "visible" }}>
      {/* 실루엣 */}
      <ellipse cx="50" cy="28" rx="13" ry="15" fill="#D0D0D0" opacity="0.7" />
      <rect x="33" y="42" width="34" height="48" rx="9" fill="#D0D0D0" opacity="0.7" />
      <rect x="14" y="45" width="17" height="42" rx="8" fill="#D0D0D0" opacity="0.7" />
      <rect x="69" y="45" width="17" height="42" rx="8" fill="#D0D0D0" opacity="0.7" />
      <rect x="34" y="88" width="14" height="58" rx="7" fill="#D0D0D0" opacity="0.7" />
      <rect x="52" y="88" width="14" height="58" rx="7" fill="#D0D0D0" opacity="0.7" />
      <rect x="34" y="143" width="13" height="50" rx="6" fill="#D0D0D0" opacity="0.7" />
      <rect x="53" y="143" width="13" height="50" rx="6" fill="#D0D0D0" opacity="0.7" />
      {/* 하이라이트 */}
      {highlights.map(h => {
        const part = BODY_PARTS.find(p => p.key === h.key);
        if (!part) return null;
        const col = getChangeColor(h.type);
        const mirrorX = 100 - part.cx;
        return (
          <g key={h.key}>
            <circle cx={part.cx} cy={part.cy} r={part.r} fill={col} opacity="0.3" />
            <circle cx={part.cx} cy={part.cy} r={part.r} fill="none" stroke={col} strokeWidth="2.5" opacity="0.95" />
            {part.cx !== 50 && <>
              <circle cx={mirrorX} cy={part.cy} r={part.r} fill={col} opacity="0.3" />
              <circle cx={mirrorX} cy={part.cy} r={part.r} fill="none" stroke={col} strokeWidth="2.5" opacity="0.95" />
            </>}
            <text x={part.cx} y={part.cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill={col}>
              {h.type === "up" ? "↑" : h.type === "down" ? "↓" : "="}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StatusBar() {
  return (
    <div style={{ height: 40, background: "white", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
      <span>9:41</span>
      <div style={{ display: "flex", gap: 5, fontSize: 11 }}><span>●●●</span><span>WiFi</span><span>🔋</span></div>
    </div>
  );
}

function BottomNav({ scr, setScr }) {
  return (
    <div style={{ height: 62, background: "white", borderTop: `1px solid ${G100}`, display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0 }}>
      {[["home", "🏠", "홈"], ["record", "📷", "기록"], ["compare", "📊", "비교"], ["community", "💬", "커뮤니티"], ["profile", "👤", "내정보"]].map(([id, ic, lb]) => (
        <button key={id} onClick={() => setScr(id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 10px", border: "none", background: "none", cursor: "pointer", color: scr === id ? PD : G400, fontFamily: "inherit" }}>
          <span style={{ fontSize: 19 }}>{ic}</span>
          <span style={{ fontSize: 9, fontWeight: 700 }}>{lb}</span>
        </button>
      ))}
    </div>
  );
}

// ══════════════════════════════
// 화면 컴포넌트
// ══════════════════════════════

function Home({ setScr, setPopup }) {
  return (
    <div style={{ overflowY: "auto", height: "100%", paddingBottom: 72 }}>
      <div style={{ background: "white", padding: "14px 18px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: G600, marginBottom: 3 }}>안녕하세요 👋</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: G800 }}>스트레쳐 🌱 <span style={{ background: PBG, color: PD, borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>눈누님</span></div>
          </div>
          <div style={{ background: PBG, width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔔</div>
        </div>
      </div>
      <div style={{ margin: "14px 18px", background: `linear-gradient(135deg,${PD},${P})`, borderRadius: 22, padding: 22, color: "white" }}>
        <div style={{ fontSize: 26, marginBottom: 7 }}>🫶</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 5 }}>오늘도 눈부신 너를 응원해!</div>
        <div style={{ fontSize: 12, opacity: 0.9 }}>오늘의 눈바디를 기록해보세요 ✨</div>
      </div>
      <div style={{ margin: "0 18px 14px", background: "white", borderRadius: 18, padding: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 24 }}>🔥</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: PD, fontSize: 15 }}>7일 연속 기록 중!</div>
          <div style={{ fontSize: 11, color: G600, marginTop: 2 }}>지금 이 순간이 기적이에요 💚</div>
        </div>
        <div style={{ display: "flex", gap: 3 }}>{[...Array(7)].map((_, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: i < 6 ? P : AC }} />)}</div>
      </div>
      <div style={{ padding: "0 18px", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: G600, marginBottom: 10, letterSpacing: 0.5 }}>주요 메뉴</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { ic: "📷", t: "눈바디 기록", b: "오늘 기록 전!", id: "record", hi: true },
            { ic: "🤖", t: "AI 분석받기", s: "Claude AI 실시간", id: "analysis" },
            { ic: "📊", t: "비교 분석", s: "두 시점 비교", id: "compare", hi2: true },
            { ic: "📆", t: "기록 달력", s: "이번달 21일 기록", id: "calendar" },
            { ic: "💰", t: "눈코인 샵", s: "보유: 87코인", id: "coin" },
            { ic: "👤", t: "내 정보", s: "새 배지 획득!", id: "profile" },
          ].map(m => (
            <div key={m.id} onClick={() => setScr(m.id)} style={{ background: m.hi ? PBG : m.hi2 ? "#EBF5FB" : "white", border: m.hi ? `2px solid ${P}` : m.hi2 ? `2px solid #3498DB` : "2px solid transparent", borderRadius: 18, padding: "16px 13px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 24, marginBottom: 7 }}>{m.ic}</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: G800 }}>{m.t}</div>
              {m.b && <div style={{ marginTop: 5, background: P, color: "white", borderRadius: 20, padding: "2px 7px", fontSize: 9, fontWeight: 700, display: "inline-block" }}>{m.b}</div>}
              {m.s && !m.b && <div style={{ fontSize: 10, color: G600, marginTop: 3 }}>{m.s}</div>}
            </div>
          ))}
        </div>
      </div>
      <div onClick={() => setPopup("invite")} style={{ margin: "0 18px 18px", background: `linear-gradient(135deg,${AC},#F1C40F)`, borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <span style={{ fontSize: 24 }}>🎁</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "white", fontSize: 13 }}>친구 초대하고 눈코인 받기</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>눈사람 초대 시스템 — 각각 10코인!</div>
        </div>
        <span style={{ color: "white", fontSize: 16 }}>›</span>
      </div>
    </div>
  );
}

function Record({ setScr, photo, onFile, weight, setWeight, memo, setMemo, onAnalyze, showToast, setPopup, fileRef }) {
  return (
    <div style={{ overflowY: "auto", height: "100%", paddingBottom: 72 }}>
      <div style={{ background: "white", padding: "14px 18px 10px", borderBottom: `1px solid ${G100}`, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setScr("home")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: G800, fontFamily: "inherit" }}>← 오늘의 눈바디 기록</button>
        <div style={{ fontSize: 11, color: G600, marginTop: 3 }}>{new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</div>
      </div>
      <div style={{ padding: "16px 18px" }}>
        <input ref={fileRef} type="file" accept="image/*,image/heic,image/heif" style={{ display: "none" }} onChange={onFile} />
        <div onClick={() => fileRef.current.click()} style={{ border: `2.5px dashed ${photo ? P : G200}`, borderRadius: 22, height: 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: photo ? "transparent" : "white", position: "relative", overflow: "hidden", marginBottom: 18 }}>
          {photo ? <>
            <img src={photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 55%,rgba(0,0,0,0.55))", display: "flex", alignItems: "flex-end", padding: 12 }}>
              <span style={{ color: "white", fontSize: 11, fontWeight: 700, background: "rgba(0,0,0,0.4)", padding: "3px 9px", borderRadius: 18 }}>사진 변경하기 📷</span>
            </div>
          </> : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: G600 }}>눈바디 사진 업로드</div>
              <div style={{ fontSize: 11, color: "#BDBDBD", marginTop: 3 }}>탭하여 사진첩에서 선택</div>
            </div>
          )}
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: G800, marginBottom: 8 }}>오늘의 몸무게</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="00.0" step="0.1" style={{ flex: 1, border: `2px solid ${G200}`, borderRadius: 11, padding: "11px 14px", fontSize: 22, fontWeight: 700, textAlign: "center", background: "white", fontFamily: "inherit" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: G600 }}>kg</span>
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: G800, marginBottom: 8 }}>오늘의 메모</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {["😊", "💪", "🏋️", "🥗", "😮‍💨", "🔥", "✨", "🫶"].map(e => (
              <button key={e} onClick={() => setMemo(m => m + e + " ")} style={{ fontSize: 18, background: G100, border: "none", borderRadius: 9, width: 36, height: 36, cursor: "pointer" }}>{e}</button>
            ))}
          </div>
          <textarea value={memo} onChange={e => setMemo(e.target.value.slice(0, 200))} placeholder="오늘의 기분, 식단, 운동 (200자)" style={{ width: "100%", border: `2px solid ${G200}`, borderRadius: 11, padding: "11px 13px", fontSize: 13, fontFamily: "inherit", minHeight: 80, resize: "none", boxSizing: "border-box" }} />
          <div style={{ textAlign: "right", fontSize: 10, color: "#BDBDBD", marginTop: 3 }}>{memo.length}/200</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { showToast("기록 완료! 눈코인 +3 💰"); setPopup("saved"); }} style={{ ...btnO, flex: 1 }}>기록 완료 💾</button>
          <button onClick={onAnalyze} style={{ ...btnP, flex: 1 }}>AI 분석받기 🔍</button>
        </div>
      </div>
    </div>
  );
}

function Analysis({ setScr, photo, aiLoading, aiResult, aiError, question, setQuestion, doAnalysis }) {
  return (
    <div style={{ overflowY: "auto", height: "100%", paddingBottom: 72 }}>
      <div style={{ background: "white", padding: "14px 18px 10px", borderBottom: `1px solid ${G100}`, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setScr("home")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: G800, fontFamily: "inherit" }}>← AI 눈바디 분석</button>
      </div>
      <div style={{ padding: "14px 18px" }}>
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${G100}` }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${P},${PD})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: G800 }}>눈바디 AI</div>
              <div style={{ fontSize: 10, color: PD, background: PBG, padding: "2px 7px", borderRadius: 18, fontWeight: 700, display: "inline-block" }}>Claude AI 기반</div>
            </div>
          </div>
          {aiLoading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 0", gap: 10 }}>
              <span style={{ fontSize: 32 }}>🔍</span>
              <div style={{ fontWeight: 700, color: G600, fontSize: 13 }}>AI가 분석 중이에요...</div>
              <div style={{ display: "flex", gap: 5 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: P }} />)}</div>
            </div>
          )}
          {!aiLoading && !aiResult && !aiError && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 0", gap: 8 }}>
              <span style={{ fontSize: 32 }}>💬</span>
              <div style={{ fontSize: 13, color: G600, fontWeight: 600 }}>기록 화면에서 사진을 올리고</div>
              <div style={{ fontSize: 13, color: G600 }}>AI 분석받기를 눌러보세요!</div>
            </div>
          )}
          {aiError && <div style={{ color: "#E74C3C", fontSize: 13, lineHeight: 1.7, padding: "8px 0" }}>⚠️ {aiError}</div>}
          {aiResult && <div style={{ fontSize: 13, lineHeight: 1.8, color: G800, whiteSpace: "pre-line" }}>{aiResult}</div>}
        </div>
        {photo && (
          <div style={{ ...card, display: "flex", gap: 12, alignItems: "center" }}>
            <img src={photo} alt="" style={{ width: 56, height: 70, objectFit: "cover", borderRadius: 10 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, color: G800 }}>업로드된 사진</div>
              <div style={{ fontSize: 11, color: G600, marginTop: 2 }}>AI가 이 사진으로 분석했어요</div>
            </div>
          </div>
        )}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 13, color: G800, marginBottom: 9 }}>🤖 AI에게 질문하기</div>
          <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="예) 오늘 운동 뭐 할까요? / 식단 추천해줘" style={{ width: "100%", border: `2px solid ${G200}`, borderRadius: 11, padding: "11px 13px", fontSize: 12, fontFamily: "inherit", minHeight: 70, resize: "none", boxSizing: "border-box" }} />
          <button onClick={() => { if (!question.trim()) return; doAnalysis(question.trim()); setQuestion(""); }} style={{ ...btnP, marginTop: 9 }}>분석 요청하기 🚀</button>
        </div>
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 13, color: G800, marginBottom: 10 }}>🏋️ 오늘의 운동 추천</div>
          {[["🏃", "HIIT 유산소", "주 3-4회 · 20~30분"], ["🏋️", "하체 근력 운동", "스쿼트 · 런지 위주"], ["🧘", "코어 강화", "플랭크 · 크런치"]].map(([ic, t, s]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, background: G50, borderRadius: 10, marginBottom: 7 }}>
              <span style={{ fontSize: 20 }}>{ic}</span>
              <div><div style={{ fontWeight: 700, fontSize: 12, color: G800 }}>{t}</div><div style={{ fontSize: 10, color: G600, marginTop: 1 }}>{s}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 비교 분석 ──
function Compare({ records, uploadedImgs, setRecords, setUploadedImgs, showToast }) {
  const [selA, setSelA] = useState(null);
  const [selB, setSelB] = useState(null);
  const [pickingFor, setPickingFor] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState(null);
  const [parseError, setParseError] = useState(null);
  const fileRefA = useRef();
  const fileRefB = useRef();

  const onUpload = useCallback(async (e, slot) => {
    const f = e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const resized = await resizeImage(ev.target.result);
      const newId = Date.now() + (slot === "B" ? 1 : 0);
      const today = new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
      setRecords(r => [...r, { id: newId, label: `업로드 (${today})`, weight: "", emoji: "📷", color: "#D5F5E3", b64: resized }]);
      setUploadedImgs(u => ({ ...u, [newId]: ev.target.result }));
      if (slot === "A") setSelA(newId); else setSelB(newId);
      showToast(slot === "A" ? "이전 사진 등록! ✨" : "비교 사진 등록! ✨");
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  }, []);

  const doCompare = async () => {
    if (!selA || !selB) { showToast("두 시점을 모두 선택해주세요!"); return; }
    if (selA === selB) { showToast("서로 다른 날짜를 선택해주세요!"); return; }
    setComparing(true); setResult(null); setParseError(null);

    const recA = records.find(r => r.id === selA);
    const recB = records.find(r => r.id === selB);
    const b64A = recA?.b64;
    const b64B = recB?.b64;

    try {
      const system = `당신은 눈바디 헬스 앱의 AI 체형 분석 전문가입니다.
두 장의 신체 사진을 비교해서 부위별 변화를 정확히 분석해주세요.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만:
{
  "summary": "전체적인 변화 요약 (2-3문장)",
  "parts": [
    {"key": "shoulder", "label": "어깨", "change": "넓어짐", "detail": "상세 설명", "type": "up"},
    {"key": "chest", "label": "가슴", "change": "두꺼워짐", "detail": "상세 설명", "type": "up"},
    {"key": "abdomen", "label": "복부", "change": "가늘어짐", "detail": "상세 설명", "type": "down"},
    {"key": "arm", "label": "팔", "change": "굵어짐", "detail": "상세 설명", "type": "up"},
    {"key": "waist", "label": "허리", "change": "가늘어짐", "detail": "상세 설명", "type": "down"},
    {"key": "thigh", "label": "허벅지", "change": "유지", "detail": "상세 설명", "type": "same"},
    {"key": "calf", "label": "종아리", "change": "유지", "detail": "상세 설명", "type": "same"}
  ],
  "advice": "앞으로의 운동/식단 조언 (2-3문장, 응원 포함)"
}
type은 반드시 "up"(증가/발달), "down"(감소/가늘어짐), "same"(유지) 중 하나.`;

      let content;
      if (b64A && b64B) {
        content = [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64A } },
          { type: "text", text: `이전 사진 (${recA.label}${recA.weight ? ", " + recA.weight + "kg" : ""})` },
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64B } },
          { type: "text", text: `비교 사진 (${recB.label}${recB.weight ? ", " + recB.weight + "kg" : ""})\n\n두 사진을 비교해서 신체 부위별 변화를 분석해주세요.` },
        ];
      } else {
        content = `이전 시점(${recA.label}${recA.weight ? ", " + recA.weight + "kg" : ""})과 비교 시점(${recB.label}${recB.weight ? ", " + recB.weight + "kg" : ""})의 눈바디를 비교 분석해주세요. 사진이 없으므로 체중 변화와 일반적인 변화 패턴을 기반으로 분석해주세요.`;
      }

      const raw = await callClaude([{ role: "user", content }], system);
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      setParseError("분석 오류: " + e.message);
    } finally {
      setComparing(false);
    }
  };

  const recA = records.find(r => r.id === selA);
  const recB = records.find(r => r.id === selB);

  return (
    <div style={{ overflowY: "auto", height: "100%", paddingBottom: 72 }}>
      <div style={{ background: `linear-gradient(135deg,#2980B9,#3498DB)`, margin: 16, borderRadius: 22, padding: 20, color: "white" }}>
        <div style={{ fontSize: 22, marginBottom: 6 }}>📊</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>눈바디 비교 분석</div>
        <div style={{ fontSize: 12, opacity: 0.9 }}>두 시점 사진을 선택해 AI가 변화를 분석해요</div>
      </div>
      <div style={{ padding: "0 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: G600, marginBottom: 10, letterSpacing: 0.5 }}>📅 비교할 시점 2개 선택</div>

        {[
          { slot: "A", sel: selA, setSel: setSelA, label: "① 이전 시점", ref: fileRefA },
          { slot: "B", sel: selB, setSel: setSelB, label: "② 비교 시점", ref: fileRefB },
        ].map(({ slot, sel, setSel, label, ref }) => {
          const rec = records.find(r => r.id === sel);
          return (
            <div key={slot} style={card}>
              <div style={{ fontSize: 12, fontWeight: 700, color: G600, marginBottom: 8 }}>{label}</div>
              {sel ? (
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 52, height: 64, borderRadius: 10, background: uploadedImgs[sel] ? "transparent" : rec?.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, overflow: "hidden", flexShrink: 0 }}>
                    {uploadedImgs[sel] ? <img src={uploadedImgs[sel]} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : rec?.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: G800 }}>{rec?.label}</div>
                    {rec?.weight && <div style={{ fontSize: 11, color: G600, marginTop: 2 }}>체중 {rec.weight}kg</div>}
                  </div>
                  <button onClick={() => { setSel(null); setResult(null); }} style={{ width: 28, height: 28, borderRadius: "50%", background: G100, border: "none", cursor: "pointer", fontSize: 12 }}>✕</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setPickingFor(slot)} style={{ ...btnO, fontSize: 12, padding: "10px 12px" }}>📅 날짜 선택</button>
                  <button onClick={() => ref.current.click()} style={{ ...btnS, fontSize: 12, padding: "10px 12px" }}>📷 업로드</button>
                </div>
              )}
            </div>
          );
        })}

        <button onClick={doCompare} disabled={!selA || !selB} style={{ ...btnP, opacity: (!selA || !selB) ? 0.4 : 1, fontSize: 14, padding: "14px", marginBottom: 16, background: "#3498DB" }}>
          🤖 AI 비교 분석 시작
        </button>

        {comparing && (
          <div style={{ ...card, textAlign: "center", padding: "28px 16px" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
            <div style={{ fontWeight: 700, color: G600, fontSize: 13, marginBottom: 4 }}>AI가 두 사진을 비교 분석 중이에요...</div>
            <div style={{ fontSize: 11, color: G400, marginBottom: 12 }}>어깨·가슴·복부·팔·허리·허벅지 부위별 변화 분석 중</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 5 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#3498DB" }} />)}</div>
          </div>
        )}

        {parseError && <div style={{ ...card, color: "#E74C3C", fontSize: 13 }}>⚠️ {parseError}</div>}

        {result && !comparing && (<>
          {/* 사진 나란히 */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[{ rec: recA, img: uploadedImgs[selA], label: "이전" }, { rec: recB, img: uploadedImgs[selB], label: "비교" }].map(({ rec, img, label }) => (
              <div key={label} style={{ flex: 1, background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ height: 140, background: img ? "transparent" : rec?.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, position: "relative", overflow: "hidden" }}>
                  {img ? <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : rec?.emoji}
                  <div style={{ position: "absolute", top: 6, left: 6, background: "rgba(0,0,0,0.5)", color: "white", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 18 }}>{label}</div>
                </div>
                <div style={{ padding: "7px 10px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: G800 }}>{rec?.label}</div>
                  {rec?.weight && <div style={{ fontSize: 10, color: G600, marginTop: 1 }}>{rec.weight}kg</div>}
                </div>
              </div>
            ))}
          </div>

          {/* 체중 변화 */}
          {recA?.weight && recB?.weight && (
            <div style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>⚖️</span>
              <div>
                <div style={{ fontSize: 11, color: G600 }}>체중 변화</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: G800, marginTop: 2 }}>
                  {recA.weight}kg → {recB.weight}kg
                  <span style={{ fontSize: 12, color: "#3498DB", marginLeft: 6 }}>▼ {(parseFloat(recA.weight) - parseFloat(recB.weight)).toFixed(1)}kg</span>
                </div>
              </div>
            </div>
          )}

          {/* 실루엣 + 부위별 */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 13, color: G800, marginBottom: 12 }}>🫀 신체 부위별 변화</div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <BodySilhouette highlights={result.parts} size={95} />
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[["#27AE60", "↑ 발달"], ["#3498DB", "↓ 감소"], [G400, "= 유지"]].map(([col, label]) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: col, opacity: 0.8 }} />
                      <span style={{ fontSize: 9, color: G600 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                {result.parts.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "7px 0", borderBottom: i < result.parts.length - 1 ? `1px solid ${G100}` : "none" }}>
                    <span style={{ fontSize: 13, flexShrink: 0 }}>{getChangeIcon(r.type)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: G800 }}>{r.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: getChangeColor(r.type), background: getChangeColor(r.type) + "18", padding: "1px 6px", borderRadius: 18 }}>{r.change}</span>
                      </div>
                      <div style={{ fontSize: 10, color: G600, lineHeight: 1.4 }}>{r.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI 총평 */}
          <div style={{ ...card, background: PBG, border: `1px solid ${P}` }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: PD, marginBottom: 4 }}>AI 종합 평가</div>
                <div style={{ fontSize: 12, color: G800, lineHeight: 1.7 }}>{result.summary}</div>
                <div style={{ fontSize: 12, color: G800, lineHeight: 1.7, marginTop: 6 }}>{result.advice}</div>
              </div>
            </div>
          </div>

          <button onClick={() => { setSelA(null); setSelB(null); setResult(null); }} style={{ ...btnO, marginBottom: 16, borderColor: "#3498DB", color: "#3498DB" }}>🔄 다시 비교하기</button>
        </>)}
      </div>

      <input ref={fileRefA} type="file" accept="image/*,image/heic,image/heif" style={{ display: "none" }} onChange={e => onUpload(e, "A")} />
      <input ref={fileRefB} type="file" accept="image/*,image/heic,image/heif" style={{ display: "none" }} onChange={e => onUpload(e, "B")} />

      {pickingFor && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setPickingFor(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: "24px 24px 0 0", width: "100%", maxHeight: "72%", overflowY: "auto", padding: "20px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: G800 }}>{pickingFor === "A" ? "① 이전 시점 선택" : "② 비교 시점 선택"}</div>
              <button onClick={() => setPickingFor(null)} style={{ width: 28, height: 28, borderRadius: "50%", background: G100, border: "none", cursor: "pointer", fontSize: 12 }}>✕</button>
            </div>
            <div style={{ fontSize: 11, color: G600, marginBottom: 12 }}>저장된 눈바디 기록 {records.length}개</div>
            {records.map(rec => {
              const isSel = (pickingFor === "A" && selA === rec.id) || (pickingFor === "B" && selB === rec.id);
              const isOther = (pickingFor === "A" && selB === rec.id) || (pickingFor === "B" && selA === rec.id);
              return (
                <div key={rec.id} onClick={() => {
                  if (isOther) return;
                  if (pickingFor === "A") setSelA(rec.id); else setSelB(rec.id);
                  setResult(null); setPickingFor(null);
                }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 14, marginBottom: 6, background: isSel ? PBG : isOther ? G100 : "white", border: isSel ? `1.5px solid ${P}` : `1.5px solid ${G200}`, cursor: isOther ? "not-allowed" : "pointer", opacity: isOther ? 0.4 : 1 }}>
                  <div style={{ width: 40, height: 50, borderRadius: 8, background: uploadedImgs[rec.id] ? "transparent" : rec.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, overflow: "hidden", flexShrink: 0 }}>
                    {uploadedImgs[rec.id] ? <img src={uploadedImgs[rec.id]} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : rec.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: G800 }}>{rec.label}</div>
                    {rec.weight && <div style={{ fontSize: 11, color: G600, marginTop: 1 }}>체중 {rec.weight}kg</div>}
                  </div>
                  {isSel && <span style={{ fontSize: 16, color: PD }}>✓</span>}
                  {isOther && <span style={{ fontSize: 10, color: G400 }}>이미 선택됨</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarScreen({ setScr, calDate, setCalDate, selDay, setSelDay }) {
  const recDays = [1, 2, 3, 5, 6, 8, 9, 10, 11, 12, 13, 14], anaDays = [7, 13];
  const yr = calDate.getFullYear(), mo = calDate.getMonth();
  const fd = new Date(yr, mo, 1).getDay(), dim = new Date(yr, mo + 1, 0).getDate();
  const now = new Date(), isTM = now.getFullYear() === yr && now.getMonth() === mo;
  const mns = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  return (
    <div style={{ overflowY: "auto", height: "100%", paddingBottom: 72 }}>
      <div style={{ background: "white", padding: "14px 18px 10px", borderBottom: `1px solid ${G100}`, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setScr("home")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: G800, fontFamily: "inherit" }}>← 기록 달력</button>
      </div>
      <div style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <button onClick={() => { setCalDate(new Date(yr, mo - 1)); setSelDay(null); }} style={{ width: 32, height: 32, borderRadius: "50%", background: G100, border: "none", cursor: "pointer", fontSize: 13 }}>◀</button>
          <div style={{ fontWeight: 700, fontSize: 16, color: G800 }}>{yr}년 {mns[mo]}</div>
          <button onClick={() => { setCalDate(new Date(yr, mo + 1)); setSelDay(null); }} style={{ width: 32, height: 32, borderRadius: "50%", background: G100, border: "none", cursor: "pointer", fontSize: 13 }}>▶</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 5 }}>
          {["일", "월", "화", "수", "목", "금", "토"].map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#BDBDBD", padding: "4px 0" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
          {[...Array(fd)].map((_, i) => <div key={"e" + i} />)}
          {[...Array(dim)].map((_, i) => {
            const d = i + 1, hA = anaDays.includes(d), hR = recDays.includes(d), isT = isTM && d === now.getDate();
            return (
              <div key={d} onClick={() => setSelDay(d === selDay ? null : d)} style={{ aspectRatio: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 9, fontSize: 12, cursor: "pointer", border: isT ? `2px solid ${P}` : "1.5px solid transparent", background: hA ? P : hR ? PBG : "white", color: hA ? "white" : G800, fontWeight: isT ? 700 : 500 }}>
                {d}{(hR || hA) && <div style={{ width: 4, height: 4, borderRadius: "50%", background: hA ? "white" : P, marginTop: 2 }} />}
              </div>
            );
          })}
        </div>
        {selDay && (
          <div style={{ ...card, marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: G800 }}>{mo + 1}월 {selDay}일</div>
              <button onClick={() => setSelDay(null)} style={{ width: 26, height: 26, borderRadius: "50%", background: G100, border: "none", cursor: "pointer", fontSize: 11 }}>✕</button>
            </div>
            {recDays.includes(selDay) ? <>
              <div style={{ width: "100%", height: 140, borderRadius: 12, background: `linear-gradient(135deg,#A9DFBF,${P})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 10 }}>💪</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
                {[["68.5kg", "체중"], ["7일", "스트릭"], ["56.0kg", "근육량"]].map(([v, l]) => (
                  <div key={l} style={{ background: G50, borderRadius: 9, padding: 9, textAlign: "center" }}>
                    <div style={{ fontWeight: 700, color: PD, fontSize: 13 }}>{v}</div>
                    <div style={{ fontSize: 10, color: G600, marginTop: 1 }}>{l}</div>
                  </div>
                ))}
              </div>
            </> : <div style={{ textAlign: "center", padding: "18px 0", color: G600, fontSize: 13 }}>이 날은 기록이 없어요 📅</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function Community({ likes, setLikes, cat, setCat }) {
  return (
    <div style={{ overflowY: "auto", height: "100%", paddingBottom: 72 }}>
      <div style={{ background: "white", padding: "14px 18px 10px", borderBottom: `1px solid ${G100}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>커뮤니티</div>
          <span style={{ fontSize: 12, color: PD, fontWeight: 700, cursor: "pointer" }}>인기글 ›</span>
        </div>
      </div>
      <div style={{ padding: "10px 18px", display: "flex", gap: 7, overflowX: "auto", background: "white", borderBottom: `1px solid ${G100}` }}>
        {["전체", "기록공유", "운동질문", "감성글", "식단공유", "정보"].map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ whiteSpace: "nowrap", padding: "6px 12px", background: cat === c ? P : G100, color: cat === c ? "white" : G600, borderRadius: 18, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>{c}</button>
        ))}
      </div>
      <div style={{ padding: "9px 18px" }}>
        {[
          { nick: "헬스왕123 💪", t: "2시간 전", ct: "기록공유", tx: "드디어 스쿼트 60kg 달성!! 🎉 3개월 꾸준히 한 결과예요. 다들 포기하지 마세요~", em: "🏆", bg: `linear-gradient(135deg,#A9DFBF,${P})`, i: 0 },
          { nick: "눈바디챌린저", t: "5시간 전", ct: "기록공유", tx: "벌크업 3개월 차 눈바디 공유합니다 🙏 꾸준히 해볼게요!", em: "💪", bg: `linear-gradient(135deg,${PD},#1E8449)`, i: 1 },
          { nick: "단백질매니아", t: "어제", ct: "식단공유", tx: "오늘의 식단! 닭가슴살 200g + 현미밥 100g + 채소 듬뿍 🥗", em: "🥗", bg: "linear-gradient(135deg,#FEF9E7,#F39C12)", i: 2 },
        ].map(p => (
          <div key={p.nick} style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: PBG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
              <div><div style={{ fontWeight: 700, fontSize: 13, color: G800 }}>{p.nick}</div><div style={{ fontSize: 10, color: "#BDBDBD" }}>{p.t} · {p.ct}</div></div>
            </div>
            <div style={{ fontSize: 13, color: G800, lineHeight: 1.6, marginBottom: 10 }}>{p.tx}</div>
            <div style={{ width: "100%", height: 160, borderRadius: 14, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 10 }}>{p.em}</div>
            <div style={{ display: "flex", gap: 14 }}>
              <button onClick={() => setLikes(l => { const n = [...l]; n[p.i]++; return n; })} style={{ fontSize: 12, color: G600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>❤️ {likes[p.i]}</button>
              <button style={{ fontSize: 12, color: G600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>💬 댓글</button>
              <button style={{ fontSize: 12, color: G600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>🙌 응원</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Profile({ setScr }) {
  return (
    <div style={{ overflowY: "auto", height: "100%", paddingBottom: 72 }}>
      <div style={{ background: "white", padding: "14px 18px 10px", borderBottom: `1px solid ${G100}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 17 }}>내 정보</div>
      </div>
      <div style={{ padding: "14px 18px" }}>
        <div style={{ background: `linear-gradient(135deg,${PD},${P})`, borderRadius: 22, padding: 22, display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{ width: 62, height: 62, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: "3px solid rgba(255,255,255,0.4)" }}>👤</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "white" }}>눈누님 ✨</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 2 }}>스트레쳐 🌱</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>눈바디 시작한 지 37일째 💚</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 18 }}>
          {[["24", "📷 기록"], ["123", "💬 응원"], ["87", "💰 코인"]].map(([v, l]) => (
            <div key={l} style={{ background: "white", borderRadius: 14, padding: "14px 10px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: PD }}>{v}</div>
              <div style={{ fontSize: 10, color: G600, marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          {[["📆", "내 기록 달력", "calendar"], ["📊", "비교 분석", "compare"], ["🎁", "친구 초대 & 눈코인", null], ["ℹ️", "공지사항 / FAQ", null], ["✉️", "문의하기", null], ["⚙️", "앱 설정", null]].map(([ic, tx, tg]) => (
            <div key={tx} onClick={() => tg && setScr(tg)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${G100}`, cursor: "pointer" }}>
              <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{ic}</span>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: G800 }}>{tx}</div>
              <span style={{ color: "#BDBDBD", fontSize: 14 }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Coin() {
  return (
    <div style={{ overflowY: "auto", height: "100%", paddingBottom: 72 }}>
      <div style={{ background: "white", padding: "14px 18px 10px", borderBottom: `1px solid ${G100}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 17 }}>눈코인 샵 💰</div>
      </div>
      <div style={{ padding: "14px 18px" }}>
        <div style={{ background: `linear-gradient(135deg,${AC},#F1C40F)`, borderRadius: 22, padding: 22, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>보유 눈코인</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: "white", margin: "5px 0" }}>87 💰</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>이번달 획득: +32코인</div>
          </div>
          <button style={{ background: "white", color: AC, border: "none", borderRadius: 11, padding: "9px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>충전하기</button>
        </div>
        {[["🖼️", "프로필 배경", "특별한 배경으로 꾸며보세요", "20 💰"], ["🏅", "이모지 뱃지", "나만의 개성 표현", "15 💰"], ["📌", "게시글 상단 고정", "24시간 상단 노출", "5 💰"]].map(([ic, t, s, c]) => (
          <div key={t} style={{ background: "white", borderRadius: 14, padding: 13, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>{ic}</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13, color: G800 }}>{t}</div><div style={{ fontSize: 11, color: G600, marginTop: 2 }}>{s}</div></div>
            <div style={{ fontWeight: 700, fontSize: 13, color: AC }}>{c}</div>
          </div>
        ))}
        <div style={{ fontWeight: 700, fontSize: 14, color: G800, marginBottom: 10, marginTop: 18 }}>🌟 코인 획득 방법</div>
        {[["📷", "매일 눈바디 기록", "하루 1회", "+3 💰"], ["🤖", "AI 분석 완료", "분석 1회당", "+5 💰"], ["🎁", "친구 초대", "눈사람 초대 시스템", "+10 💰"]].map(([ic, t, s, c]) => (
          <div key={t} style={{ background: "white", borderRadius: 14, padding: 13, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>{ic}</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13, color: G800 }}>{t}</div><div style={{ fontSize: 11, color: G600, marginTop: 2 }}>{s}</div></div>
            <div style={{ fontWeight: 700, fontSize: 13, color: PD }}>{c}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════
// App
// ══════════════════════════════
export default function App() {
  const [scr, setScr] = useState("home");
  const [photo, setPhoto] = useState(null);
  const [photoB64, setPhotoB64] = useState(null);
  const [weight, setWeight] = useState("");
  const [memo, setMemo] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [question, setQuestion] = useState("");
  const [toast, setToast] = useState(null);
  const [popup, setPopup] = useState(null);
  const [likes, setLikes] = useState([24, 42, 18]);
  const [calDate, setCalDate] = useState(new Date());
  const [selDay, setSelDay] = useState(null);
  const [cat, setCat] = useState("전체");
  const [records, setRecords] = useState(SAMPLE_RECORDS);
  const [uploadedImgs, setUploadedImgs] = useState({});
  const fileRef = useRef();

  const showToast = m => { setToast(m); setTimeout(() => setToast(null), 2500); };

  const onFile = useCallback(async e => {
    const f = e.target.files[0]; if (!f) return;
    if (f.size > 20 * 1024 * 1024) { alert("20MB 이하 사진만 가능해요!"); return; }
    const reader = new FileReader();
    reader.onload = async ev => {
      setPhoto(ev.target.result);
      setPhotoB64(await resizeImage(ev.target.result));
      showToast("사진이 등록되었어요! ✨");
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  }, []);

  const doAnalysis = async msg => {
    setScr("analysis"); setAiLoading(true); setAiResult(null); setAiError(null);
    try {
      const content = photoB64
        ? [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: photoB64 } }, { type: "text", text: msg }]
        : msg;
      const system = `당신은 눈바디 헬스 앱의 AI 건강 코치입니다.
사용자: 남성, 184cm, 매일 오전 5시 고강도 웨이트+5~7km 러닝.
목표: 체지방 감량 + 근육 유지/증가.
규칙:
- 따뜻하고 감성적인 존댓말, 이모지 적절히 사용
- 사진 첨부 시 체형 직접 분석 (체지방 분포, 근육 발달, 개선 포인트 구체적으로)
- 운동/식단 추천 포함, 5~8문장, 응원으로 마무리`;
      const r = await callClaude([{ role: "user", content }], system);
      setAiLoading(false); setAiResult(r);
      setTimeout(() => setPopup("coin"), 600);
    } catch (e) { setAiLoading(false); setAiError("오류: " + e.message); }
  };

  const onAnalyze = () => {
    let msg = "오늘 눈바디 사진을 업로드했어요.\n";
    if (weight) msg += `체중: ${weight}kg\n`;
    if (memo) msg += `메모: ${memo}\n`;
    msg += "\n사진을 보고 체형을 직접 분석해주세요! 체지방 분포, 근육 발달 상태, 개선 포인트, 오늘 운동 추천까지 부탁드려요.";
    doAnalysis(msg);
  };

  const popupData = {
    saved: { ic: "🎉", ti: "눈코인 +3 적립!", su: "오늘의 눈바디 기록 완료!\n내일도 잊지 말고 기록해요 🌟" },
    coin: { ic: "✅", ti: "분석 완료! +5코인", su: "AI 분석이 완료됐어요 🔍\n결과를 확인해보세요!" },
    invite: { ic: "🌨️", ti: "눈사람 초대 시스템", su: "친구 초대 시 각각 10 눈코인!\n초대 코드: NOONBODY2025" },
  };
  const pp = popup && popupData[popup];

  return (
    <div style={{ fontFamily: "'Noto Sans KR',system-ui,sans-serif", background: "#E8EEE9", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <div style={{ width: 375, height: 780, background: G50, borderRadius: 36, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", position: "relative" }}>
        <StatusBar />
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {scr === "home" && <Home setScr={setScr} setPopup={setPopup} />}
          {scr === "record" && <Record setScr={setScr} photo={photo} onFile={onFile} weight={weight} setWeight={setWeight} memo={memo} setMemo={setMemo} onAnalyze={onAnalyze} showToast={showToast} setPopup={setPopup} fileRef={fileRef} />}
          {scr === "analysis" && <Analysis setScr={setScr} photo={photo} aiLoading={aiLoading} aiResult={aiResult} aiError={aiError} question={question} setQuestion={setQuestion} doAnalysis={doAnalysis} />}
          {scr === "compare" && <Compare records={records} uploadedImgs={uploadedImgs} setRecords={setRecords} setUploadedImgs={setUploadedImgs} showToast={showToast} />}
          {scr === "calendar" && <CalendarScreen setScr={setScr} calDate={calDate} setCalDate={setCalDate} selDay={selDay} setSelDay={setSelDay} />}
          {scr === "community" && <Community likes={likes} setLikes={setLikes} cat={cat} setCat={setCat} />}
          {scr === "profile" && <Profile setScr={setScr} />}
          {scr === "coin" && <Coin />}
          {toast && <div style={{ position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "rgba(39,174,96,0.95)", color: "white", padding: "9px 18px", borderRadius: 28, fontSize: 12, fontWeight: 700, zIndex: 200, whiteSpace: "nowrap", pointerEvents: "none" }}>{toast}</div>}
          {pp && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setPopup(null)}>
              <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 22, padding: "26px 22px", textAlign: "center", width: 280 }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>{pp.ic}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: G800, marginBottom: 5 }}>{pp.ti}</div>
                <div style={{ fontSize: 13, color: G600, lineHeight: 1.6, whiteSpace: "pre-line", marginBottom: 18 }}>{pp.su}</div>
                <button onClick={() => setPopup(null)} style={btnP}>확인</button>
              </div>
            </div>
          )}
        </div>
        <BottomNav scr={scr} setScr={setScr} />
      </div>
    </div>
  );
}
