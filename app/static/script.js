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
const buttonArea = document.getElementById("button-area");
const backToMenuBtn = document.getElementById("back-to-menu-btn");
const backToContentsBasedBtn = document.getElementById(
  "back-to-contents-based-btn"
);

contentsBasedBtn.addEventListener("click", function () {
  contentsBasedArea.style.display = "";
  menuArea.style.display = "none";
});

// リロード後、メニューエリアを表示するかチェック
window.addEventListener("load", () => {
  if (localStorage.getItem("hideMenuArea") === "true") {
    contentsBasedArea.style.display = "";
    menuArea.style.display = "none";
    backToContentsBasedBtn.display = "none";
    localStorage.removeItem("hideMenuArea"); // 状態をリセット
  }
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
        hideNonSelectedMovieLists();
        backToContentsBasedBtn.display = "";
        buttonArea.style.display = "none";
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

// コンテンツベースの画面を出し直すボタン押下後の処理
refreshBtn.addEventListener("click", () => {
  localStorage.setItem("hideMenuArea", "true");
  window.location.reload();
});

backToContentsBasedBtn.addEventListener("click", () => {
  localStorage.setItem("hideMenuArea", "true");
  window.location.reload();
});

// メニュー画面に戻るボタン押下後の処理
backToMenuBtn.addEventListener("click", () => {
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

// 選択されていないリストを非表示
function hideNonSelectedMovieLists() {
  // 全てのliタグを取得
  const items = document.querySelectorAll("li.rand-movie-area");

  // すべてのラジオボタンの状態を確認
  items.forEach((item) => {
    const radio = item.querySelector("input[type='radio']");
    if (radio.checked) {
      // 選択されているラジオボタンがあれば表示
      item.style.display = "list-item";
    } else {
      // 選択されていないものは非表示
      item.style.display = "none";
    }
  });
}
