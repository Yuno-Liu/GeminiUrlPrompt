/**
 * 📍 Gemini DOM 選擇器與設定常數
 */

export const INPUT_SELECTORS = [
    // Standard rich-textarea contenteditable
    'rich-textarea .ql-editor[contenteditable="true"]',
    'rich-textarea [contenteditable="true"]',
    'rich-textarea .ql-editor',
    '.ql-editor[contenteditable="true"]',
    '[contenteditable="true"][role="textbox"]',
    'rich-textarea div[role="textbox"]',
    'rich-textarea p',
    'div[contenteditable="true"]',
    'input-area-v2 [contenteditable="true"]',
    'input-area [contenteditable="true"]',
    'chat-window [contenteditable="true"]',
    // XPath fallbacks
    '//rich-textarea//*[@contenteditable="true"]',
    '//rich-textarea//p',
    '//div[@contenteditable="true"]',
    '//div[@role="textbox"]'
];

export const SEND_BUTTON_SELECTORS = [
    // 繁體中文（台灣、香港常見標籤）
    'button[aria-label="傳送訊息"]',
    'button[aria-label*="傳送"]',
    'button[aria-label*="送出"]',
    'button[aria-label*="發送"]',
    // 簡體中文
    'button[aria-label="发送消息"]',
    'button[aria-label*="发送"]',
    // 英文
    'button[aria-label="Send message"]',
    'button[aria-label*="Send" i]',
    'button[aria-label*="Submit" i]',
    'button[aria-label*="prompt" i]',
    // 日文
    'button[aria-label="プロンプトを送信"]',
    'button[aria-label*="送信"]',
    // Test IDs & 特殊屬性
    'button[data-testid="send-button"]',
    'button[data-test-id="send-button"]',
    // 圖示或特定子元素
    'button:has(mat-icon[fonticon="send"])',
    'button:has(mat-icon[data-mat-icon-name="send"])',
    // Class-based
    'button.send-button',
    'div[class*="send-button-container"] button',
    'div.send-button button',
    '.send-button-container button',
    'send-button button',
    'input-area-v2 button.send-button',
    'input-area button.send-button',
    'gem-icon-button button',
    // XPath fallbacks
    '//button[contains(@aria-label, "傳送") or contains(@aria-label, "Send") or contains(@aria-label, "送出") or contains(@aria-label, "發送") or contains(@aria-label, "发送") or contains(@aria-label, "送信")]',
    '//div[contains(@class, "send-button")]//button',
    '//button[contains(@class, "send-button")]',
    '//gem-icon-button//button'
];

export const DEFAULT_TIMEOUT = 25000;
export const DEFAULT_INTERVAL = 300;
export const SEND_DELAY = 500;
