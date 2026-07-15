export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { parts } = req.body;
  const isCompare = parts && parts.some(p => p.text && p.text.includes("JSON"));

  if (isCompare) {
    return res.status(200).json({ text: JSON.stringify({
      summary: "꾸준한 운동으로 전반적인 체형이 개선되었어요! 상체 근육이 발달하고 체지방이 줄어든 것이 눈에 띄어요. 정말 대단한 노력이에요 💪",
      parts: [
        { key: "shoulder", label: "어깨", change: "넓어짐", detail: "삼각근 발달로 어깨 너비가 눈에 띄게 넓어졌어요", type: "up" },
        { key: "chest", label: "가슴", change: "두꺼워짐", detail: "대흉근 볼륨이 증가했고 윤곽선이 더 선명해졌어요", type: "up" },
        { key: "abdomen", label: "복부", change: "가늘어짐", detail: "체지방 감소로 복부 라인이 뚜렷해졌어요", type: "down" },
        { key: "arm", label: "팔", change: "굵어짐", detail: "이두근·삼두근 크기가 증가했어요", type: "up" },
        { key: "waist", label: "허리", change: "가늘어짐", detail: "허리 사이즈가 줄어 V라인이 강조됐어요", type: "down" },
        { key: "thigh", label: "허벅지", change: "유지", detail: "하체 근육량은 잘 유지되고 있어요", type: "same" },
        { key: "calf", label: "종아리", change: "유지", detail: "종아리 근육이 균형있게 유지되고 있어요", type: "same" }
      ],
      advice: "현재 루틴을 유지하면서 단백질 섭취를 조금 늘려보세요. 오전 운동 후 골든타임에 단백질 보충이 중요해요. 정말 잘하고 있어요, 파이팅! 🌟"
    })});
  }

  const MOCK_RESPONSES = [
    "오늘 눈바디 사진을 잘 받았어요! 💪\n\n전반적으로 상체 근육 발달이 양호하고, 어깨와 가슴 라인이 뚜렷하게 보여요. 복부 쪽에 약간의 체지방이 남아있지만 꾸준한 유산소로 충분히 감량 가능한 수준이에요.\n\n오늘 추천: 인클라인 벤치프레스 4세트 + 케이블 플라이 3세트! 정말 잘하고 있어요, 파이팅! 🔥",
    "안녕하세요! 오늘도 열심히 운동하셨군요 🏋️\n\n하체 근육 발달이 인상적이에요. 대퇴사두근과 햄스트링 라인이 선명하게 잡혀가고 있어요.\n\n오늘은 풀업 5세트, 덤벨 로우 4세트로 등 두께를 만들어보면 좋겠어요. 응원해요! 💚",
    "체지방 감량을 위한 핵심 포인트를 알려드릴게요 🔍\n\n지금처럼 오전 웨이트 + 러닝 루틴은 완벽해요. 수면도 중요해요 — 오전 5시 운동이라면 밤 10시 전에 주무세요. 파이팅! 🌟",
  ];

  const text = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
  return res.status(200).json({ text });
}
