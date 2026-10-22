/**
 * 🚀 Gemini URL Prompt Content Script
 */

import { INPUT_SELECTORS, SEND_BUTTON_SELECTORS, DEFAULT_TIMEOUT } from "./utils/constants";
import { extractPromptFromUrl, removePromptFromUrl } from "./utils/url";
import { waitForElement, findElementByCandidates, injectPrompt, submitPrompt } from "./utils/dom";

let lastProcessedPrompt: string | null = null;
let isProcessing = false;

async function checkAndExecute(): Promise<void> {
    if (isProcessing) return;

    const prompt = extractPromptFromUrl(window.location.href);
    if (!prompt || prompt === lastProcessedPrompt) {
        return;
    }

    isProcessing = true;
    lastProcessedPrompt = prompt;
    console.log("[GeminiUrlPrompt] 偵測到提示詞參數:", prompt);

    try {
        // 等待輸入框出現 (最多等待 DEFAULT_TIMEOUT 毫秒)
        const inputElement = (await waitForElement(INPUT_SELECTORS, DEFAULT_TIMEOUT)) as HTMLElement;
        console.log("[GeminiUrlPrompt] 成功定位輸入框:", inputElement);

        const injected = await injectPrompt(inputElement, prompt);
        if (!injected) {
            isProcessing = false;
            return;
        }

        // 短暫等待讓框架更新送出按鈕狀態
        await new Promise((r) => setTimeout(r, 600));

        const sendButton = findElementByCandidates(SEND_BUTTON_SELECTORS);
        await submitPrompt(sendButton, inputElement);
        console.log("[GeminiUrlPrompt] 成功送出提示詞！");

        // 清除網址列中的 ?p= 參數，防止重新整理網頁時重複送出
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
