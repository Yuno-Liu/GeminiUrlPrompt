/**
 * 🚀 Gemini URL Prompt Content Script
 */

import { INPUT_SELECTORS, SEND_BUTTON_SELECTORS, DEFAULT_TIMEOUT } from "./utils/constants";
import { extractPromptFromUrl, removePromptFromUrl } from "./utils/url";
import { waitForElement, waitForEnabledSendButton, injectPrompt, submitPrompt } from "./utils/dom";

let lastProcessedPrompt: string | null = null;
let isProcessing = false;

async function checkAndExecute(): Promise<void> {
    if (isProcessing) return;

    const prompt = extractPromptFromUrl(window.location.href);
    if (!prompt || prompt === lastProcessedPrompt) {
        return;
    }

    isProcessing = true;
    console.log("[GeminiUrlPrompt] 偵測到提示詞參數:", prompt);

    try {
        // 1. 等待輸入框出現 (最多等待 DEFAULT_TIMEOUT 毫秒)
        const inputElement = (await waitForElement(INPUT_SELECTORS, DEFAULT_TIMEOUT)) as HTMLElement;
        console.log("[GeminiUrlPrompt] 成功定位輸入框:", inputElement);

        // 2. 注入提示詞並觸發框架資料響應
        const injected = await injectPrompt(inputElement, prompt);
        if (!injected) {
            console.error("[GeminiUrlPrompt] 注入提示詞失敗，放棄送出");
            return;
        }

        // 3. 輪詢等待送出按鈕啟用 (最長 6 秒，讓框架將語音/麥克風圖示切換為送出箭頭並解除 disabled)
        console.log("[GeminiUrlPrompt] 等待送出按鈕啟用...");
        const sendButton = await waitForEnabledSendButton(SEND_BUTTON_SELECTORS, 6000, 150);

        // 4. 執行送出
        const submitted = await submitPrompt(sendButton, inputElement);
        if (submitted) {
            console.log("[GeminiUrlPrompt] 提示詞送出完成！");
            lastProcessedPrompt = prompt;
        }

        // 5. 清除網址列中的 ?p= 參數，防止重新整理網頁時重複送出
        const cleanUrl = removePromptFromUrl(window.location.href);
        if (cleanUrl !== window.location.href) {
            window.history.replaceState({}, document.title, cleanUrl);
        }
    } catch (err) {
        console.error("[GeminiUrlPrompt] 執行自動填入失敗:", err);
    } finally {
        isProcessing = false;
    }
}

// 頁面初次載入
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => checkAndExecute());
} else {
    checkAndExecute();
}

// 監聽 SPA 路由與歷史記錄變化
window.addEventListener("popstate", () => checkAndExecute());

// 輪詢監聽 URL 變更（支援 Gemini 內部 SPA 導航）
let currentUrl = window.location.href;
setInterval(() => {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        checkAndExecute();
    }
}, 800);
