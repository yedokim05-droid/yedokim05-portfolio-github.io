// ------------------------------------------------------------------
// 여기 있는 내용만 수정하면 사이트에 반영됩니다. (3D/스타일 코드는 건드릴 필요 없음)
// youtubeVideoId를 비워두면 클릭했을 때 "작업물 준비중 입니다" 화면이 뜹니다.
// ------------------------------------------------------------------

export const hero = {
  eyebrow: "PORTFOLIO · 2026",
  tagline: "VIDEO · MOTION · DESIGN · AI",
  name: "김예도",
  nameEn: "Kim ye do",
  greeting: "안녕하세요, 2005년생 김예도 라고 합니다.",
  description:
    "영상 기획부터 촬영, 편집, 모션그래픽, 음향 후반작업, 그래픽 디자인까지 — AI를 활용해 프로젝트에 필요한 제작 과정을 연결합니다.",
};

export const educationAwards = [
  {
    year: "2026",
    org: "한국폴리텍대학 대전캠퍼스",
    detail: "영상디자인과 · 2026학년도 2학년",
    status: "재학",
  },
  {
    year: "2026",
    org: "[AVPN X 하이테크 2기]",
    detail: "생성형 AI · 딥 리서치 · 커리어 콘텐츠 · AI 에이전트 활용 교육",
    status: "수료",
  },
  {
    year: "2025",
    org: "[네이버×어반플레이] AI BIZ 크리에이터 스쿨",
    detail: "AI 기반 이미지·영상·비즈니스 콘텐츠 제작 교육",
    status: "수료",
  },
  {
    year: "2024",
    org: "Bataan Peninsula State University",
    detail: "English Language and Cultural Immersion Program",
    status: "수료",
  },
];

export const certifications = [
  "GTQ 그래픽기술자격 1급 · Adobe Photoshop",
  "GTQi 그래픽기술자격 1급 · Adobe Illustrator",
  "ITQ OA Master · 한글 / 엑셀 / 파워포인트 / 인터넷",
  "간호조무사",
  "병원 코디네이터",
  "한국외식음료개발원 커피바리스타 2급",
  "자동차운전면허 2종 보통",
];

export const skills = [
  { category: "VIDEO", items: ["Premiere Pro", "Final Cut Pro"] },
  { category: "MOTION", items: ["After Effects", "Cinema 4D", "2D/3D"] },
  { category: "DESIGN", items: ["Photoshop", "Illustrator"] },
  {
    category: "AI",
    items: ["Nano Banana Pro", "Midjourney", "Veo", "Seedance", "Runway", "Suno", "Higgsfield"],
  },
];

export const experienceByYear = {
  2025: [
    {
      org: "우미희망재단 · 광주지방보훈청 · GIST",
      desc: "광복80 <고요한 기다림> 레코딩 MV 제작",
    },
    {
      org: "조이애끌라 콘텐츠 제작",
      desc: "MV 제작 · 녹음 믹싱 · 포스터 제작",
    },
    {
      org: "대전시 주관 지역혁신중심 대학지원체계(RISE) 서포터즈",
      desc: "<대전 원도심 핫스팟을 찾아라> 영상 콘텐츠 기획 · 제작",
    },
    {
      org: "한국폴리텍대학 대전캠퍼스 영상장비실 근로장학생",
      desc: "촬영 장비 대여 · 관리 및 영상장비실 운영",
    },
  ],
  2026: [
    {
      org: "대전 시립 연정 국악단 제198회 신년음악회 대전의 울림",
      desc: "오프닝 그래픽 · 13곡 공연 무대 영상 제작",
    },
    {
      org: "고창 시니어스칼리지 <제1회 칼리지 어울림시DAY>",
      desc: "홍보 롱폼 및 숏폼 영상 제작",
    },
    {
      org: "숙명여자대학교 K-컬처대학원 홍보영상",
      desc: "<인공지능과 함께 창작하다> 인터뷰 하이라이트 영상 4편 제작",
    },
    {
      org: "대전 동구 정책디자인단",
      desc: "<추억을 잇다> AI 레트로 페스타 생성형 구현 영상 제작",
    },
    {
      org: "백세인생 방문간호 통합 브랜딩 · 콘텐츠 제작 프로젝트",
      desc: "홍보영상 · 웹사이트 · 현판 · 사원증 · 책자 및 홍보 인쇄물 제작",
    },
    {
      org: "전주MBC 2026 JUMP 얼티밋 뮤직 페스티벌",
      desc: "10채널 멀티캠 촬영본 편집 · 3편 공연 영상 제작",
    },
    {
      org: "대전문화재단 · 한남대학교 국제 생태 예술 세미나",
      desc: "공식 영상 제작 · 진행자 인터뷰 및 세미나 촬영 · 편집",
    },
  ],
};

