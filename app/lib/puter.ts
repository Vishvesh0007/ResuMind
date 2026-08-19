import { create } from "zustand";

declare global {
    interface Window {
        puter: {
            auth: {
                getUser: () => Promise<PuterUser>;
                isSignedIn: () => Promise<boolean>;
                signIn: () => Promise<void>;
                signOut: () => Promise<void>;
            };
            fs: {
                write: (
                    path: string,
                    data: string | File | Blob
                ) => Promise<File | undefined>;
                read: (path: string) => Promise<Blob>;
                upload: (file: File[] | Blob[]) => Promise<FSItem>;
                delete: (path: string) => Promise<void>;
                del?: (path: string) => Promise<void>;
                readdir: (path: string) => Promise<FSItem[] | undefined>;
            };
            ai: {
                chat: (
                    prompt: string | ChatMessage[],
                    imageURL?: string | PuterChatOptions,
                    testMode?: boolean,
                    options?: PuterChatOptions
                ) => Promise<Object>;
                img2txt: (
                    image: string | File | Blob,
                    testMode?: boolean
                ) => Promise<string>;
            };
            kv: {
                get: (key: string) => Promise<string | null>;
                set: (key: string, value: string) => Promise<boolean>;
                delete?: (key: string) => Promise<boolean>;
                del?: (key: string) => Promise<boolean>;
                list: (pattern: string, returnValues?: boolean) => Promise<string[]>;
                flush: () => Promise<boolean>;
            };
        };
    }
}

interface PuterStore {
    isLoading: boolean;
    error: string | null;
    puterReady: boolean;
    auth: {
        user: PuterUser | null;
        isAuthenticated: boolean;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
        refreshUser: () => Promise<void>;
        checkAuthStatus: () => Promise<boolean>;
        getUser: () => PuterUser | null;
    };
    fs: {
        write: (
            path: string,
            data: string | File | Blob
        ) => Promise<File | undefined>;
        read: (path: string) => Promise<Blob | undefined>;
        upload: (file: File[] | Blob[]) => Promise<FSItem | undefined>;
        delete: (path: string) => Promise<void>;
        readDir: (path: string) => Promise<FSItem[] | undefined>;
    };
    ai: {
        chat: (
            prompt: string | ChatMessage[],
            imageURL?: string | PuterChatOptions,
            testMode?: boolean,
            options?: PuterChatOptions
        ) => Promise<AIResponse | undefined>;
        feedback: (
            path: string,
            message: string,
            extractedText?: string
        ) => Promise<AIResponse | undefined>;
        img2txt: (
            image: string | File | Blob,
            testMode?: boolean
        ) => Promise<string | undefined>;
    };
    kv: {
        get: (key: string) => Promise<string | null | undefined>;
        set: (key: string, value: string) => Promise<boolean | undefined>;
        delete: (key: string) => Promise<boolean | undefined>;
        list: (
            pattern: string,
            returnValues?: boolean
        ) => Promise<string[] | KVItem[] | undefined>;
        flush: () => Promise<boolean | undefined>;
    };
    admin: {
        getUsers: () => Promise<AdminUserRecord[]>;
    };

    init: () => void;
    clearError: () => void;
}

const getPuter = (): typeof window.puter | null =>
    typeof window !== "undefined" && window.puter ? window.puter : null;

