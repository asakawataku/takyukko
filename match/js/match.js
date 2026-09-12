document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("matchList");
  const empty = document.getElementById("matchEmpty");
  const tabs = [...document.querySelectorAll(".match-tab[data-filter]")];
  const jumpButtons = [...document.querySelectorAll("[data-jump-filter]")];

  if (!list) return;

  const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const formatDate = (dateString) => {
    const d = new Date(`${dateString}T00:00:00`);
    const [year, month, day] = dateString.split("-");
    return { year, md: `${month}.${day}`, day: DAY_NAMES[d.getDay()] };
  };

  const badge = (match) => {
    if (match.kind === "official")
      return '<span class="match-source-badge match-source-badge--official">OFFICIAL</span>';
    if (match.kind === "large")
      return '<span class="match-source-badge match-source-badge--large">LARGE</span>';
    if (match.kind === "p4match")
      return '<span class="match-source-badge match-source-badge--p4match">P4MATCH</span>';
    if (match.kind === "i2u")
      return '<span class="match-source-badge match-source-badge--i2u">i2U</span>';
    return "";
  };

  const renderCard = (match) => {
    const date = formatDate(match.date);
    const comment = match.editorComment?.trim()
      ? escapeHtml(match.editorComment)
      : "※ここに編集部おすすめコメントを追記";

    return `
      <article class="match-card"
               data-area="${escapeHtml(match.area)}"
               data-kind="${escapeHtml(match.kind || "regular")}"
               data-month="${escapeHtml(match.month)}">
        <time class="match-date" datetime="${escapeHtml(match.date)}">
          <span>${date.year}</span>
          <strong>${date.md}</strong>
          <b>${date.day}</b>
        </time>

        <div class="match-card__body">
          <p class="match-card__area">${escapeHtml(match.areaLabel)}</p>
          ${badge(match)}
          <h3>${escapeHtml(match.title)}</h3>

          <div class="match-card__meta">
            <span>⌖ ${escapeHtml(match.place)}</span>
            <span>♙ ${escapeHtml(match.type)}</span>
          </div>

          <div class="match-info">
            <p class="match-info__title">大会概要</p>
            <p>${escapeHtml(match.summary)}</p>

            <p class="match-info__title">参加資格</p>
            <p>${escapeHtml(match.eligibility || "掲載元でご確認ください")}</p>

            <p class="match-info__title">編集部コメント</p>
            <p>${comment}</p>

            <ul class="match-info__list">
              <li>申込締切：${escapeHtml(match.deadline)}</li>
            </ul>
          </div>

          <p class="match-card__host">情報元：${escapeHtml(match.source)}</p>
          <a class="match-card__link"
             href="${escapeHtml(match.url)}"
             rel="noopener noreferrer"
             target="_blank">
            最新情報・申込状況を確認 <span>→</span>
          </a>
        </div>

        <div class="match-card__photo">
          <img alt="${escapeHtml(match.place)}" src="${escapeHtml(match.image)}" loading="lazy">
        </div>
      </article>
    `;
  };

  try {
    const response = await fetch("data/matches.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`matches.json: HTTP ${response.status}`);

    const matches = await response.json();

    // 開催日順に並び替え。同日の場合は priority の小さい順。
    matches.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }

      return (a.priority ?? 999) - (b.priority ?? 999);
    });

    list.innerHTML = matches.map(renderCard).join("");

    const matchesFilter = (card, filter) => {
      if (filter === "all") return true;
      if (["chiba", "tokyo", "other"].includes(filter)) {
        return card.dataset.area === filter;
      }
      if (["official", "large", "p4match", "i2u"].includes(filter)) {
        return card.dataset.kind === filter;
      }
      return false;
    };

    const applyFilter = (filter) => {
      const cards = [...list.querySelectorAll(".match-card")];
      let visibleCount = 0;

      cards.forEach(card => {
        const show = matchesFilter(card, filter);
        card.hidden = !show;
        if (show) visibleCount++;
      });

      if (empty) empty.hidden = visibleCount !== 0;

      tabs.forEach(tab => {
        const active = tab.dataset.filter === filter;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
      });
    };

    tabs.forEach(tab =>
      tab.addEventListener("click", () => applyFilter(tab.dataset.filter))
    );

    jumpButtons.forEach(button => {
      button.addEventListener("click", () => {
        applyFilter(button.dataset.jumpFilter);
        document.getElementById("match-list-title")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });

    applyFilter("all");
  } catch (error) {
    console.error(error);
    list.innerHTML = `
      <p class="match-empty">
        大会情報を読み込めませんでした。Firebase Hosting上でご確認ください。
      </p>
    `;
  }
});
