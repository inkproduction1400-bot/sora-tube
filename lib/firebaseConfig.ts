// lib/firebaseConfig.ts
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ★ Firebase コンソールの設定値（そのままでOK）
const firebaseConfig = {
  apiKey: "AIzaSyD4X9x4qgTAN1CmdwgiPQWo5HvytXwmShk",
  authDomain: "soratube-d46e7.firebaseapp.com",
  projectId: "soratube-d46e7",
  storageBucket: "soratube-d46e7.firebasestorage.app", // ← Storageは今回は未使用
  appId: "1:7590121361:web:6f75606aa02f4678e09430",
  measurementId: "G-3E8P16TDEX",
};

// ★ Hot-Reload 時の多重初期化を防ぐ
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Export: Firestore / Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * 匿名ログインを保証して UID を返す（クライアント専用）
 * - 既にログイン済みならそのUIDを即返却
 * - 未ログインなら signInAnonymously → onAuthStateChanged で待機
 */
export async function ensureAuth(): Promise<string> {
  // SSR側で呼ばれると困るので、念のためブラウザチェック
  if (typeof window === "undefined") {
    throw new Error("ensureAuth() must be called on client side");
  }

  // 既にログイン済みなら即返す
  if (auth.currentUser?.uid) return auth.currentUser.uid;

  // 未ログインなら匿名でサインイン
  await signInAnonymously(auth);

  // サインイン完了を待って UID を返す
  return new Promise((resolve) => {
    const unSub = onAuthStateChanged(auth, (u) => {
      if (u?.uid) {
        unSub();
        resolve(u.uid);
      }
    });
  });
}
