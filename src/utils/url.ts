/**
 * 🔗 URL 參數處理工具
 */

/**
 * 從網址字串中提取提示詞參數 ?p=
 */
export function extractPromptFromUrl(urlString: string): string | null {
    if (!urlString) return null;
    try {
        const url = new URL(urlString);
        let p = url.searchParams.get("p");
        if (p && p.trim()) return p.trim();

        // 檢查 Hash 參數 (例如 #/?p= 或 #gem/.../?p=)
        if (url.hash && url.hash.includes("?")) {
            const hashQuery = url.hash.split("?")[1];
            const hashParams = new URLSearchParams(hashQuery);
            p = hashParams.get("p");
            if (p && p.trim()) return p.trim();
        }
        return null;
    } catch {
        const match = urlString.match(/[?&]p=([^&#]+)/);
        if (match && match[1]) {
            try {
                return decodeURIComponent(match[1].replace(/\+/g, " ")).trim();
            } catch {
                return match[1].trim();
            }
        }
        return null;
    }
}

/**
 * 移除網址中的 p 參數，防止重新整理或歷史記錄導航時重複觸發
 */
export function removePromptFromUrl(urlString: string): string {
    if (!urlString) return urlString;
    try {
        const url = new URL(urlString);
        if (!url.searchParams.has("p")) {
            return urlString;
        }
        url.searchParams.delete("p");
        return url.toString();
    } catch {
        return urlString.replace(/([?&])p=[^&#]*(&|$)/, (m, p1, p2) => (p2 ? p1 : "")).replace(/[?&]$/, "");
    }
}