// categories: 이 프로젝트가 어떤 툴 섬(대시보드)에 노출될지. "VIDEO" | "MOTION" | "DESIGN" | "AI"
// 각 항목의 links 안에 있는 youtubeVideoId에 ID를 채우면 같은 YouTube
// 임베드 설정으로 해당 영상이 재생됩니다. 아직 링크가 없는 영상은 null로 둡니다.
export const featuredProjects = {
  range: "2025 - 2026",
  note: "대표 프로젝트는 영상, 모션, 디자인, AI 도구를 제작 과정에 맞춰 조합했습니다.",
  items: [
    {
      number: "M-01",
      title: "한국폴리텍대학 대전캠퍼스 홍보영상",
      description: "After Effects 기반 홍보영상 모션그래픽 제작",
      categories: ["MOTION"],
      links: [
        {
          label: "에펙 한국폴리텍대학 대전캠퍼스 홍보영상",
          youtubeVideoId: "hAEdSWOZShU",
        },
      ],
    },
    {
      number: "M-02",
      title: "AI 디자인 · After Effects 아리랑",
      description: "AI 디자인과 After Effects를 활용한 아리랑 영상 제작",
      categories: ["MOTION"],
      links: [
        {
          label: "AI 디자인 에프터이펙트 아리랑",
          youtubeVideoId: "0kh-sZXm7o8",
        },
      ],
    },
    {
      number: "M-03",
      title: "꿈돌이, 33년의 이야기",
      description: "After Effects 기반 모션그래픽 영상 제작",
      categories: ["MOTION"],
      links: [
        {
          label: "꿈돌이, 33년의 이야기",
          youtubeVideoId: "fkMXR8-aaNc",
          url: "https://youtube.com/shorts/fkMXR8-aaNc",
          aspectRatio: 9 / 16,
        },
      ],
    },
    {
      number: "01",
      title: "라이즈 <필름 속에서 태어난 꿈>",
      description: "대전 원도심 홍보영상 촬영 · AI 제작",
      categories: ["VIDEO"],
      links: [
        {
          label: "라이즈 필름 속에서 태어난 꿈 촬영+AI",
          youtubeVideoId: "ozWQj0vOWrU",
        },
      ],
    },
    {
      number: "02",
      title: "조이애끌라 하울의 움직이는성 MV 제작",
      description: "MV 녹음 · 촬영 · 그래픽 제작",
      categories: ["VIDEO"],
      layout: "row",
      links: [
        { label: "조이애끌라 하울의 움직이는성 MV 제작", youtubeVideoId: "a5TgOhEIEq8" },
        { label: "조이애끌라 추가 영상", youtubeVideoId: "UfU_VSc0jBo" },
      ],
    },
    {
      number: "03",
      title: "광복80 <고요한 기다림>",
      description: "MV 촬영 · 편집 제작",
      categories: ["VIDEO"],
      links: [
        { label: "고요한 기다림 MV 촬영 편집", youtubeVideoId: "SnHFgyPzvcM" },
      ],
    },
    {
      number: "04",
      title: "2026 전주 얼티밋 뮤직 페스티벌 멀티캠편집",
      description: "멀티캠 촬영본 편집",
      categories: ["VIDEO"],
      layout: "row",
      links: [
        { label: "달빛아래 홀로 걷다", youtubeVideoId: "h3ABWatRY8s" },
        { label: "이몸이 죽고죽어", youtubeVideoId: "YIAMvZh5WvA" },
        { label: "삶", youtubeVideoId: "_U5ctxreCmM" },
      ],
    },
    {
      number: "05",
      title: "숙명여자대학교 K-컬처대학원 홍보 인터뷰 촬영",
      description: "K-컬처대학원 홍보 인터뷰 촬영",
      categories: ["VIDEO"],
      layout: "row",
      links: [
        { label: "지선우", youtubeVideoId: "LhXeXnEJM_E" },
        { label: "김수연", youtubeVideoId: "78nHTJxbg_0" },
        { label: "류서하", youtubeVideoId: "vlrUfO-2fAY" },
      ],
    },
    {
      number: "06",
      title: "백세인생 방문간호 홍보 콘텐츠 및 브랜드 디자인",
      description: "홍보영상 롱폼·숏폼 콘텐츠(19편) · 웹사이트 · 현판 · 사원증 제작",
      categories: ["VIDEO"],
      layout: "row",
      links: [
        { label: "롱폼", youtubeVideoId: "W_tz6Bgy7bg" },
        { label: "백세인생 홍보영상", youtubeVideoId: "DnjAIHMsZeQ" },
      ],
    },
    {
      number: "07",
      title: "디자인 페이지는 추후 업데이트 될 예정입니다.",
      description: "포트폴리오 디자인 작업물은 준비가 완료되는 대로 순차적으로 업로드될 예정입니다.",
      categories: ["DESIGN"],
      links: [
        { label: "작업물 준비중", youtubeVideoId: null },
      ],
    },
    {
      number: "08",
      title: "대전시립연정국악단 <대전의 울림>",
      description: "진행 그래픽 및 13곡, 1920×540 광폭 무대영상 14편 제작",
      categories: ["MOTION"],
      links: [
        { label: "설장구 오프닝", youtubeVideoId: "faAE_MPjsx4", aspectRatio: 1920 / 540 },
        { label: "윤슬", youtubeVideoId: "V3kWnBgk19Q", aspectRatio: 2560 / 676 },
        { label: "배경 루프 그래픽", youtubeVideoId: "IRLXNNhUcXE", aspectRatio: 1920 / 540 },
        {
          label: "[문화n공감] [문화 인사이드] 대전시립연정국악단 '대전의 울림'",
          youtubeVideoId: "-MUSOgAPqEQ",
          aspectRatio: 16 / 9,
        },
      ],
    },
    {
      number: "09",
      title: "대전 동구 정책디자인단 <추억을 잇다>",
      description: "AI × Y2K 콘셉트의 동구 레트로 페스타 생성형 구현 영상 제작",
      categories: ["AI"],
      links: [{ label: "AI X Y2K 생성형 구현영상", youtubeVideoId: null }],
    },
  ],
};

