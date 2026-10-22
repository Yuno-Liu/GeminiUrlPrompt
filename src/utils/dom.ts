/**
 * 🔍 DOM 查詢與元素操作工具
 */

/**
 * 查詢元素：支援 CSS 選擇器與 XPath 表達式
 */
export function querySelectorOrXPath(selector: string, root: Document | Element = document): Element | null {
    if (!selector) return null;
    if (selector.startsWith("//") || selector.startsWith("/html")) {
        try {
            const doc = (root as Element).ownerDocument || (root as Document);
            const result = doc.evaluate(selector, root, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue as Element | null;
        } catch {
            return null;
        }
    } else {
        try {
            return root.querySelector(selector);
        } catch {
            return null;
        }
    }
}

/**
 * 依序嘗試多組候選選擇器，找到第一個存在的元素
 */
export function findElementByCandidates(candidates: string[], root: Document | Element = document): Element | null {
    for (const selector of candidates) {
        const el = querySelectorOrXPath(selector, root);
        if (el) return el;
    }
    return null;
}

/**
 * 輪詢等待候選元素之一出現
 */
export function waitForElement(
    candidates: string[],
    timeout: number = 25000,
    interval: number = 300,
    root: Document | Element = document
): Promise<Element> {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const initial = findElementByCandidates(candidates, root);
        if (initial) {
            resolve(initial);
            return;
        }

        const timer = setInterval(() => {
            const el = findElementByCandidates(candidates, root);
            if (el) {
                clearInterval(timer);
                resolve(el);
                return;
            }
            if (Date.now() - startTime >= timeout) {
                clearInterval(timer);
                reject(new Error(`Timeout waiting for element matching: ${candidates.join(", ")}`));
            }
        }, interval);
    });
}

/**
 * 將提示詞寫入輸入元素並派發 input 事件
 */
export async function injectPrompt(inputElement: HTMLElement, prompt: string): Promise<boolean> {
    try {
        inputElement.focus();

        // 尋找內部實際寫入文字的節點 (通常是 p 或 contenteditable 本身)
        const targetNode = inputElement.querySelector("p") || inputElement.querySelector("div") || inputElement;
        targetNode.textContent = prompt;

        // 🔑 觸發 InputEvent 讓 Angular/Gemini 框架感知資料變更
        inputElement.dispatchEvent(
            new InputEvent("input", {
                bubbles: true,
                cancelable: true,
                // @ts-ignore
                inputType: "insertText",
                data: prompt,
            })
        );
        inputElement.dispatchEvent(new Event("input", { bubbles: true }));
        inputElement.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
    } catch (e) {
        console.error("[GeminiUrlPrompt] 寫入提示詞失敗:", e);
        return false;
    }
}

/**
 * 送出提示詞（點擊按鈕或派發 Enter 鍵）
 */
export async function submitPrompt(sendButton: Element | null, inputElement: HTMLElement, maxWaitMs: number = 3000): Promise<boolean> {
    const startTime = Date.now();

    // 若有找到送出按鈕，等待解除 disabled
    if (sendButton) {
        while (Date.now() - startTime < maxWaitMs) {
            const btn = sendButton as HTMLButtonElement;
            const isDisabled = btn.disabled || btn.getAttribute("aria-disabled") === "true";
            if (!isDisabled) {
                btn.click();
                return true;
            }
            await new Promise((r) => setTimeout(r, 150));
        }
        // 若按鈕逾時仍為 disabled，仍嘗試點擊一次
        (sendButton as HTMLElement).click();
    }

    // 備援方案：在輸入框派發 Enter 鍵鍵盤事件
    inputElement.dispatchEvent(
        new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            which: 13,
            bubbles: true,
        })
    );
    return true;
}
