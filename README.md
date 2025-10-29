
-----

````markdown
# 🤖 잡초컴퍼니 호걸 AI 챗봇 (Messenger Bot R 용)

안녕하세요! '잡초컴퍼니의 잡초, 호걸' 챗봇 프로젝트에 오신 것을 환영합니다.

이 문서는 이 챗봇이 무엇인지, 그리고 가장 중요한 **'어떻게 설치하고 사용하는지'**를 비전공자분들의 눈높이에 맞춰 아주 자세하게 설명해 드리는 안내서입니다. 컴퓨터나 코딩을 잘 모르셔도 괜찮아요. 차근차근 따라 하시면 멋진 AI 봇을 여러분의 채팅방에서 만나보실 수 있을 거예요!

## 🌟 이 챗봇, 도대체 뭔가요?

간단히 말해, **여러분의 카카오톡 채팅방에서 대화할 수 있는 인공지능 로봇**을 만드는 스크립트(프로그램 코드)입니다.

"호걸"이라는 이름을 가진 이 봇은 '잡초컴퍼니' 소속이라는 재미있는 설정을 가지고 있어요. 그냥 정해진 말만 반복하는 옛날 챗봇과 달리, Google의 강력한 최신 인공지능인 'Gemini' 모델을 사용하기 때문에 정말 사람과 대화하는 것처럼 자연스럽고 똑똑한 답변을 해줍니다.

---

## ✨ 호걸이 봇의 특별한 기능들

* 🧠 **최신 인공지능 탑재**: Google의 Gemini AI를 두뇌로 사용합니다. 덕분에 농담, 복잡한 질문, 요약, 번역 등 거의 모든 종류의 대화가 가능해요.
* 🧐 **대화 내용 기억 (Memory)**: 방금 나눈 대화를 기억합니다. "방금 내가 뭐라고 했지?"라고 물어봐도 호걸이는 "OOO라고 하셨잖아요!"라며 이전 대화에 이어서 말할 수 있어요.
* 🎭 **확고한 캐릭터 (페르소나)**: "저는 잡초컴퍼니의 잡초, 호걸입니다."라고 자신을 소개하는 고유의 캐릭터를 가지고 있어 대화하는 재미를 더해줍니다.
* 🧑‍🤝‍🧑 **사용자 인식 기능**: 누가 질문했는지 기억하고, 답변해 줄 때 "OOO님, 호걸이의 답변입니다."라며 질문한 사람의 이름을 불러줍니다.
* 🚀 **간편한 사용법**: 복잡한 명령어 없이, 그냥 `호걸아`라고 부르기만 하면 봇이 응답합니다.

---

## [필수!] 1. 🤖 호걸이의 '심장' 구하기 (Google API 키 발급받기)

**어떤 설치 방법을 선택하든, 이 단계는 반드시 먼저 진행해야 합니다!**

호걸이 봇이 똑똑하게 생각하고 말하려면 Google의 AI 두뇌(Gemini)에 연결할 수 있는 **'비밀 열쇠'**가 필요합니다. 이 열쇠를 **'API 키'**라고 불러요.

이 키는 **절대로! 절대로! 다른 사람에게 보여주거나 인터넷에 공개하면 안 됩니다.**

자, 그럼 우리 봇만의 비밀 열쇠를 발급받으러 가볼까요?