export const projectProgramContributions = {
  "M-01": [
    { category: "VIDEO", program: "Premiere Pro", percentage: 35 },
    { category: "MOTION", program: "After Effects", percentage: 25 },
    { category: "MOTION", program: "Cinema 4D", percentage: 15 },
    { category: "DESIGN", program: "Photoshop", percentage: 10 },
    { category: "AI", program: "Runway", percentage: 15 },
  ],
  "M-02": [
    { category: "VIDEO", program: "Final Cut Pro", percentage: 30 },
    { category: "MOTION", program: "After Effects", percentage: 20 },
    { category: "MOTION", program: "2D/3D", percentage: 15 },
    { category: "DESIGN", program: "Illustrator", percentage: 15 },
    { category: "AI", program: "Midjourney", percentage: 10 },
    { category: "AI", program: "Veo", percentage: 10 },
  ],
  "M-03": [
    { category: "MOTION", program: "After Effects", percentage: 40 },
    { category: "VIDEO", program: "Premiere Pro", percentage: 25 },
    { category: "DESIGN", program: "Illustrator", percentage: 15 },
    { category: "DESIGN", program: "Photoshop", percentage: 10 },
    { category: "AI", program: "Midjourney", percentage: 10 },
  ],
  "01": [
    { category: "VIDEO", program: "Premiere Pro", percentage: 25 },
    { category: "MOTION", program: "After Effects", percentage: 20 },
    { category: "MOTION", program: "Cinema 4D", percentage: 15 },
    { category: "DESIGN", program: "Photoshop", percentage: 10 },
    { category: "DESIGN", program: "Illustrator", percentage: 10 },
    { category: "AI", program: "Nano Banana Pro", percentage: 10 },
    { category: "AI", program: "Runway", percentage: 10 },
  ],
  "02": [
    { category: "VIDEO", program: "Premiere Pro", percentage: 30 },
    { category: "MOTION", program: "After Effects", percentage: 20 },
    { category: "MOTION", program: "2D/3D", percentage: 15 },
    { category: "DESIGN", program: "Photoshop", percentage: 15 },
    { category: "DESIGN", program: "Illustrator", percentage: 10 },
    { category: "AI", program: "Suno", percentage: 10 },
  ],
  "03": [
    { category: "VIDEO", program: "Premiere Pro", percentage: 35 },
    { category: "MOTION", program: "After Effects", percentage: 20 },
    { category: "MOTION", program: "Cinema 4D", percentage: 15 },
    { category: "DESIGN", program: "Photoshop", percentage: 15 },
    { category: "AI", program: "Veo", percentage: 15 },
  ],
  "04": [
    { category: "VIDEO", program: "Premiere Pro", percentage: 40 },
    { category: "MOTION", program: "After Effects", percentage: 20 },
    { category: "MOTION", program: "2D/3D", percentage: 10 },
    { category: "DESIGN", program: "Photoshop", percentage: 10 },
    { category: "AI", program: "Runway", percentage: 10 },
    { category: "AI", program: "Veo", percentage: 10 },
  ],
  "05": [
    { category: "VIDEO", program: "Final Cut Pro", percentage: 35 },
    { category: "MOTION", program: "After Effects", percentage: 20 },
    { category: "DESIGN", program: "Photoshop", percentage: 15 },
    { category: "DESIGN", program: "Illustrator", percentage: 10 },
    { category: "AI", program: "Nano Banana Pro", percentage: 10 },
    { category: "AI", program: "Veo", percentage: 10 },
  ],
  "06": [
    { category: "VIDEO", program: "Premiere Pro", percentage: 30 },
    { category: "MOTION", program: "After Effects", percentage: 15 },
    { category: "DESIGN", program: "Photoshop", percentage: 20 },
    { category: "DESIGN", program: "Illustrator", percentage: 15 },
    { category: "AI", program: "Runway", percentage: 10 },
    { category: "AI", program: "Midjourney", percentage: 10 },
  ],
  "07": [
    { category: "DESIGN", program: "Photoshop", percentage: 50 },
    { category: "DESIGN", program: "Illustrator", percentage: 50 },
  ],
  "08": [
    { category: "VIDEO", program: "Premiere Pro", percentage: 30 },
    { category: "MOTION", program: "After Effects", percentage: 25 },
    { category: "MOTION", program: "Cinema 4D", percentage: 15 },
    { category: "DESIGN", program: "Illustrator", percentage: 10 },
    { category: "AI", program: "Veo", percentage: 10 },
    { category: "AI", program: "Runway", percentage: 10 },
  ],
  "09": [
    { category: "VIDEO", program: "Premiere Pro", percentage: 20 },
    { category: "MOTION", program: "After Effects", percentage: 15 },
    { category: "DESIGN", program: "Photoshop", percentage: 15 },
    { category: "DESIGN", program: "Illustrator", percentage: 10 },
    { category: "AI", program: "Nano Banana Pro", percentage: 15 },
    { category: "AI", program: "Midjourney", percentage: 10 },
    { category: "AI", program: "Veo", percentage: 15 },
  ],
  "AI-1": [
    { category: "VIDEO", program: "Premiere Pro", percentage: 25 },
    { category: "MOTION", program: "After Effects", percentage: 15 },
    { category: "DESIGN", program: "Photoshop", percentage: 15 },
    { category: "AI", program: "Midjourney", percentage: 20 },
    { category: "AI", program: "Veo", percentage: 15 },
    { category: "AI", program: "Runway", percentage: 10 },
  ],
  "AI-2": [
    { category: "VIDEO", program: "Final Cut Pro", percentage: 25 },
    { category: "MOTION", program: "2D/3D", percentage: 15 },
    { category: "DESIGN", program: "Illustrator", percentage: 15 },
    { category: "AI", program: "Nano Banana Pro", percentage: 15 },
    { category: "AI", program: "Midjourney", percentage: 15 },
    { category: "AI", program: "Veo", percentage: 15 },
  ],
  "AI-3": [
    { category: "VIDEO", program: "Premiere Pro", percentage: 25 },
    { category: "MOTION", program: "After Effects", percentage: 15 },
    { category: "DESIGN", program: "Photoshop", percentage: 10 },
    { category: "AI", program: "Nano Banana Pro", percentage: 20 },
    { category: "AI", program: "Veo", percentage: 15 },
    { category: "AI", program: "Runway", percentage: 15 },
  ],
  "AI-4": [
    { category: "VIDEO", program: "Premiere Pro", percentage: 30 },
    { category: "MOTION", program: "After Effects", percentage: 20 },
    { category: "DESIGN", program: "Photoshop", percentage: 10 },
    { category: "DESIGN", program: "Illustrator", percentage: 10 },
    { category: "AI", program: "Midjourney", percentage: 15 },
    { category: "AI", program: "Veo", percentage: 15 },
  ],
};

export const aiPersonalProjects = {
  title: "100% AI 디자인 활용 개인 프로젝트",
  items: [
    { label: "폭스바겐 AI 생성 광고", youtubeVideoId: "sPPy4D5Q6Ls" },
    { label: "동구 레트로 페스타", youtubeVideoId: "QBRNtGUaHwg" },
    { label: "백세인생 AI 쇼츠", youtubeVideoId: "RndH-GUnVZ4", aspectRatio: 1080 / 1920 },
    { label: "부산 부기 캐릭터 활용 MV", youtubeVideoId: "yT-n-TR8uF0", aspectRatio: 1920 / 544 },
  ],
};

export const contact = {
  message: "영상 제작 · 디자인 협업 및 프로젝트 문의는 아래로 연락해 주세요.",
  email: "yedokim05@gmail.com",
  phone: "010-5877-4685",
};
