# 🤖 Gemini URL Prompt (GeminiUrlPrompt)

[![GitHub License](https://img.shields.io/github/license/Yuno-Liu/GeminiUrlPrompt)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Google Gemini](https://img.shields.io/badge/Target-Google%20Gemini-8E75C2?logo=google&logoColor=white)](https://gemini.google.com/)

自動讀取網址參數 `?p=` 並自動填入送出至 [Google Gemini](https://gemini.google.com/) 對話框的 Chrome 擴充功能（TypeScript 版）。

---

## ✨ 核心特色

- ✍️ **自動擷取提示詞**：由 URL 參數 `?p=...` 自動解碼並提取欲詢問的提示詞。
- 🔗 **專為 SPA 打造的 XPath 定位**：針對 Google Gemini (Angular SPA) 動態 DOM 進行精確定位。
- ⏳ **強健的非同步輪詢機制**：內建 `waitForXPath()` 機制，確保 DOM 元素非同步載入渲染完成後才進行填入。
- 🚀 **自動送出**：模擬原生 `InputEvent` 與按鈕點擊，精準觸發 Angular 雙向資料綁定並自動發送問題。
- 🌐 **跨工具整合**：可與任何第三方網頁、書籤小工具（Bookmarklet）、股票分析工具（如富果整合器 Fugle Integrator）無縫連動。

---

## 🚀 安裝說明

### 載入未封裝項目（開發者模式）

1. 複製專案並安裝依賴：
   ```bash
   git clone https://github.com/Yuno-Liu/GeminiUrlPrompt.git
   cd GeminiUrlPrompt
   npm install
   npm run build
   ```
2. 編譯完成後，擴充套件檔案輸出於 `dist/` 資料夾。
3. 開啟 Chrome 瀏覽器，網址列輸入 `chrome://extensions/`。
4. 開啟右上角的「**開發人員模式**」。
5. 點擊「**載入未封裝項目**」，選取本專案的 `dist/` 資料夾。

---

## 💡 使用範例與 URL 參數格式

在瀏覽器網址列輸入帶有 `?p=` 參數的 Gemini 網址：

```text
https://gemini.google.com/app?p=請分析台積電近期營運展望
```

或者搭配特定專屬 Gem (自訂 AI 助手)：

```text
https://gemini.google.com/gem/[chatId]?p=2330%20台積電
```

擴充套件會在頁面載入完成後自動：
1. 解析 `p` 參數並進行 URL Decode。
2. 尋找輸入對話框並填入文字。
3. 自動點擊發送按鈕。

---

## 🛠️ 開發與建置指令

```bash
# 安裝相依套件
npm install

# 單次建置 (產出 dist/)
npm run build

# 開發監聽模式 (檔案變更時自動重新打包)
npm run watch

# TypeScript 型別檢查
npm run typecheck

# 清除建置產物
npm run clean
```

---

## 📂 專案結構

```
GeminiUrlPrompt/
├── src/
│   ├── content.ts          # Content script 主入口點
│   └── utils/
│       ├── constants.ts    # 常數與 XPath 定義
│       └── xpath.ts        # XPath 非同步等待與工具函式
├── dist/                   # 編譯輸出（Chrome 載入此目錄）
│   ├── content.js
│   └── manifest.json
├── manifest.json           # 根目錄 Manifest 開發定義
├── manifest.dist.json      # 發布用 Manifest 範本
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

---

## 🔬 技術實現細節

### 1. 動態 DOM 輪詢 (`waitForXPath`)
由於 Gemini 是基於 Angular 的單頁應用 (SPA)，輸入框為延遲非同步渲染。本工具採用指數或定時間隔輪詢：
```typescript
const element = await waitForXPath(xpath, timeout);
```

### 2. Angular 雙向綁定感知 (`InputEvent`)
若僅修改 `.textContent` 或 `.value`，Angular 元件狀態可能無法感知資料變更。擴充功能主動派發 `InputEvent`：
```typescript
inputElement.dispatchEvent(
    new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        inputType: "insertText",
        data: message,
    })
);
```

---

## 📜 授權協議 (License)

本專案採用 [MIT License](LICENSE) 授權。