export const usePuterStore = create<PuterStore>((set, get) => {
    const setError = (msg: string) => {
        set({
            error: msg,
            isLoading: false,
            auth: {
                user: null,
                isAuthenticated: false,
                signIn: get().auth.signIn,
                signOut: get().auth.signOut,
                refreshUser: get().auth.refreshUser,
                checkAuthStatus: get().auth.checkAuthStatus,
                getUser: get().auth.getUser,
            },
        });
    };

    const trackUserActivity = async (user: PuterUser) => {
        const puter = getPuter();
        if (!puter || !user || !user.uuid) return;
        try {
            const userKey = `admin:user:${user.uuid}`;
            const existingDataStr = await puter.kv.get(userKey);
            let existingData: any = null;
            if (existingDataStr) {
                try { existingData = JSON.parse(existingDataStr); } catch (e) {}
            }
            const updatedData: AdminUserRecord = {
                uuid: user.uuid,
                username: user.username || "Anonymous User",
                lastSeen: new Date().toISOString(),
                loginCount: (existingData?.loginCount || 0) + (existingData ? 0 : 1),
                firstSeen: existingData?.firstSeen || new Date().toISOString(),
            };
            await puter.kv.set(userKey, JSON.stringify(updatedData));
        } catch (e) {
            console.warn("Failed to record admin user activity:", e);
        }
    };

    const getAdminUsers = async (): Promise<AdminUserRecord[]> => {
        const puter = getPuter();
        if (!puter) return [];
        try {
            const keys = await puter.kv.list("admin:user:*");
            if (!keys || !Array.isArray(keys)) return [];
            const users: AdminUserRecord[] = [];
            for (const key of keys) {
                const keyStr = typeof key === "string" ? key : (key as any).key;
                if (keyStr) {
                    const val = await puter.kv.get(keyStr);
                    if (val) {
                        try {
                            users.push(JSON.parse(val));
                        } catch (e) {}
                    }
                }
            }
            return users.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
        } catch (e) {
            console.warn("Failed to get admin users:", e);
            return [];
        }
    };

    const checkAuthStatus = async (): Promise<boolean> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return false;
        }

        set({ isLoading: true, error: null });

        try {
            const isSignedIn = await puter.auth.isSignedIn();
            if (isSignedIn) {
                const user = await puter.auth.getUser();
                trackUserActivity(user);
                set({
                    auth: {
                        user,
                        isAuthenticated: true,
                        signIn: get().auth.signIn,
                        signOut: get().auth.signOut,
                        refreshUser: get().auth.refreshUser,
                        checkAuthStatus: get().auth.checkAuthStatus,
                        getUser: () => user,
                    },
                    isLoading: false,
                });
                return true;
            } else {
                set({
                    auth: {
                        user: null,
                        isAuthenticated: false,
                        signIn: get().auth.signIn,
                        signOut: get().auth.signOut,
                        refreshUser: get().auth.refreshUser,
                        checkAuthStatus: get().auth.checkAuthStatus,
                        getUser: () => null,
                    },
                    isLoading: false,
                });
                return false;
            }
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : "Failed to check auth status";
            setError(msg);
            return false;
        }
    };

    const signIn = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        set({ isLoading: true, error: null });

        try {
            await puter.auth.signIn();
            await checkAuthStatus();
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Sign in failed";
            setError(msg);
        }
    };

    const signOut = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        set({ isLoading: true, error: null });

        try {
            await puter.auth.signOut();
            set({
                auth: {
                    user: null,
                    isAuthenticated: false,
                    signIn: get().auth.signIn,
                    signOut: get().auth.signOut,
                    refreshUser: get().auth.refreshUser,
                    checkAuthStatus: get().auth.checkAuthStatus,
                    getUser: () => null,
                },
                isLoading: false,
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Sign out failed";
            setError(msg);
        }
    };

    const refreshUser = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const user = await puter.auth.getUser();
            set({
                auth: {
                    user,
                    isAuthenticated: true,
                    signIn: get().auth.signIn,
                    signOut: get().auth.signOut,
                    refreshUser: get().auth.refreshUser,
                    checkAuthStatus: get().auth.checkAuthStatus,
                    getUser: () => user,
                },
                isLoading: false,
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to refresh user";
            setError(msg);
        }
    };

    const init = (): void => {
        const puter = getPuter();
        if (puter) {
            set({ puterReady: true });
            checkAuthStatus();
            return;
        }

        const interval = setInterval(() => {
            if (getPuter()) {
                clearInterval(interval);
                set({ puterReady: true });
                checkAuthStatus();
            }
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            if (!getPuter()) {
                setError("Puter.js failed to load within 10 seconds");
            }
        }, 10000);
    };

    const write = async (path: string, data: string | File | Blob) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.fs.write(path, data);
    };

    const readDir = async (path: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.fs.readdir(path);
    };

    const readFile = async (path: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.fs.read(path);
    };

    const upload = async (files: File[] | Blob[]) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.fs.upload(files);
    };

    const deleteFile = async (path: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        const fs = puter.fs as any;
        if (typeof fs.del === "function") {
            return fs.del(path);
        }
        if (typeof fs.delete === "function") {
            return fs.delete(path);
        }
    };

    const chat = async (
        prompt: string | ChatMessage[],
        imageURL?: string | PuterChatOptions,
        testMode?: boolean,
        options?: PuterChatOptions
    ) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        // return puter.ai.chat(prompt, imageURL, testMode, options);
        return puter.ai.chat(prompt, imageURL, testMode, options) as Promise<
            AIResponse | undefined
        >;
    };

    const feedback = async (path: string, message: string, extractedText?: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        const promptContent: any[] = [];

        if (extractedText && extractedText.trim()) {
            promptContent.push({
                type: "text",
                text: `--- RESUME TEXT ---\n${extractedText.trim()}\n--- END RESUME TEXT ---\n\n${message}`,
            });
        } else {
            if (path) {
                promptContent.push({
                    type: "file",
                    puter_path: path,
                });
            }
            promptContent.push({
                type: "text",
                text: message,
            });
        }

        const maxRetries = 2;
        let lastError: any = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const callPromise = puter.ai.chat(
                    [
                        {
                            role: "user",
                            content: promptContent,
                        },
                    ],
                    { model: "claude-sonnet-4" }
                );

                const timeoutGuard = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error("AI service request timed out after 45 seconds.")), 45000);
                });

                const result = (await Promise.race([callPromise, timeoutGuard])) as AIResponse;
                if (!result || !result.message) {
                    throw new Error("Empty response received from AI service.");
                }
                return result;
            } catch (err: any) {
                lastError = err;
                console.warn(`Puter AI feedback attempt ${attempt + 1} failed:`, err);
                if (attempt < maxRetries) {
                    await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
                }
            }
        }

        throw new Error(lastError?.message || "AI analysis failed after retries.");
    };

    const img2txt = async (image: string | File | Blob, testMode?: boolean) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.ai.img2txt(image, testMode);
    };

    const getKV = async (key: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.kv.get(key);
    };

    const setKV = async (key: string, value: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.kv.set(key, value);
    };

    const deleteKV = async (key: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        const kv = puter.kv as any;
        if (typeof kv.del === "function") {
            return kv.del(key);
        }
        if (typeof kv.delete === "function") {
            return kv.delete(key);
        }
        return kv.set(key, "");
    };

    const listKV = async (pattern: string, returnValues?: boolean) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        if (returnValues === undefined) {
            returnValues = false;
        }
        return puter.kv.list(pattern, returnValues);
    };

    const flushKV = async () => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.kv.flush();
    };

    return {
        isLoading: true,
        error: null,
        puterReady: false,
        auth: {
            user: null,
            isAuthenticated: false,
            signIn,
            signOut,
            refreshUser,
            checkAuthStatus,
            getUser: () => get().auth.user,
        },
        fs: {
            write: (path: string, data: string | File | Blob) => write(path, data),
            read: (path: string) => readFile(path),
            readDir: (path: string) => readDir(path),
            upload: (files: File[] | Blob[]) => upload(files),
            delete: (path: string) => deleteFile(path),
        },
        ai: {
            chat: (
                prompt: string | ChatMessage[],
                imageURL?: string | PuterChatOptions,
                testMode?: boolean,
                options?: PuterChatOptions
            ) => chat(prompt, imageURL, testMode, options),
            feedback: (path: string, message: string, extractedText?: string) =>
                feedback(path, message, extractedText),
            img2txt: (image: string | File | Blob, testMode?: boolean) =>
                img2txt(image, testMode),
        },
        kv: {
            get: (key: string) => getKV(key),
            set: (key: string, value: string) => setKV(key, value),
            delete: (key: string) => deleteKV(key),
            list: (pattern: string, returnValues?: boolean) =>
                listKV(pattern, returnValues),
            flush: () => flushKV(),
        },
        admin: {
            getUsers: () => getAdminUsers(),
        },
        init,
        clearError: () => set({ error: null }),
    };
});

/**
 * Utility function to robustly clean markdown fences and parse JSON from AI outputs.
 */
export function cleanAndParseJson<T = any>(rawText: string): T {
    if (!rawText || typeof rawText !== "string") {
        throw new Error("Empty or invalid AI response text.");
    }

    let cleaned = rawText.trim();
    // Remove ```json ... ``` or ``` ... ```
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

    // Find starting { and ending }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    try {
        return JSON.parse(cleaned) as T;
    } catch (err: any) {
        throw new Error(`Failed to parse JSON response: ${err?.message || err}`);
    }
}