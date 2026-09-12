document.addEventListener("DOMContentLoaded", function () {
  const reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const wipe = document.createElement("div");
  wipe.className = "tt-page-transition";
  wipe.setAttribute("aria-hidden", "true");
  document.body.appendChild(wipe);

  // 遷移先では、グラデーションをそのまま右へ素早く抜く
  if (!reduce && sessionStorage.getItem("tt-transition") === "1") {
    sessionStorage.removeItem("tt-transition");
    wipe.classList.add("is-out");

    window.setTimeout(function () {
      wipe.className = "tt-page-transition";
    }, 360);
  }

  document.addEventListener("click", function (e) {
    const a = e.target.closest(".news-row__link");
    if (!a || reduce) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const href = a.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;

    e.preventDefault();
    if (wipe.classList.contains("is-in")) return;

    wipe.classList.add("is-in");
    sessionStorage.setItem("tt-transition", "1");

    // 前版よりかなり速く次ページへ
    window.setTimeout(function () {
      location.href = url.href;
    }, 285);
  });
});
