"use strict";

document.addEventListener("DOMContentLoaded", () => {

  // ========================================
  // 大会情報のエリア絞り込み
  // ========================================

  const matchTabs = document.querySelectorAll(".match-tab");
  const matchCards = document.querySelectorAll(".match-card");
  const jumpFilterButtons =
    document.querySelectorAll("[data-jump-filter]");

  const matchEmpty =
    document.getElementById("matchEmpty");

  const matchTabsArea =
    document.querySelector(".match-tabs");

  /**
   * 大会カードをエリアで絞り込む
   */
  function applyMatchFilter(filter = "all") {
    let visibleCount = 0;

    matchTabs.forEach(tab => {
      const isActive =
        tab.dataset.filter === filter;

      tab.classList.toggle(
        "is-active",
        isActive
      );

      tab.setAttribute(
        "aria-selected",
        String(isActive)
      );
    });

    matchCards.forEach(card => {
      const cardArea =
        card.dataset.area;

      const shouldShow =
        filter === "all" ||
        cardArea === filter;

      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleCount += 1;
      }
    });

    if (matchEmpty) {
      matchEmpty.hidden =
        visibleCount > 0;
    }
  }

  /**
   * 上部タブのクリック
   */
  matchTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const filter =
        tab.dataset.filter || "all";

      applyMatchFilter(filter);
    });
  });

  /**
   * 下部の「エリアから探す」ボタン
   */
  jumpFilterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter =
        button.dataset.jumpFilter || "all";

      applyMatchFilter(filter);

      if (matchTabsArea) {
        matchTabsArea.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });


  // ========================================
  // MATCHページ専用のスクロール表示
  // ========================================

  const revealItems =
    document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const matchRevealObserver =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add(
              "is-show"
            );

            matchRevealObserver.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: 0.12
        }
      );

    revealItems.forEach(item => {
      matchRevealObserver.observe(item);
    });

  } else {
    revealItems.forEach(item => {
      item.classList.add("is-show");
    });
  }


  // ========================================
  // ページトップボタン
  // ========================================

  const pageTop =
    document.getElementById("pageTop");

  if (pageTop) {
    function updatePageTopVisibility() {
      pageTop.classList.toggle(
        "is-visible",
        window.scrollY > 500
      );
    }

    window.addEventListener(
      "scroll",
      updatePageTopVisibility,
      { passive: true }
    );

    updatePageTopVisibility();

    pageTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

});