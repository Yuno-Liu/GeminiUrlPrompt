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
 * 輪詢等待送出按鈕出現且處於啟用狀態 (非 disabled 且 aria-disabled !== "true")
 */
export async function waitForEnabledSendButton(
    candidates: string[],
    timeout: number = 6000,
    interval: number = 150
): Promise<HTMLButtonElement | null> {
    const startTime = Date.now();
    let foundDisabledButton: HTMLButtonElement | null = null;

    while (Date.now() - startTime < timeout) {
        for (const selector of candidates) {
            const el = querySelectorOrXPath(selector) as HTMLButtonElement | null;
            if (el) {
                const isDisabled = el.disabled || el.getAttribute("aria-disabled") === "true";
                if (!isDisabled) {
                    return el;
                }
                foundDisabledButton = el;
            }
        }
        await new Promise((r) => setTimeout(r, interval));
    }

    return foundDisabledButton;
}

/**
 * 將提示詞寫入輸入元素並透過 execCommand 與事件鏈通知框架更新狀態
 */
export async function injectPrompt(inputElement: HTMLElement, prompt: string): Promise<boolean> {
    try {
        const editor = (inputElement.closest('[contenteditable="true"]') || inputElement) as HTMLElement;
        editor.focus();

        // 1. 嘗試透過 document.execCommand('insertText') 原生編輯器指令寫入
        // 這是 Quill / Angular / Contenteditable 最能感知內容變更並觸發送出按鈕轉換的方式
        let inserted = false;
        try {
            const selection = window.getSelection();
            if (selection) {
                const range = document.createRange();
                range.selectNodeContents(editor);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            inserted = document.execCommand("insertText", false, prompt);
        } catch {
            inserted = false;
        }

        // 2. 若 execCommand 失敗或未寫入文字，降級為 DOM 結構注入
        if (!inserted || !editor.textContent || editor.textContent.trim().length === 0) {
            console.log("[GeminiUrlPrompt] execCommand 未能成功寫入，使用 DOM 結構注入");
            editor.innerHTML = "";
            const lines = prompt.split("\n");
            for (const line of lines) {
                const p = document.createElement("p");
                p.textContent = line || "\u200B";
                editor.appendChild(p);
            }
        }

        // 3. 游標移動到最後以模擬真實輸入
        try {
            const selection = window.getSelection();
            if (selection) {
                const range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        } catch {}

        // 4. 派發完整的輸入與變更事件，確保 Angular / Lit / Quill 偵測到值變化
        editor.dispatchEvent(
            new InputEvent("input", {
                bubbles: true,
                cancelable: true,
                inputType: "insertText",
                data: prompt,
            })
        );
        editor.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
        editor.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

        const parentRich = editor.closest("rich-textarea");
        if (parentRich) {
            parentRich.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
            parentRich.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
        }

        return true;
    } catch (e) {
        console.error("[GeminiUrlPrompt] 寫入提示詞失敗:", e);
        return false;
    }
}

/**
 * 完整模擬點擊事件鏈 (相容 Angular / PointerEvent / MouseEvent)
 */
export function triggerClick(element: HTMLElement): void {
    element.focus();
    element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    element.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true }));
    element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
    element.click();
}

/**
 * 完整模擬 Enter 鍵鍵盤事件 (送出備援)
 */
export function triggerEnter(element: HTMLElement): void {
    element.focus();
    const eventOptions: KeyboardEventInit = {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
        composed: true,
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
        metaKey: false,
    };
    element.dispatchEvent(new KeyboardEvent("keydown", eventOptions));
    element.dispatchEvent(new KeyboardEvent("keypress", eventOptions));
    element.dispatchEvent(new KeyboardEvent("keyup", eventOptions));
}

/**
 * 送出提示詞（優先點擊啟用按鈕，失敗則執行 Enter 備援）
 */
export async function submitPrompt(sendButton: HTMLElement | null, inputElement: HTMLElement): Promise<boolean> {
    const editor = (inputElement.closest('[contenteditable="true"]') || inputElement) as HTMLElement;

    if (sendButton) {
        console.log("[GeminiUrlPrompt] 找到送出按鈕，準備觸發點擊:", sendButton);
        // 短暫等待 200ms 確保 Angular 內部狀態穩定
        await new Promise((r) => setTimeout(r, 200));
        triggerClick(sendButton);

        // 等待 500ms 檢查輸入框是否已被清空 (代表送出成功)
        await new Promise((r) => setTimeout(r, 500));
        const stillHasText = (editor.textContent || "").trim().length > 0;
        if (!stillHasText) {
            console.log("[GeminiUrlPrompt] 偵測到輸入框已清空，送出成功！");
            return true;
        }

        console.log("[GeminiUrlPrompt] 點擊後輸入框尚未清空，執行 Enter 鍵備援送出...");
    } else {
        console.log("[GeminiUrlPrompt] 未找到送出按鈕，直接執行 Enter 鍵備援送出...");
    }

    // 備援方案：在 contenteditable 編輯器上派發 Enter 鍵
    triggerEnter(editor);
    await new Promise((r) => setTimeout(r, 300));
    return true;
}
