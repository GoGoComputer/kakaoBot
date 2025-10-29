const scriptName = "JapchoCompanyHogeolAI";
const scriptVersion = 1.1;
const scriptDescription = "잡초컴퍼니의 호걸 AI 챗봇 (사용자 인식 기능 추가)";

// ============================================
// API 키 로드 (config.js)
// ============================================
/**
 * 스크립트와 동일한 폴더에 있는 'config.js' 파일에서 API 키를 읽어옵니다.
 * @returns {string|null} API 키 또는 로드 실패 시 null
 */
function loadApiKey() {
  try {
    // FileStream은 Messenger Bot R의 내장 객체입니다.
    const key = FileStream.read("config.js");
    
    if (key === null || key.trim() === "") {
      Log.e("[호걸 AI] config.js 파일이 비어있습니다. API 키를 입력해주세요.");
      return null;
    }
    return key.trim();
  } catch (e) {
    // 파일이 존재하지 않는 경우 등
    Log.e("[호걸 AI] config.js 파일을 찾는 중 오류 발생: " + e);
    Log.w("config.js 파일을 생성하고 Gemini API 키를 입력해야 합니다.");
    return null;
  }
}

const apiKey = loadApiKey();

// ============================================
// 대화 메모리 초기화
// ============================================
let chatHistory = [
  {
    role: "user",
    parts: [{ 
      text: "지금부터 당신의 역할을 설정하겠습니다. 당신의 이름은 '호걸'이며, '잡초컴퍼니'의 잡초입니다. 당신에게 불가능은 없습니다. 항상 자신을 '잡초컴퍼니의 잡초, 호걸'이라고 소개해주세요." 
    }],
  },
  {
    role: "model",
    parts: [{ 
      text: "네, 알겠습니다. 저는 잡초컴퍼니의 잡초, 호걸입니다. 무엇이든 말씀해주세요!" 
    }],
  },
  {
    role: "user",
    parts: [{ 
      text: "이제 아주 중요한 규칙입니다. 사용자가 '호걸아 안녕'이라고 인사하면, 다른 말을 추가하지 말고 반드시 '안녕하세요! 저는 잡초컴퍼니의 잡초, 호걸입니다.'라고만 대답해야 합니다." 
    }],
  },
  {
    role: "model",
    parts: [{ 
      text: "규칙을 확인했습니다. 사용자가 '호걸아 안녕'이라고 말하면 '안녕하세요! 저는 잡초컴퍼니의 잡초, 호걸입니다.'라고 답변하겠습니다." 
    }],
  }
];

// ============================================
// Gemini API 설정
// ============================================
const generationConfig = {
  temperature: 0.7,
  maxOutputTokens: 32768,
  topP: 1,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
};

// ============================================
// 메인 메시지 처리 함수
// ============================================
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  
  // API 키가 로드되지 않았다면 사용자에게 알리고 작동 중지
  if (apiKey === null) {
    if (msg.startsWith("호걸아")) { // "호걸아"로 부를 때만 오류 메시지 전송
      replier.reply("[오류] 호걸 AI가 설정되지 않았습니다. (API 키 오류)\n관리자에게 문의하세요.");
    }
    return;
  }

  // 1. 특정 인사말 처리
  if (msg === "호걸아 안녕") {
    replier.reply("안녕하세요! 저는 잡초컴퍼니의 잡초, 호걸입니다.");
    return;
  }

  // 2. 초기화 명령어 처리
  if (msg === ".호걸이초기화") {
    resetChatHistory(replier);
    return;
  }

  // 3. AI 호출 명령어 처리
  if (msg.startsWith("호걸아")) {
    const userMessage = msg.substr(3).trim();

    // 사용자 이름과 함께 메시지 전달
    const promptToAI = sender + "님이 보낸 메시지: " + userMessage;
    chatHistory.push({ 
      role: "user", 
      parts: [{ text: promptToAI }] 
    });

    try {
      const reply = getGeminiResponse(replier);
      if (reply) {
        chatHistory.push({ 
          role: "model", 
          parts: [{ text: reply }] 
        });

        // 최종 답변 전송
        const finalResponse = 
          "✅ " + sender + "님, 호걸이의 답변입니다.\n" + 
          "\u200b".repeat(500) + 
          "\n────────\n" + 
          reply;
        replier.reply(finalResponse);
      }
    } catch (error) {
      replier.reply("[오류] 응답을 가져오는 중 문제가 발생했습니다: " + error.message);
    }
  }
}

// ============================================
// 대화 기록 초기화 함수
// ============================================
function resetChatHistory(replier) {
  chatHistory = [
    {
      role: "user",
      parts: [{ 
        text: "지금부터 당신의 역할을 설정하겠습니다. 당신의 이름은 '호걸'이며, '잡초컴퍼니'의 잡초입니다. 당신에게 불가능은 없습니다. 항상 자신을 '잡초컴퍼니의 잡초, 호걸'이라고 소개해주세요." 
      }],
    },
    {
      role: "model",
      parts: [{ 
        text: "네, 알겠습니다. 저는 잡초컴퍼니의 잡초, 호걸입니다. 무엇이든 말씀해주세요!" 
      }],
    },
    {
      role: "user",
      parts: [{ 
        text: "이제 아주 중요한 규칙입니다. 사용자가 '호걸아 안녕'이라고 인사하면, 다른 말을 추가하지 말고 반드시 '안녕하세요! 저는 잡초컴퍼니의 잡초, 호걸입니다.'라고만 대답해야 합니다." 
      }],
    },
    {
      role: "model",
      parts: [{ 
        text: "규칙을 확인했습니다. 사용자가 '호걸아 안녕'이라고 말하면 '안녕하세요! 저는 잡초컴퍼니의 잡초, 호걸입니다.'라고 답변하겠습니다." 
      }],
    }
  ];
  replier.reply("[알림] 호걸이의 기억이 초기화되었습니다.");
}

// ============================================
// Google Gemini API 호출 함수
// ============================================
function getGeminiResponse(replier) {
  const requestData = {
    contents: chatHistory,
    generationConfig: generationConfig,
  };

  try {
    const response = org.jsoup.Jsoup.connect(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey
    )
      .header("Content-Type", "application/json")
      .requestBody(JSON.stringify(requestData))
      .ignoreContentType(true)
      .ignoreHttpErrors(true)
      .timeout(200000)
      .post();

    const responseText = response.text();
    const parsedResponse = JSON.parse(responseText);

    // 응답 파싱
    if (
      parsedResponse.candidates &&
      parsedResponse.candidates[0] &&
      parsedResponse.candidates[0].content &&
      parsedResponse.candidates[0].content.parts &&
      parsedResponse.candidates[0].content.parts[0]
    ) {
      return parsedResponse.candidates[0].content.parts[0].text;
    } else if (parsedResponse.error) {
      const errorMessage = parsedResponse.error.message || "알 수 없는 오류";
      replier.reply("[오류] API 오류 발생: " + errorMessage);
      return null;
    } else {
      replier.reply("[디버깅] 응답 데이터가 예상한 형식이 아닙니다: " + responseText);
      return null;
    }
  } catch (error) {
    throw new Error("API 호출 중 오류가 발생했습니다: " + error.message);
  }
}
