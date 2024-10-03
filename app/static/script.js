// script.js

// DOM要素の取得
const searchBtn = document.getElementById("search-btn");
const refreshBtn = document.getElementById("refresh-btn");
// const movieInput = document.getElementById("movie-input");
const movieTitle = document.getElementById("movie-title");
const movieDescription = document.getElementById("movie-description");
const recommendationList = document.getElementById("recommendation-list");

// 検索ボタンのクリックイベント
searchBtn.addEventListener("click", () => {
  const movieNameEscaped = document.querySelector(
    'input[name="choices"]:checked'
  ).value;
  const movieName = movieNameEscaped.replaceAll("&nbsp;", " ");

  // 映画タイトルが入力されていない場合
  if (!movieName) {
    alert("Please enter a movie title!");
    return;
  }

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
    })
    .catch((error) => {
      console.error(error);
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
