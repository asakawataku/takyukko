document.addEventListener("DOMContentLoaded", () => {
  const performanceSection =
    document.querySelector(".performance-section");

  const gauges =
    document.querySelectorAll(".performance-gauge");

  /**
   * 0〜100の範囲に収める
   */
  function clampValue(value) {
    return Math.min(Math.max(Number(value) || 0, 0), 100);
  }

  /**
   * 円ゲージを初期化する
   */
  function initializeGauge(circle) {
    if (!circle) return;

    const radius =
      Number(circle.getAttribute("r"));

    const circumference =
      2 * Math.PI * radius;

    /*
      Safariでも安定するように、
      数値ではなく文字列で設定
    */
    circle.style.strokeDasharray =
      `${circumference} ${circumference}`;

    circle.style.strokeDashoffset =
      `${circumference}`;

    /*
      SVGの線が縮小されても太さを維持する
    */
    circle.setAttribute(
      "vector-effect",
      "non-scaling-stroke"
    );
  }

  /**
   * 円ゲージをアニメーションさせる
   */
  function setGauge(circle, value) {
    if (!circle) return;

    const safeValue =
      clampValue(value);

    const radius =
      Number(circle.getAttribute("r"));

    const circumference =
      2 * Math.PI * radius;

    const offset =
      circumference -
      (safeValue / 100) * circumference;

    /*
      Safariで初期状態を確定させるため、
      一度レイアウト情報を参照する
    */
    circle.getBoundingClientRect();

    /*
      2回に分けて描画することで、
      Safariでもtransitionを認識させる
    */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        circle.style.strokeDashoffset =
          `${offset}`;
      });
    });
  }

  /**
   * 数字を0からカウントアップする
   */
  function countUp(
    element,
    target,
    duration = 1400
  ) {
    if (!element) return;

    const safeTarget =
      clampValue(target);

    const startTime =
      window.performance.now();

    function update(currentTime) {
      const elapsed =
        currentTime - startTime;

      const progress =
        Math.min(elapsed / duration, 1);

      const eased =
        1 - Math.pow(1 - progress, 3);

      element.textContent =
        Math.round(safeTarget * eased);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent =
          String(safeTarget);
      }
    }

    requestAnimationFrame(update);
  }

  /**
   * 全ゲージを初期状態にする
   */
  function initializeGauges() {
    gauges.forEach((gauge) => {
      const zyreCircle =
        gauge.querySelector(
          ".gauge-ring-zyre"
        );

      const glayzerCircle =
        gauge.querySelector(
          ".gauge-ring-glayzer"
        );

      initializeGauge(zyreCircle);
      initializeGauge(glayzerCircle);
    });
  }

  /**
   * 全ゲージを順番に動かす
   */
  function animateGauges() {
    gauges.forEach((gauge, index) => {
      const zyreValue =
        clampValue(gauge.dataset.zyre);

      const glayzerValue =
        clampValue(gauge.dataset.glayzer);

      const zyreCircle =
        gauge.querySelector(
          ".gauge-ring-zyre"
        );

      const glayzerCircle =
        gauge.querySelector(
          ".gauge-ring-glayzer"
        );

      const zyreNumber =
        gauge.querySelector(
          ".value-zyre"
        );

      const glayzerNumber =
        gauge.querySelector(
          ".value-glayzer"
        );

      window.setTimeout(() => {
        setGauge(
          zyreCircle,
          zyreValue
        );

        setGauge(
          glayzerCircle,
          glayzerValue
        );

        countUp(
          zyreNumber,
          zyreValue
        );

        countUp(
          glayzerNumber,
          glayzerValue
        );
      }, index * 140);
    });
  }

  initializeGauges();

  /*
    IntersectionObserverが使える場合
  */
  if (
    performanceSection &&
    "IntersectionObserver" in window
  ) {
    const gaugeObserver =
      new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            animateGauges();

            observer.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: 0.2
        }
      );

    gaugeObserver.observe(
      performanceSection
    );

  /*
    古いSafariなどで使えない場合
  */
  } else if (performanceSection) {
    animateGauges();
  }
});