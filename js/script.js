
const hamburger=document.getElementById("hamburger");
const menu=document.getElementById("fullscreenMenu");

if(hamburger && menu){
 hamburger.addEventListener("click",()=>{
  hamburger.classList.toggle("active");
  menu.classList.toggle("active");
 });

 document.querySelectorAll(".fullscreen-menu a").forEach(link=>{
  link.addEventListener("click",()=>{
   hamburger.classList.remove("active");
   menu.classList.remove("active");
  });
 });
}

const slides=document.querySelectorAll(".slide");
const dots=document.querySelectorAll(".dot");
const hero=document.querySelector(".hero");

if(hero && slides.length && dots.length){

 let current=0;

 const showSlide=(i)=>{
  slides.forEach(s=>s.classList.remove("active"));
  dots.forEach(d=>d.classList.remove("active"));

  slides[i].classList.add("active");
  dots[i].classList.add("active");
  current=i;
 };

 const nextSlide=()=>{
  let next=(current+1)%slides.length;
  showSlide(next);
 };

 const prevSlide=()=>{
  let prev=(current-1+slides.length)%slides.length;
  showSlide(prev);
 };

 setInterval(()=>{
  nextSlide();
 },5000);

 dots.forEach((dot,i)=>{
  dot.addEventListener("click",()=>{
   showSlide(i);
  });
 });

 /* スワイプ操作 */

 let startX=0;
 let endX=0;

 hero.addEventListener("touchstart",(e)=>{
  startX=e.touches[0].clientX;
 });

 hero.addEventListener("touchend",(e)=>{
  endX=e.changedTouches[0].clientX;

  const diff=startX-endX;

  if(diff>50){
   nextSlide();
  }

  if(diff<-50){
   prevSlide();
  }
 });
}

/* フェイドアップjs */

const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            entry.target.classList.add("show");
        }
    });
});

document.querySelectorAll("section h2").forEach(title=>{
    title.classList.add("fade-up");
    observer.observe(title);
});

/* 動画スライダー(トップページのみ) */

const movieMoreBtn = document.getElementById("movieMoreBtn");
const movieSliderArea = document.getElementById("movieSliderArea");
const movieSlider = document.getElementById("movieSlider");

if(movieMoreBtn && movieSliderArea && movieSlider){

  const movies = [
      {
        title: "卓キチvs.じんたく 世界一のサーブ",
        url: "https://www.youtube.com/watch?v=ViSLNF2pRU0"
      },
      {
        title: "WTTスターコンテンダーサン・ジョゼ・ドス・カンポス2026混合ダブルス<br/>【決勝】戸上隼輔/大藤沙月 vs カルデラノ/B.タカハシ",
        url: "https://www.youtube.com/watch?v=1ol7vgOSVoE"
      },
      {
        title: "全日本マスターズ王者！松平vs飯野<br/>健太敗北か？",
        url: "https://www.youtube.com/watch?v=G9EZGCgJuj0&t=10s"
      },
      {
          title: "わった×TIBHER山内コーチ　一撃必殺の男のサーブが一撃必殺すぎる件。",
          url: "https://www.youtube.com/watch?v=etPifxdMZDg"
      },
      {
          title: "ぜロから始める！モンスターYGサーブ",
          url: "https://www.youtube.com/watch?v=rYRVlJoPyWE"
      },
      {
        title: "【オフショット】吉村真晴の背面サーブを真似するルブランお兄ちゃん｜チャイナスマッシュ2024",
        url: "https://www.youtube.com/watch?v=T0XWsXz0BWs"
    },
    {
      title: "卓キチ　全国上位の超ゴリドラ選手が強すぎた",
      url: "https://www.youtube.com/watch?v=hg9VMWG-7rM"
  }

    ];

    const getVideoId=(url)=>{

        if(url.includes("youtu.be")){
            return url.split("/").pop();
        }

        const params = new URL(url).searchParams;

        return params.get("v");

    };

    movies.forEach(movie => {

        const videoId = getVideoId(movie.url);

        movieSlider.innerHTML += `
            <a href="${movie.url}"
               target="_blank"
               rel="noopener noreferrer"
               class="movie-slide">

                <div class="movie-slide-image">

                    <img
                        src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg"
                        alt="${movie.title}">

                    <span class="movie-play">▶</span>

                </div>

                <h3>${movie.title}</h3>

            </a>
        `;

    });

    movieMoreBtn.addEventListener("click", () => {
      movieSliderArea.classList.toggle("active");

      if (movieSliderArea.classList.contains("active")) {
        movieMoreBtn.textContent = "CLOSE";

        setTimeout(() => {
          movieSliderArea.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
          });
        }, 300);

      } else {
        movieMoreBtn.textContent = "MORE VIEW";
      }

    });
}

document.addEventListener("DOMContentLoaded", () => {
  const newsSection = document.querySelector(".news");
  const flyingBall = document.querySelector(".flying-ball");

  if (!newsSection || !flyingBall) return;

  let hasPlayed = false;

  const flyObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || hasPlayed) return;

        hasPlayed = true;
        flyingBall.classList.add("is-flying");
        flyObserver.unobserve(newsSection);
      });
    },
    {
      threshold: 0.25
    }
  );

  flyObserver.observe(newsSection);
});
