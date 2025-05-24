// storage.js - ローカルストレージ読み書きユーティリティ（共通）
export const STORAGE_KEYS = {
  members: "rw_members",
  tasks: "rw_tasks",
  initialized: "rw_initialized",
};

/**
 * メンバー一覧をローカルストレージから読み込む
 * @returns {Array}
 */
export function loadMembers() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.members);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("メンバーデータの読み込みに失敗:", e);
    return [];
  }
}

/**
 * メンバー一覧をローカルストレージへ保存する
 * @param {Array} members
 */
export function saveMembers(members) {
  try {
    localStorage.setItem(STORAGE_KEYS.members, JSON.stringify(members));
  } catch (e) {
    console.error("メンバーデータの保存に失敗:", e);
  }
}

/**
 * タスク一覧をローカルストレージから読み込む
 * @returns {Array}
 */
export function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.tasks);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("タスクデータの読み込みに失敗:", e);
    return [];
  }
}

/**
 * タスク一覧をローカルストレージへ保存する
 * @param {Array} tasks
 */
export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  } catch (e) {
    console.error("タスクデータの保存に失敗:", e);
  }
}

/**
 * 初期化済みかどうかを確認する
 * @returns {boolean}
 */
export function isInitialized() {
  return localStorage.getItem(STORAGE_KEYS.initialized) === "true";
}

/**
 * 初期化完了をマークする
 */
export function markAsInitialized() {
  localStorage.setItem(STORAGE_KEYS.initialized, "true");
}
