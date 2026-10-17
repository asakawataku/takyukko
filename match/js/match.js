document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("matchList");
  const empty = document.getElementById("matchEmpty");
  const tabs = [...document.querySelectorAll(".match-tab[data-filter]")];
  const jumpButtons = [...document.querySelectorAll("[data-jump-filter]")];
  const archiveSwitch = document.getElementById("matchArchiveSwitch");
  const archiveSwitchLabel = document.getElementById("matchArchiveSwitchLabel");

  if (!list) return;

  const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  let currentFilter = "all";
  let currentView = "upcoming";
  let allMatches = [];

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

  const getTodayKey = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
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

  const matchesFilter = (match, filter) => {
    if (filter === "all") return true;

    if (["chiba", "tokyo", "other"].includes(filter)) {
      return match.area === filter;
    }

    if (["official", "large", "p4match", "i2u"].includes(filter)) {
      return (match.kind || "regular") === filter;
    }

    return false;
  };

  const getMatchesForCurrentView = () => {
    const today = getTodayKey();

    const target = allMatches.filter(match => {
      if (!match?.date) return false;
      return currentView === "archive"
        ? match.date < today
        : match.date >= today;
    });

    target.sort((a, b) => {
      const dateCompare = currentView === "archive"
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date);

      if (dateCompare !== 0) return dateCompare;

      return Number(a.priority || 999) - Number(b.priority || 999);
    });

    return target;
  };

  const updateTabs = () => {
    tabs.forEach(tab => {
      const active = tab.dataset.filter === currentFilter;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
  };

  const updateArchiveSwitch = () => {
    if (!archiveSwitch) return;

    const archiveMode = currentView === "archive";
    archiveSwitch.classList.toggle("is-archive", archiveMode);
    archiveSwitch.setAttribute("aria-pressed", String(archiveMode));

    if (archiveSwitchLabel) {
      archiveSwitchLabel.textContent = archiveMode
        ? "開催予定の大会に戻る"
        : "過去の大会はコチラ";
    }
  };

  const render = () => {
    const viewMatches = getMatchesForCurrentView()
      .filter(match => matchesFilter(match, currentFilter));

    list.innerHTML = viewMatches.map(renderCard).join("");

    if (empty) {
      empty.textContent = currentView === "archive"
        ? "該当する過去大会はまだありません。"
        : "該当する大会情報はまだありません。";
      empty.hidden = viewMatches.length !== 0;
    }

    updateTabs();
    updateArchiveSwitch();
  };

  try {
    const response = await fetch("data/matches.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`matches.json: HTTP ${response.status}`);

    allMatches = await response.json();

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        currentFilter = tab.dataset.filter;
        render();
      });
    });

    jumpButtons.forEach(button => {
      button.addEventListener("click", () => {
        currentFilter = button.dataset.jumpFilter;
        currentView = "upcoming";
        render();

        document.getElementById("match-list-title")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });

    archiveSwitch?.addEventListener("click", () => {
      currentView = currentView === "archive" ? "upcoming" : "archive";
      render();
    });

    render();
  } catch (error) {
    console.error(error);
    list.innerHTML = `
      <p class="match-empty">
        大会情報を読み込めませんでした。Firebase Hosting上でご確認ください。
      </p>
    `;
  }
});
