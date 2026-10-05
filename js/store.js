// 신청서 저장소: Firebase Firestore(설정 시) 또는 localStorage
(function () {
  const cfg = window.APP_CONFIG;
  const LS_KEY = "labReservations.v1";
  const COLLECTION = "reservations";

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("스크립트를 불러오지 못했습니다: " + src));
      document.head.appendChild(s);
    });
  }

  const localBackend = {
    name: "local",
    _read() {
      try {
        return JSON.parse(localStorage.getItem(LS_KEY)) || [];
      } catch (e) {
        return [];
      }
    },
    _write(list) {
      localStorage.setItem(LS_KEY, JSON.stringify(list));
    },
    async list() {
      return this._read();
    },
    async add(item) {
      const list = this._read();
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      const record = { ...item, id };
      list.push(record);
      this._write(list);
      return record;
    },
    async update(id, fields) {
      const list = this._read();
      const idx = list.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error("신청서를 찾을 수 없습니다.");
      list[idx] = { ...list[idx], ...fields };
      this._write(list);
      return list[idx];
    },
    async remove(id) {
      this._write(this._read().filter((r) => r.id !== id));
    },
  };

  function firebaseBackend(db) {
    const col = db.collection(COLLECTION);
    return {
      name: "firebase",
      async list() {
        const snap = await col.get();
        return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      },
      async add(item) {
        const ref = await col.add(item);
        return { ...item, id: ref.id };
      },
      async update(id, fields) {
        await col.doc(id).update(fields);
        return { id, ...fields };
      },
      async remove(id) {
        await col.doc(id).delete();
      },
    };
  }

  let backendPromise = null;
  function getBackend() {
    if (backendPromise) return backendPromise;
    backendPromise = (async () => {
      if (!cfg.firebase) return localBackend;
      const base = "https://www.gstatic.com/firebasejs/10.12.2/";
      await loadScript(base + "firebase-app-compat.js");
      await loadScript(base + "firebase-firestore-compat.js");
      firebase.initializeApp(cfg.firebase);
      return firebaseBackend(firebase.firestore());
    })();
    return backendPromise;
  }

  window.Store = {
    async backendName() {
      return (await getBackend()).name;
    },
    async list() {
      const items = await (await getBackend()).list();
      return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
    async add(item) {
      return (await getBackend()).add(item);
    },
    async update(id, fields) {
      return (await getBackend()).update(id, fields);
    },
    async remove(id) {
      return (await getBackend()).remove(id);
    },
  };

  // 공통 유틸
  window.Util = {
    escape(str) {
      return String(str ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
      }[c]));
    },
    today() {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    },
    statusClass(status) {
      return { "신청": "st-applied", "확인보류": "st-hold", "승인": "st-approved" }[status] || "";
    },
    badge(status) {
      return `<span class="badge ${this.statusClass(status)}">${this.escape(status)}</span>`;
    },
    sortPeriods(periods) {
      const order = window.APP_CONFIG.periods;
      return [...periods].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    },
    formatDateTime(iso) {
      if (!iso) return "";
      const d = new Date(iso);
      return d.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
    },
  };

  // 저장소 안내 배너
  document.addEventListener("DOMContentLoaded", async () => {
    const el = document.getElementById("storage-note");
    if (!el) return;
    try {
      if ((await window.Store.backendName()) === "local") {
        el.textContent =
          "현재 테스트 모드입니다. 신청 내용이 이 브라우저에만 저장되어 다른 기기에서는 보이지 않습니다.";
        el.hidden = false;
      }
    } catch (e) {
      el.textContent = "저장소 연결에 실패했습니다: " + e.message;
      el.hidden = false;
    }
  });
})();
