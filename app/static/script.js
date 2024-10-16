// contents_based

// DOM要素の取得
const searchBtn = document.getElementById("search-btn");
const refreshBtn = document.getElementById("refresh-btn");
const movieTitle = document.getElementById("movie-title");
const movieDescription = document.getElementById("movie-description");
const recommendationList = document.getElementById("recommendation-list");
const loader = document.getElementById("loader");
const contentsBasedBtn = document.getElementById("contents_based");
const menuArea = document.getElementById("menu_area");
const contentsBasedArea = document.getElementById("contents_based_area");

contentsBasedBtn.addEventListener("click", function () {
  contentsBasedArea.style.display = "";
  menuArea.style.display = "none";
});

// 検索ボタンのクリックイベント
searchBtn.addEventListener("click", () => {
  let movieName = null;
  let movieNameEscaped = document.querySelector(
    'input[name="choices"]:checked'
  );
  if (movieNameEscaped !== null) {
    movieNameEscaped = movieNameEscaped.value;
    movieName = movieNameEscaped.replaceAll("&nbsp;", " ");
  }

  // 映画タイトルが入力されていない場合
  if (!movieName) {
    // ローディング画面終了
    loader.style.display = "none";
    alert("Please enter a movie title!");
    return;
  }

  loader.style.display = "flex";
  // Flask APIにリクエストを送る
  fetch(`/recommend?title=${encodeURIComponent(movieName)}`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        alert("Movie not found!");
      } else {
        displayMovieDetails(movieName);
        displayRecommendations(data);
      }
      // ローディング画面終了
      loader.style.display = "none";
    })
    .catch((error) => {
      console.error("error");
      // ローディング画面終了
      loader.style.display = "none";
    });
});

refreshBtn.addEventListener("click", () => {
  window.location.reload();
});

// 映画の詳細情報を表示
function displayMovieDetails(title) {
  movieTitle.textContent = 'You chose "' + title + '"';
  movieDescription.textContent = `Recommended movies similar to ${title}:`;
}

// 推薦映画を表示
function displayRecommendations(recommendations) {
  recommendationList.innerHTML = ""; // 以前のリストをクリア

  recommendations.forEach((movie) => {
    const li = document.createElement("li");
    li.textContent = movie;
    recommendationList.appendChild(li);
  });
}
