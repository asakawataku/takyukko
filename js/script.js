
const hamburger=document.getElementById("hamburger");
const menu=document.getElementById("fullscreenMenu");
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

const slides=document.querySelectorAll(".slide");
const dots=document.querySelectorAll(".dot");
const hero=document.querySelector(".hero");

let current=0;

function showSlide(i){
 slides.forEach(s=>s.classList.remove("active"));
 dots.forEach(d=>d.classList.remove("active"));

 slides[i].classList.add("active");
 dots[i].classList.add("active");
 current=i;
}

function nextSlide(){
 let next=(current+1)%slides.length;
 showSlide(next);
}

function prevSlide(){
 let prev=(current-1+slides.length)%slides.length;
 showSlide(prev);
}

setInterval(()=>{
 nextSlide();
},5000);

dots.forEach((dot,i)=>{
 dot.addEventListener("click",()=>{
  showSlide(i);
 });
});

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

const movieMoreBtn = document.getElementById("movieMoreBtn");
const movieSliderArea = document.getElementById("movieSliderArea");
const movies = [
    {
      title: "卓キチvs.じんたく 世界一のサーブ",
      url: "https://www.youtube.com/watch?v=ViSLNF2pRU0"
    },
    {
      title: "おすすめ動画",
      url: "https://www.youtube.com/watch?v=SuEVVsaPgVA"
    },
    {
      title: "動画３",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    {
        title: "動画３",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    {
        title: "動画３",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
    
  ];
  
  const movieSlider = document.getElementById("movieSlider");
  
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
  
  
  function getVideoId(url){
  
      if(url.includes("youtu.be")){
          return url.split("/").pop();
      }
  
      const params = new URL(url).searchParams;
  
      return params.get("v");
  
  }

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