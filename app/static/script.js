////////////////////////////////////////
///// DOM要素の取得
////////////////////////////////////////
const searchBtn = document.getElementById("search-btn");
const refreshBtn = document.getElementById("refresh-btn");
const nothingHereBtn = document.getElementById("nothing-here-btn");
const movieTitle = document.getElementById("movie-title");
const movieDescription = document.getElementById("movie-description");
const recommendationList = document.getElementById("recommendation-list");
const loader = document.getElementById("loader");
const contentsBasedBtn = document.getElementById("contents_based");
const collabFilteringBtn = document.getElementById("collab_filtering");
const menuArea = document.getElementById("menu_area");
const contentsBasedArea = document.getElementById("contents_based_area");
const collabFilteringArea = document.getElementById("collab_filtering_area");
const contentsBaseduttonArea = document.getElementById(
  "contents-based-button-area"
);
const sendBtn = document.getElementById("send-btn");
const showNextBtn = document.getElementById("show-next-btn");
const backToMenuBtn = document.querySelectorAll(".back-to-menu-btn");
const backToContentsBasedBtn = document.getElementById(
  "back-to-contents-based-btn"
);
const recommendationMovies = document.getElementById("recommendation-movies");
const evaluatedMovies = document.getElementById("evaluated-movies");
const movieEvaluateArea = document.getElementById("movie-evaluate-area");

////////////////////////////////////////
///// メニュー画面
////////////////////////////////////////
contentsBasedBtn.addEventListener("click", function () {
  contentsBasedArea.style.display = "";
  menuArea.style.display = "none";
});

collabFilteringBtn.addEventListener("click", function () {
  collabFilteringArea.style.display = "";
  menuArea.style.display = "none";
});

// リロード後、メニューエリアを表示するかチェック
window.addEventListener("load", () => {
  if (localStorage.getItem("contentsAreaOnly") === "true") {
    contentsBasedArea.style.display = "";
    menuArea.style.display = "none";
    backToContentsBasedBtn.display = "none";
    localStorage.removeItem("contentsAreaOnly"); // 状態をリセット
  }
  if (localStorage.getItem("colabAreaOnly") === "true") {
    collabFilteringArea.style.display = "";
    menuArea.style.display = "none";
    localStorage.removeItem("colabAreaOnly"); // 状態をリセット
  }
});

// リロード中、ボタンを非活性にする
window.addEventListener("beforeunload", function () {
  // クラス名が "btn" の全ての要素を取得
  const buttons = document.querySelectorAll(".btn");
  // 各ボタンに対して disabled 属性を true に設定
  buttons.forEach((button) => {
    button.disabled = true;
  });
});

////////////////////////////////////////
///// コンテンツベース
////////////////////////////////////////
// コンテンツベースの画面を出し直すボタン押下後の処理
nothingHereBtn.addEventListener("click", () => {
  localStorage.setItem("contentsAreaOnly", "true");
  window.location.reload();
});

// コンテンツベースに戻るボタン押下後の処理
backToContentsBasedBtn.addEventListener("click", () => {
  localStorage.setItem("contentsAreaOnly", "true");
  window.location.reload();
});

