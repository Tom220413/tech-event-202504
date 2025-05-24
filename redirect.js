// redirect.js - ポート3000から5500への自動リダイレクト（Windows環境のみ）
(function () {
  "use strict";

  // ページ読み込み完了後に実行
  document.addEventListener("DOMContentLoaded", function () {
    const currentUrl = window.location.href;
    const currentPort = window.location.port;

    // OS判定（Windowsかどうかを確認）
    const isWindows =
      navigator.platform.indexOf("Win") > -1 ||
      navigator.userAgent.indexOf("Windows") > -1;

    // Windows環境でポート3000の場合のみ、5500にリダイレクト
    if (isWindows && currentPort === "3000") {
      const newUrl = currentUrl.replace(":3000", ":5500");
      console.log(
        "Windows環境のため、ポート3000から5500にリダイレクトします:",
        newUrl
      );
      window.location.href = newUrl;
    } else if (currentPort === "3000") {
      console.log("Mac/Linux環境のため、リダイレクトを実行しません");
    }
  });
})();