1.  **Google AI Studio 사이트 접속**
    * 먼저, 구글 계정(G메일 계정)으로 로그인을 해주세요.
    * 그리고 이 링크를 클릭해서 'Google AI Studio'라는 곳으로 이동합니다.
    * **링크**: [https://aistudio.google.com/](https://aistudio.google.com/)
    * 

2.  **'Get API key' 버튼 찾기**
    * 사이트에 접속하면, 왼쪽 메뉴나 화면 어딘가에 `[ Get API key ]` 또는 `[ API 키 받기 ]` 라는 버튼이 보일 거예요. 그걸 눌러주세요.

3.  **새 프로젝트 만들거나 선택하기**
    * "API 키를 만들 프로젝트를 선택하라"는 창이 뜰 수 있어요.
    * 처음이라면 `[ + Create project in new tab ]` (새 탭에서 프로젝트 만들기) 같은 버튼을 눌러 새 프로젝트를 간단히 만들어주세요. 이름은 'HogeolBot'처럼 편하게 지으셔도 됩니다.

4.  **API 키 생성 및 복사하기!**
    * 프로젝트를 선택하고 나면, `[ Create API key ]` (API 키 생성) 버튼이 보일 거예요.
    * 이걸 누르면 `AIzaSy...`로 시작하는 아주 길고 복잡한 영어/숫자 조합이 짠! 하고 나타납니다. 이게 바로 우리가 찾던 '비밀 열쇠'입니다!
    * 
    * 이 키(문자열) 전체를 **복사(Ctrl+C)** 해주세요. 그리고 메모장 같은 곳에 **'딱 이 키만!'** 잠시 붙여넣기 해두세요.

> **🚨 엄청 중요해요! 🚨**
> 이 API 키는 여러분의 집 열쇠나 신용카드 비밀번호와 같아요.
> 절대로 다른 사람에게 알려주거나, 카톡방에 올리거나, 특히 **깃허브(GitHub)에 이 키가 적힌 파일을 그대로 올리면 절대 안 됩니다!** (나쁜 사람들이 여러분의 키를 훔쳐서 마구 사용하면 요금 폭탄을 맞을 수도 있어요!)

---

## [중요!] 2. 🏠 호걸이 봇 설치하기 (2가지 방법 중 선택!)

이제 비밀 열쇠(API 키)를 구했으니, 봇을 설치할 차례입니다.
설치 방법은 **'간편한 1개 파일 방식'**과 **'안전한 2개 파일 방식'**이 있습니다.

어떤 방법을 사용해야 할지 아래 설명을 보고 선택해 주세요.

| 구분 | **방법 1: 👑 간편한 방법** | **방법 2: 🛡️ 안전한 방법 (깃허브 추천)** |
| :--- | :--- | :--- |
| **개요** | 모든 코드를 1개 파일(`geminiApi.js`)에 다 넣음 | 코드와 API 키를 2개 파일로 분리 |
| **장점** | 설치가 매우 간단하다. (파일 1개) | **보안성이 매우 높다.** |
| **단점** | **깃허브에 올리면 API 키가 유출된다.** | 설치가 조금 더 복잡하다. (파일 2개) |
| **추천** | **나만 쓸 거고**, 깃허브에 절대<br>코드를 올릴 일이 없는 분 | 이 코드를 **깃허브에 올리고 싶은 분**<br>또는 보안을 중요하게 생각하는 분 |

---

### 방법 1: 👑 가장 간편한 방법 (파일 하나로 끝내기)

이 방법은 여러분의 `geminiApi.js` 파일 하나에 봇의 '설계도(코드)'와 '비밀 열쇠(API 키)'를 모두 넣는 방식입니다. 설치가 매우 간단하지만, **보안에 치명적일 수 있습니다.**

> **🚨🚨 강력한 경고 🚨🚨**
> 이 방법으로 설치한 `geminiApi.js` 파일은 **절대로! 절대로! 깃허브에 올리거나 다른 사람에게 전송하면 안 됩니다.**
> 파일 안에 여러분의 '비밀 열쇠(API 키)'가 그대로 적혀있기 때문에, 유출되는 순간 나쁜 사람들이 여러분의 키를 훔쳐갈 수 있습니다.

#### [방법 1] 설치 순서

1.  여러분의 메신저봇 스크립트 폴더에 있는 `geminiApi.js` 파일을 엽니다. (없으면 새로 만드세요)
2.  아래의 **[방법 1 전체 코드]**를 전부 복사해서 `geminiApi.js` 파일의 **기존 내용을 덮어쓰세요.**
3.  파일을 열어, 코드 맨 위쪽에 있는 `const apiKey = "YOUR_GEMINI_API_KEY_HERE";` 부분을 찾으세요.
4.  `"YOUR_GEMINI_API_KEY_HERE"` 이 부분을 **지우고**, [1단계]에서 발급받은 **여러분의 실제 API 키** (`AIzaSy...`로 시작하는 키)를 그 따옴표 안에 **정확히** 붙여넣습니다.
5.  파일을 저장합니다.
6.  메신저봇R 앱에서 '스크립트 리로드' 또는 봇을 껐다 켭니다.
7.  채팅방에서 "호걸아 안녕"이라고 테스트해봅니다.

#### ▼ [방법 1 전체 코드] (이걸 복사해서 `geminiApi.js`에 붙여넣으세요)

```javascript
// 봇의 파일 이름은 geminiApi.js 이지만, 코드 내의 이름은 JapchoCompanyHogeolAI 입니다.
const scriptName = "JapchoCompanyHogeolAI";
const scriptVersion = 1.1;
const scriptDescription = "잡초컴퍼니의 호걸 AI 챗봇 (사용자 인식 기능 추가)";

// ============================================
// 설정 (!!! 중요 !!!)
// ============================================
// 🚨🚨 여기에 여러분의 API 키를 직접 입력하세요! 🚨🚨
// 이 파일은 절대 외부에 유출하거나 깃허브에 올리면 안 됩니다!
const apiKey = "YOUR_GEMINI_API_KEY_HERE";

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
  // API 키가 입력되었는지 확인
  if (apiKey === "YOUR_GEMINI_API_KEY_HERE" || apiKey.trim() === "") {
    if (msg.startsWith("호걸아")) {
        replier.reply("[오류] 호걸 AI가 설정되지 않았습니다.\n스크립트 파일에서 'apiKey'를 직접 입력해주세요.");
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
      "[https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=](https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=)" + apiKey
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
````

-----

### 방법 2: 🛡️ 가장 안전한 방법 (파일 분리 - 깃허브 추천)

이 방법은 봇의 '설계도(코드)'가 담긴 `geminiApi.js` 파일과, '비밀 열쇠(API 키)'가 담긴 `config.js` 파일로 나누어 저장하는 방식입니다.

**이 방법의 존재 이유:**
이 코드를 **깃허브에 올려서 다른 사람들에게 공유**하고 싶을 때, '설계도(`geminiApi.js`)'만 올리고 '비밀 열쇠(`config.js`)'는 나만 보관할 수 있습니다. 메신저봇 R의 `FileStream` 기능이 내 폰에만 있는 `config.js` 파일을 몰래 읽어서 키를 사용하기 때문에 안전합니다.

#### [방법 2] 설치 순서

1.  여러분의 메신저봇 스크립트 폴더에 있는 `geminiApi.js` 파일을 엽니다. (없으면 새로 만드세요)
2.  아래의 \*\*[방법 2 메인 코드]\*\*를 전부 복사해서 `geminiApi.js` 파일의 **기존 내용을 덮어쓰세요.** (이 파일엔 키를 넣지 않습니다\!)
3.  **`geminiApi.js`와 같은 폴더에**, `config.js` 라는 이름으로 **새 파일**을 만듭니다. (이미 있다면 4번으로)
4.  방금 만든 `config.js` 파일을 텍스트 편집기로 엽니다.
5.  [1단계]에서 발급받은 **여러분의 실제 API 키** (`AIzaSy...`로 시작하는 키)를 `config.js` 파일 안에 **그대로 붙여넣습니다.**
      * **\!\! 초중요 \!\!**: 이 파일 안에는 **오직 API 키 문자열만** 있어야 합니다. 따옴표(`"`)나 `apiKey =` 같은 말을 절대 쓰면 안 됩니다\!
        ```
        (❌ 잘못된 예)
        apiKey = "AIzaSy...xyz123"
        ```
        ```
        (⭕ 올바른 예 - config.js 파일 내용)
        AIzaSy...xyz123
        ```
6.  파일 2개(`geminiApi.js`, `config.js`)를 모두 저장합니다.
7.  (선택 사항: 깃허브에 올릴 분만) 같은 폴더에 `.gitignore` 파일을 만들고, 그 안에 `config.js` 라고 한 줄 적어 저장합니다.
8.  메신저봇R 앱에서 '스크립트 리로드' 또는 봇을 껐다 켭니다.
9.  채팅방에서 "호걸아 안녕"이라고 테스트해봅니다.

#### ▼ [방법 2 메인 코드] (이걸 복사해서 `geminiApi.js`에 붙여넣으세요)

```javascript
// 봇의 파일 이름은 geminiApi.js 이지만, 코드 내의 이름은 JapchoCompanyHogeolAI 입니다.
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

const apiKey = loadApiKey(); // config.js에서 키를 읽어옵니다.

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
      "[https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=](https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=)" + apiKey
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
```

#### ▼ [방법 2 깃허브용 파일] `.gitignore` (이것도 같이 올려주세요)

이 파일을 깃허브에 올릴 폴더에 `geminiApi.js`와 함께 넣어두세요.
이 파일은 깃(Git) 프로그램에게 "야, `config.js` 파일은 비밀 파일이니까 절대 올리지 마\!"라고 알려주는 중요한 **보안 스티커**입니다.

```
# .gitignore

# 민감한 설정 파일(API 키)은 Git 추적에서 제외합니다.
config.js

# 로그 파일 (필요시)
# *.log

# 기타 로컬 설정 파일
# .idea/
# .vscode/
```

-----

## 💬 챗봇 사용 방법 (명령어)

호걸이 봇은 사용법이 아주 간단합니다.

### `호걸아 [여기에 하고 싶은 말]`

호걸이에게 말을 걸고 싶을 때 사용합니다. `호걸아`로 시작해야만 봇이 알아듣고 대답해줍니다.

  * **예시 1 (질문)**: `호걸아 오늘 저녁 메뉴 추천해줘`
  * **예시 2 (대화)**: `호걸아 너는 꿈이 뭐야?`
  * **예시 3 (요청)**: `호걸아 '사랑'으로 짧은 시 하나만 써줘`

### `호걸아 안녕`

호걸이에게 인사를 하는 특별한 명령어입니다.
이 명령어에는 AI가 답변하지 않고, "안녕하세요\! 저는 잡초컴퍼니의 잡초, 호걸입니다."라는 정해진 인사말만 하도록 설정되어 있습니다. (봇이 살아있는지 테스트하기 좋아요\!)

### `.호걸이초기화`

호걸이의 '기억'을 깨끗하게 지우는 명령어입니다.
호걸이 봇은 대화의 문맥을 파악하기 위해 이전 대화 내용을 기억하고 있습니다. 만약 호걸이가 대화 중에 헷갈려 하거나, 엉뚱한 말을 하거나, 완전히 새로운 주제로 대화를 시작하고 싶을 때 이 명령어를 사용하세요.

-----

## 🤔 자주 묻는 질문 (FAQ) / 문제 해결

**Q. "호걸아"라고 불렀는데 봇이 아무 대답도 안 해요\!**
**A.** 몇 가지 확인해볼 것이 있습니다.

1.  **API 키 확인**:
      * **(방법 1)**: `geminiApi.js` 파일 상단의 `const apiKey = "..."` 부분에 키를 따옴표 안에 정확히 넣으셨나요?
      * **(방법 2)**: `config.js` 파일에 API 키 외에 다른 글자(따옴표, 공백 등)가 들어가진 않았나요?
2.  **스크립트 리로드**: 봇을 껐다 켜거나 '스크립트 리로드'를 하셨나요?
3.  **파일 위치 (방법 2)**: `geminiApi.js` 파일과 `config.js` 파일이 **정확히 같은 폴더**에 있나요?
4.  **오류 로그 확인**: 메신저봇R 앱의 '로그' 화면에 혹시 빨간색으로 오류 메시지가 뜨지 않았는지 확인해보세요.

**Q. "[오류] 호걸 AI가 설정되지 않았습니다. (API 키 오류)" 라고 떠요.**
**A.** \*\*(방법 2)\*\*를 사용 중일 때 나타나는 오류입니다. `config.js` 파일이 없거나, 파일 안이 비어있거나, 파일을 읽지 못했다는 뜻입니다. [방법 2]의 설치 순서 3\~5번 항목을 다시 꼼꼼히 확인해주세요.

**Q. "[오류] 스크립트 파일에서 'apiKey'를 직접 입력해주세요." 라고 떠요.**
**A.** \*\*(방법 1)\*\*을 사용 중일 때 나타나는 오류입니다. `geminiApi.js` 파일 상단의 `const apiKey = "YOUR_GEMINI_API_KEY_HERE";` 부분을 수정하지 않으셨다는 뜻입니다. [방법 1]의 설치 순서 4번 항목을 확인해주세요.

**Q. "[오류] API 오류 발생: ..." 라고 떠요.**
**A.** Google API 키 자체에 문제가 있을 수 있습니다.

1.  API 키가 잘못 복사되었을 수 있습니다. [1단계]로 돌아가 키를 다시 복사해서 붙여넣어 보세요.
2.  (드문 경우) Google AI Studio에서 여러분의 계정이 일시적으로 차단되었거나, API 키가 비활성화되었을 수 있습니다.

**Q. 깃허브(GitHub)에 제 코드를 올리고 싶은데, 어떻게 하죠?**
**A.** **반드시 [방법 2]를 사용하셔야 합니다\!**

1.  여러분의 깃허브 저장소(Repository)에 이 프로젝트 폴더를 올리시면 됩니다.
2.  이때, 폴더 안에는 `geminiApi.js` (설계도)와 `.gitignore` (보안 스티커) 파일이 있어야 합니다.
3.  `.gitignore` 파일이 "야, `config.js` 파일은 비밀 파일이니까 절대 올리지 마\!"라고 깃(Git) 프로그램에 알려줄 겁니다.
4.  **결과**: `geminiApi.js`와 `README.md`, `.gitignore` 파일은 깃허브에 올라가서 다른 사람들과 공유되고, 여러분의 소중한 API 키가 담긴 `config.js` 파일은 여러분의 폰에만 안전하게 보관됩니다. (성공\!)

-----

이 안내서가 여러분의 멋진 챗봇 생활에 도움이 되기를 바랍니다\!
즐겁게 '호걸'이와 대화해보세요\!

```
```
