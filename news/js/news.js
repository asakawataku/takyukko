document.addEventListener("DOMContentLoaded", () => {
  const newsList = document.getElementById("newsList");
  const pagination = document.getElementById("newsPagination");

  if (!newsList || !pagination) return;

  const newsItems = [...newsList.querySelectorAll(".news-row")];
  const dateGroups = [...newsList.querySelectorAll(".news-date-group")];

  const itemsPerPage = 30;
  const totalPages = Math.ceil(newsItems.length / itemsPerPage);

  let currentPage = 1;

  function updateDateGroups() {
    dateGroups.forEach(group => {
      const visible = [...group.querySelectorAll(".news-row")]
        .some(item => !item.hidden);

      group.hidden = !visible;
    });
  }

  function createButton(label, page, current = false, disabled = false) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;
    button.className = "news-pagination__button";

    if (current) {
      button.classList.add("is-current");
      button.setAttribute("aria-current", "page");
    }

    button.disabled = disabled;

    button.addEventListener("click", () => {
      showPage(page);
    });

    return button;
  }

  function renderPagination() {

    pagination.innerHTML = "";

    if (totalPages <= 1) {
      pagination.hidden = true;
      return;
    }

    pagination.hidden = false;

    pagination.appendChild(
      createButton("PREV", currentPage - 1, false, currentPage === 1)
    );

    for (let i = 1; i <= totalPages; i++) {
      pagination.appendChild(
        createButton(
          String(i).padStart(2, "0"),
          i,
          i === currentPage,
          false
        )
      );
    }

    pagination.appendChild(
      createButton(
        "NEXT",
        currentPage + 1,
        false,
        currentPage === totalPages
      )
    );
  }

  function showPage(page) {

    currentPage = Math.max(
      1,
      Math.min(page, totalPages)
    );

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    newsItems.forEach((item, index) => {
      item.hidden = !(index >= start && index < end);
    });

    updateDateGroups();
    renderPagination();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  showPage(1);
});