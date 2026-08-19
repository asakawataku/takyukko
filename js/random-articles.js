(() => {
  const grid = document.getElementById("randomArticleGrid");

  if (!grid) return;

  fetch("/feature/data/articles.json")
    .then(response => response.json())
    .then(articles => {

      // ランダムに並び替える
      const randomArticles = [...articles]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

      // HTMLを生成
      grid.innerHTML = randomArticles.map(article => `
        <article class="feature-item">

          <a href="${article.url}">

            <img
              src="${article.image}"
              alt="${article.title}"
              loading="lazy"
            >

            <p class="feature-category">
              ${article.category}
            </p>

            <h3>
              ${article.title}
            </h3>

          </a>

        </article>
      `).join("");

    })
    .catch(error => {
      console.error("記事データの読み込みに失敗しました:", error);
    });
})();