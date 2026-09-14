document.addEventListener("DOMContentLoaded", async () => {
  const DATA_URL = "/feature/data/articles.json?v=20260914";
  const ITEMS_PER_PAGE = 12;

  const articleGrid = document.querySelector("#articleGrid");
  const pagination = document.querySelector("#pagination");
  const searchInput = document.querySelector("#articleSearch");
  const clearSearch = document.querySelector("#clearSearch");
  const categoryFilter = document.querySelector("#categoryFilter");
  const yearFilter = document.querySelector("#yearFilter");
  const sortOrder = document.querySelector("#sortOrder");
  const tagFilters = document.querySelector("#tagFilters");
  const resetFilters = document.querySelector("#resetFilters");
  const emptyReset = document.querySelector("#emptyReset");
  const emptyMessage = document.querySelector("#emptyMessage");
  const resultCount = document.querySelector("#resultCount");
  const articleCount = document.querySelector("#articleCount");
  const categoryGuide = document.querySelector("#categoryGuide");

  let allArticles = [];
  let currentPage = 1;
  let activeTag = "all";

  const normalize = (value = "") =>
    value.toString().toLowerCase().normalize("NFKC");

  const escapeHtml = (value = "") =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const getStateFromUrl = () => {
    const params = new URLSearchParams(window.location.search);

    return {
      q: params.get("q") || "",
      category: params.get("category") || "all",
      year: params.get("year") || "all",
      tag: params.get("tag") || "all",
      sort: params.get("sort") || "newest",
      page: Math.max(1, Number(params.get("page")) || 1)
    };
  };

  const updateUrl = () => {
    const params = new URLSearchParams();

    if (searchInput.value.trim()) params.set("q", searchInput.value.trim());
    if (categoryFilter.value !== "all") params.set("category", categoryFilter.value);
    if (yearFilter.value !== "all") params.set("year", yearFilter.value);
    if (activeTag !== "all") params.set("tag", activeTag);
    if (sortOrder.value !== "newest") params.set("sort", sortOrder.value);
    if (currentPage > 1) params.set("page", currentPage);

    const query = params.toString();
    const nextUrl = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;

    window.history.replaceState(null, "", nextUrl);
  };

  const buildFilters = () => {
    const categories = [...new Set(allArticles.map(article => article.category))]
      .sort((a, b) => a.localeCompare(b, "ja"));

    const years = [...new Set(
      allArticles.map(article => article.date.slice(0, 4))
    )].sort((a, b) => b.localeCompare(a));

    const tags = [...new Set(
      allArticles.flatMap(article => article.tags || [])
    )].sort((a, b) => a.localeCompare(b, "ja"));

    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });

    years.forEach(year => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });

    const allButton = document.createElement("button");
    allButton.type = "button";
    allButton.className = "archive-tag-button is-active";
    allButton.dataset.tag = "all";
    allButton.textContent = "#すべて";
    tagFilters.appendChild(allButton);

    tags.forEach(tag => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "archive-tag-button";
      button.dataset.tag = tag;
      button.textContent = `#${tag}`;
      tagFilters.appendChild(button);
    });

    categories.forEach(category => {
      const count = allArticles.filter(
        article => article.category === category
      ).length;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "archive-guide-card";
      button.dataset.category = category;
      button.innerHTML = `
        <strong>${escapeHtml(category)}</strong>
        <span>${count} ARTICLES</span>
      `;

      categoryGuide.appendChild(button);
    });
  };

  const getFilteredArticles = () => {
    const keyword = normalize(searchInput.value.trim());
    const category = categoryFilter.value;
    const year = yearFilter.value;

    const filtered = allArticles.filter(article => {
      const searchableText = normalize([
        article.title,
        article.description,
        article.category,
        ...(article.tags || [])
      ].join(" "));

      const matchesKeyword = !keyword || searchableText.includes(keyword);
      const matchesCategory =
        category === "all" || article.category === category;
      const matchesYear =
        year === "all" || article.date.startsWith(year);
      const matchesTag =
        activeTag === "all" || (article.tags || []).includes(activeTag);

      return matchesKeyword && matchesCategory && matchesYear && matchesTag;
    });

    return filtered.sort((a, b) => {
      if (sortOrder.value === "oldest") {
        return a.date.localeCompare(b.date);
      }

      if (sortOrder.value === "title") {
        return a.title.localeCompare(b.title, "ja");
      }

      return b.date.localeCompare(a.date);
    });
  };

  const createArticleCard = article => {
    const tags = (article.tags || [])
      .slice(0, 4)
      .map(tag => `<span>#${escapeHtml(tag)}</span>`)
      .join("");

    return `
      <article class="archive-card">
        <a href="${escapeHtml(article.url)}">
          <div class="archive-card__image">
            <img
              src="${escapeHtml(article.image)}"
              alt="${escapeHtml(article.title)}"
              loading="lazy"
              width="800"
              height="600"
            >
            <span class="archive-card__category">
              ${escapeHtml(article.category)}
            </span>
          </div>

          <div class="archive-card__body">
            <time
              class="archive-card__date"
              datetime="${escapeHtml(article.date)}"
            >
              ${escapeHtml(article.date.replaceAll("-", "."))}
            </time>

            <h2>${escapeHtml(article.title)}</h2>

            <p class="archive-card__description">
              ${escapeHtml(article.description)}
            </p>

            <div class="archive-card__tags">
              ${tags}
            </div>
          </div>
        </a>
      </article>
    `;
  };

  const renderPagination = totalItems => {
    pagination.innerHTML = "";

    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    currentPage = Math.min(currentPage, totalPages);

    const createButton = (label, page, options = {}) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "archive-page-button";
      button.textContent = label;
      button.disabled = options.disabled || false;

      if (options.current) {
        button.classList.add("is-current");
        button.setAttribute("aria-current", "page");
      }

      button.addEventListener("click", () => {
        currentPage = page;
        render();
        window.scrollTo({
          top: document.querySelector(".archive-results").offsetTop - 80,
          behavior: "smooth"
        });
      });

      return button;
    };

    pagination.appendChild(
      createButton("‹", Math.max(1, currentPage - 1), {
        disabled: currentPage === 1
      })
    );

    const candidates = new Set([
      1,
      totalPages,
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2
    ]);

    const pages = [...candidates]
      .filter(page => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);

    let previousPage = 0;

    pages.forEach(page => {
      if (previousPage && page - previousPage > 1) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "…";
        ellipsis.setAttribute("aria-hidden", "true");
        pagination.appendChild(ellipsis);
      }

      pagination.appendChild(
        createButton(String(page), page, {
          current: page === currentPage
        })
      );

      previousPage = page;
    });

    pagination.appendChild(
      createButton("›", Math.min(totalPages, currentPage + 1), {
        disabled: currentPage === totalPages
      })
    );
  };

  const render = () => {
    const articles = getFilteredArticles();
    const totalPages = Math.max(1, Math.ceil(articles.length / ITEMS_PER_PAGE));

    currentPage = Math.min(currentPage, totalPages);

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const visibleArticles = articles.slice(start, start + ITEMS_PER_PAGE);

    articleGrid.innerHTML = visibleArticles
      .map(createArticleCard)
      .join("");

    resultCount.textContent = articles.length;
    emptyMessage.hidden = articles.length !== 0;
    articleGrid.hidden = articles.length === 0;
    pagination.hidden = articles.length === 0;

    renderPagination(articles.length);
    updateUrl();
  };

  const resetAll = () => {
    searchInput.value = "";
    categoryFilter.value = "all";
    yearFilter.value = "all";
    sortOrder.value = "newest";
    activeTag = "all";
    currentPage = 1;

    document.querySelectorAll(".archive-tag-button").forEach(button => {
      button.classList.toggle("is-active", button.dataset.tag === "all");
    });

    render();
  };

  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`記事データを取得できませんでした: ${response.status}`);
    }

    allArticles = await response.json();
    articleCount.textContent = allArticles.length;

    buildFilters();

    const state = getStateFromUrl();
    searchInput.value = state.q;
    categoryFilter.value = state.category;
    yearFilter.value = state.year;
    sortOrder.value = state.sort;
    activeTag = state.tag;
    currentPage = state.page;

    document.querySelectorAll(".archive-tag-button").forEach(button => {
      button.classList.toggle(
        "is-active",
        button.dataset.tag === activeTag
      );
    });

    render();
  } catch (error) {
    console.error(error);
    articleGrid.innerHTML = `
      <div class="archive-empty">
        <p>記事データを読み込めませんでした。</p>
        <p>Firebase上で開くか、ローカルサーバーを使用してください。</p>
      </div>
    `;
  }

  let searchTimer;

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
      currentPage = 1;
      render();
    }, 180);
  });

  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    currentPage = 1;
    render();
    searchInput.focus();
  });

  [categoryFilter, yearFilter, sortOrder].forEach(element => {
    element.addEventListener("change", () => {
      currentPage = 1;
      render();
    });
  });

  tagFilters.addEventListener("click", event => {
    const button = event.target.closest(".archive-tag-button");
    if (!button) return;

    activeTag = button.dataset.tag;
    currentPage = 1;

    document.querySelectorAll(".archive-tag-button").forEach(item => {
      item.classList.toggle("is-active", item === button);
    });

    render();
  });

  categoryGuide.addEventListener("click", event => {
    const button = event.target.closest(".archive-guide-card");
    if (!button) return;

    categoryFilter.value = button.dataset.category;
    currentPage = 1;
    render();

    window.scrollTo({
      top: document.querySelector(".archive-tools").offsetTop - 70,
      behavior: "smooth"
    });
  });

  resetFilters.addEventListener("click", resetAll);
  emptyReset.addEventListener("click", resetAll);
});
