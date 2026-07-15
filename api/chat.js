export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const MOCK_RESPONSES = [
    "오늘 눈바디 사진을 잘 받았어요! 💪\n\n전반적으로 상체 근육 발달이 양호하고, 어깨와 가슴 라인이 뚜렷하게 보여요. 복부 쪽에 약간의 체지방이 남아있지만 꾸준한 유산소로 충분히 감량 가능한 수준이에요.\n\n오늘 추천: 인클라인 벤치프레스 4세트 + 케이블 플라이 3세트! 러닝 후 코어 플랭크 3분을 추가하면 더욱 효과적이에요. 정말 잘하고 있어요, 파이팅! 🔥",
    "안녕하세요! 오늘도 열심히 운동하셨군요 🏋️\n\n하체 근육 발달이 인상적이에요. 대퇴사두근과 햄스트링 라인이 선명하게 잡혀가고 있어요. 체지방은 전체적으로 낮은 편이에요.\n\n오늘은 풀업 5세트, 덤벨 로우 4세트로 등 두께를 만들어보면 좋겠어요. 184cm에 이 체형이면 정말 멋진 몸이 될 거예요, 응원해요! 💚",
    "체지방 감량을 위한 핵심 포인트를 알려드릴게요 🔍\n\n지금처럼 오전 웨이트 + 러닝 루틴은 완벽해요. 탄수화물 타이밍을 조절하면 훨씬 빠른 효과를 볼 수 있어요.\n\n수면도 중요해요 — 오전 5시 운동이라면 밤 10시 전에 주무세요. 지금 루틴 정말 훌륭해요, 파이팅! 🌟",
  ];

  const text = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
  return res.status(200).json({ text });
}
