// 과학실 사용 신청 시스템 설정
window.APP_CONFIG = {
  schoolName: "안산동산고등학교",

  labs: ["화학실험실", "생명과학실험실", "물리실험실", "지구과학실험실"],

  periods: [
    "1교시", "2교시", "3교시", "4교시", "점심시간",
    "5교시", "6교시", "7교시", "8교시", "야자시간1", "야자시간2",
  ],

  statuses: ["신청", "확인보류", "승인"],

  // 담당자 페이지 비밀번호.
  // 주의: 정적 사이트이므로 이 값은 누구나 소스에서 볼 수 있습니다.
  // 실제 운영 시에는 Firebase Authentication 등으로 교체하세요.
  adminPassword: "dongsan2026",

  // Firebase 설정 (선택).
  // 비워 두면 이 브라우저의 localStorage에만 저장되어 다른 기기와 공유되지 않습니다.
  // 여러 사람이 함께 쓰려면 Firebase 콘솔에서 Firestore를 만들고 웹 앱 설정값을 넣으세요.
  firebase: const firebaseConfig = {
    apiKey: "AIzaSyDfgaj6fjy99AJvpSwGMzkmNl5WHl05HOQ",
    authDomain: "dchs-sciencelab.firebaseapp.com",
    databaseURL: "https://dchs-sciencelab-default-rtdb.firebaseio.com",
    projectId: "dchs-sciencelab",
    storageBucket: "dchs-sciencelab.firebasestorage.app",
    messagingSenderId: "771418796868",
    appId: "1:771418796868:web:31f857a6f14645ece39d11"
  },
};
