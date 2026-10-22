/**
 * 📍 Gemini DOM 選擇器與設定常數
 */

export const INPUT_SELECTORS = [
    // Standard rich-textarea contenteditable
    'rich-textarea [contenteditable="true"]',
    'rich-textarea .ql-editor',
    'rich-textarea p',
    'rich-textarea div[role="textbox"]',
    // Fallback general selectors
    '[contenteditable="true"][role="textbox"]',
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
    // Standard aria-label in English and Traditional/Simplified Chinese
    'button[aria-label*="Send"]',
    'button[aria-label*="送出"]',
    'button[aria-label*="發送"]',
    'button[aria-label*="发送"]',
    'button[aria-label*="prompt" i]',
    // Specific class names
    'button.send-button',
    'div.send-button button',
    // Component wrappers
    'send-button button',
    'input-area-v2 button.send-button',
    'input-area button.send-button',
    'gem-icon-button button',
    // XPath fallbacks
    '//button[contains(@aria-label, "Send") or contains(@aria-label, "送出") or contains(@aria-label, "發送") or contains(@aria-label, "发送")]',
    '//div[contains(@class, "send-button")]//button',
    '//button[contains(@class, "send-button")]',
    '//gem-icon-button//button'
];

export const DEFAULT_TIMEOUT = 25000;
export const DEFAULT_INTERVAL = 300;
export const SEND_DELAY = 500;
