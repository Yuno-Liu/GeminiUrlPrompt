import test from "node:test";
import assert from "node:assert/strict";
import { extractPromptFromUrl, removePromptFromUrl } from "../dist-test/utils/url.js";
import { INPUT_SELECTORS, SEND_BUTTON_SELECTORS } from "../dist-test/utils/constants.js";

test("URL Parser - extractPromptFromUrl", async (t) => {
    await t.test("應正確解析標準 Gemini URL 中的 p 參數", () => {
        const url = "https://gemini.google.com/app?p=台積電2330展望";
        assert.equal(extractPromptFromUrl(url), "台積電2330展望");
    });

    await t.test("應正確解析自訂 Gem (如 gem/b80064003cba) 的 p 參數", () => {
        const url = "https://gemini.google.com/gem/b80064003cba?p=請分析聯發科2454近期營收";
        assert.equal(extractPromptFromUrl(url), "請分析聯發科2454近期營收");
    });

    await t.test("應正確解碼 URL Encode 之參數 (含有空格與特殊符號)", () => {
        const url = "https://gemini.google.com/gem/b80064003cba?p=2330%20%E5%8F%B0%E7%A9%8D%E9%9B%BB%20PE%26PB";
        assert.equal(extractPromptFromUrl(url), "2330 台積電 PE&PB");
    });

    await t.test("應支援 Hash 網址帶有之 ?p= 參數", () => {
        const url = "https://gemini.google.com/gem/b80064003cba#chat?p=測試提問";
        assert.equal(extractPromptFromUrl(url), "測試提問");
    });

    await t.test("當缺少 p 參數或為空字串時應回傳 null", () => {
        assert.equal(extractPromptFromUrl("https://gemini.google.com/app"), null);
        assert.equal(extractPromptFromUrl("https://gemini.google.com/gem/b80064003cba"), null);
        assert.equal(extractPromptFromUrl("https://gemini.google.com/app?p="), null);
        assert.equal(extractPromptFromUrl("https://gemini.google.com/app?p=   "), null);
    });
});

test("URL Parser - removePromptFromUrl", async (t) => {
    await t.test("應從 URL 乾淨移除 p 參數", () => {
        const url = "https://gemini.google.com/gem/b80064003cba?p=2330&mode=fast";
        const cleaned = removePromptFromUrl(url);
        assert.equal(cleaned.includes("p=2330"), false);
        assert.equal(cleaned.includes("mode=fast"), true);
    });

    await t.test("單一 p 參數時移除後不殘留問號", () => {
        const url = "https://gemini.google.com/gem/b80064003cba?p=2330";
        const cleaned = removePromptFromUrl(url);
        assert.equal(cleaned, "https://gemini.google.com/gem/b80064003cba");
    });
});

test("Constants - Selector Validation", async (t) => {
    await t.test("輸入框選擇器應包含 rich-textarea 與 contenteditable 容錯候選", () => {
        assert.ok(INPUT_SELECTORS.length >= 5);
        assert.ok(INPUT_SELECTORS.some((s) => s.includes("rich-textarea")));
        assert.ok(INPUT_SELECTORS.some((s) => s.includes("contenteditable")));
    });

    await t.test("送出按鈕選擇器應包含中英文 aria-label 與類名候選", () => {
        assert.ok(SEND_BUTTON_SELECTORS.length >= 5);
        assert.ok(SEND_BUTTON_SELECTORS.some((s) => s.includes("Send")));
        assert.ok(SEND_BUTTON_SELECTORS.some((s) => s.includes("送出")));
        assert.ok(SEND_BUTTON_SELECTORS.some((s) => s.includes("發送")));
    });
});