// メニュー画面に戻るボタン押下後の処理
backToMenuBtn.forEach(function (target) {
  target.addEventListener("click", () => {
    window.location.reload();
  });
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

  // コンテンツベースのレコメンドのリクエスト送信
  fetch(`/recommend_contents_base?title=${encodeURIComponent(movieName)}`)
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
        contentsBaseduttonArea.style.display = "none";
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

////////////////////////////////////////
///// 強調フィルタリング（ユーザベース）
////////////////////////////////////////
let eval_list = getEvalListStr();
// 評価した映画リストに表示
displayEvaluatedMovies(eval_list);

// 【グローバル】ロード時に受け取った10件の映画リストを格納する
let received_movies_list_escaped = document.querySelectorAll(".received_movie");
let received_movie_url_list = document.querySelectorAll(".received_image_url");
let received_movies_list = [];
let received_url_list = [];
received_movies_list_escaped.forEach((received_movie_escaped) => {
  let received_movie;
  if (received_movie_escaped !== null) {
    received_movie_escaped = received_movie_escaped.value;
    received_movie = received_movie_escaped.replaceAll("&nbsp;", " ");
    // received_movies_listに10件のリストを格納する
    received_movies_list.push(received_movie);
  }
});
received_movie_url_list.forEach((received_movie_url) => {
  if (received_movie_url !== null) {
    received_url_list.push(received_movie_url.value);
  }
});
// 初期表示
nextMovie();

// sendボタン押下時
sendBtn.addEventListener("click", () => {
  let target_title = document.getElementById("evaluated_movie_title").innerHTML;
  let target_evaluation = document.querySelector(
    'input[name="eval"]:checked'
  ).value;

  // ローカルストレージに評価地を保存（配列の中にJSONを格納）
  eval_list = getEvalListStr();
  let target_json = { title: target_title, eval: target_evaluation };
  eval_list.push(target_json);
  localStorage.setItem("eval_list", JSON.stringify(eval_list));
  // 評価した映画リストに表示
  displayEvaluatedMovies(eval_list);

  eval_cnt = eval_list.length;
  if (eval_cnt > 4) {
    // 協調フィルタリングのおすすめを表示させるリクエスト
    fetch("colab_filetring_request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eval_list),
    })
      .then((response) => response.json())
      .then((data) => {
        displayRecommendationsByUsers(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    // 登録個数が４子以下なら次の映画を表示
    nextMovie();
  }
});

// showNext押下時
showNextBtn.addEventListener("click", () => {
  nextMovie();
});

// Refresh Evaluationsボタン押下後の処理
refreshBtn.addEventListener("click", () => {
  // ローカルストレージをクリア
  localStorage.removeItem("eval_list");
  // レコメンドエリアは非表示、評価エリアは表示
  movieEvaluateArea.style.display = "";
  recommendationMovies.style.display = "none";
  // 評価中の映画エリアはクリア
  let eval_list = [];
  displayEvaluatedMovies(eval_list);
});

// 次の評価映画を表示させる処理
// グローバル変数received_movies_listを使う
function nextMovie() {
  if (received_movies_list.length === 0) {
    // 配列received_movies_listがない場合、次の10件を受け取る
    localStorage.setItem("colabAreaOnly", "true");
    window.location.reload();
  } else {
    // 配列received_movies_listの先頭の映画を表示させる
    let showed_movie_title = document.getElementById("evaluated_movie_title");
    let showed_movie_img = document.getElementById("evaluated_movie_img");
    showed_movie_title.innerHTML = received_movies_list[0];
    showed_movie_img.src = received_url_list[0];
    // 表示した映画のタイトルは、配列received_movies_listから削除する
    received_movies_list.splice(0, 1);
    received_url_list.splice(0, 1);
  }
}

// ローカルストレージに保存された評価内容を取得
function getEvalListStr() {
  if (!localStorage.getItem("eval_list")) {
    localStorage.setItem("eval_list", JSON.stringify([]));
  }
  let eval_list = JSON.parse(localStorage.getItem("eval_list"));
  return eval_list;
}

// 推薦映画を表示
function displayRecommendationsByUsers(recommendations) {
  recommendationMovies.innerHTML = ""; // 以前のリストをクリア

  const recommendation_arrays = Object.values(recommendations);
  recommendation_arrays.forEach((recommendation) => {
    title = recommendation[0];
    link = recommendation[1];
    const a = document.createElement("a");
    a.textContent = title;
    a.href = link;
    a.target = "_blank";
    const li = document.createElement("li");
    li.appendChild(a);

    recommendationMovies.appendChild(li);
  });
  movieEvaluateArea.style.display = "none";
}

// 評価した映画を表示する
function displayEvaluatedMovies(eval_list) {
  evaluatedMovies.innerHTML = ""; // 以前のリストをクリア

  if (eval_list.length > 0) {
    eval_list.forEach((eval) => {
      const li = document.createElement("li");
      li.textContent = eval.title + "　：　" + eval.eval;
      evaluatedMovies.appendChild(li);
    });
  }
}
