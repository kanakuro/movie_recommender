from flask import Flask, request, jsonify ,render_template
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics.pairwise import cosine_similarity
import api
import numpy as np
import pandas as pd
import random
import html

app = Flask(__name__)

@app.route("/index")
def index():
    movie_indices = pd.read_csv('/Users/kuro/dev/movie_recommend/app/static/datas/movie_indices.csv', index_col=0)
    movie_list = movie_indices.index.to_list()
    rand_list = random.sample(movie_list, 10)
    escaped_rand_list = {}
    for i, rand_title in enumerate(rand_list):
        escaped_rand_title = html.escape(rand_title).replace(" ", "&nbsp;")
        # API(detailでid調べて画像のurl取得)
        image_url = api.get_movie_image_url(rand_title)
        escaped_rand_list[i] = [rand_title, escaped_rand_title, image_url]
    return render_template("index.html", escaped_rand_list = escaped_rand_list)


####################################
#     コンテンツベース
####################################
@app.route('/recommend_contents_base', methods=['GET'])
def recommend_contents_base():
    title = request.args.get('title')
    recommendations = get_recommendations(title)

    if len(recommendations) == 0:
        return ["error"]
    else:
        return jsonify(recommendations)

def get_recommendations(title):
    # 映画タイトルとインデックスを結びつける
    movie_indices = pd.read_csv('/Users/kuro/dev/movie_recommend/app/static/datas/movie_indices.csv', index_col=0)

    # ターゲット映画のインデックスを取得
    idx = movie_indices.iloc[movie_indices.index.str.startswith(title, na=False), 0].head(1).values[0]

    # 類似度スコアを計算
    movies = pd.read_csv('/Users/kuro/dev/movie_recommend/app/static/datas/movies.csv')
    mlb = MultiLabelBinarizer()
    movies['genres'] = movies['genres'].str.split('|')
    # ジャンルをOne-Hot Encodingに変換
    movies_with_genres = movies.join(pd.DataFrame(mlb.fit_transform(movies.pop('genres')), columns=mlb.classes_, index=movies.index))
    cosine_sim = cosine_similarity(movies_with_genres.drop(['movieId', 'title'], axis=1))
    sim_scores = list(enumerate(cosine_sim[idx]))

    # 類似度スコアに基づいて映画をソート
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # 上位10件の映画を取得
    sim_scores = sim_scores[1:11]

    # 映画インデックスを取得
    target_movie_indices = [i[0] for i in sim_scores]

    # 推薦映画のタイトルを返す
    movie_titles = movie_indices.iloc[target_movie_indices].index.to_list()
    return movie_titles

####################################
#     協調フィルタリング(ユーザベース)
####################################
@app.route('/colab_filetring_request', methods=['POST'])
def recommend_colab_filetring():
    eval_data = request.get_json()
    movies = pd.read_csv('/Users/kuro/dev/movie_recommend/app/static/datas/movies.csv')
    ratings = pd.read_csv('/Users/kuro/dev/movie_recommend/app/static/datas/ratings.csv')

    # ピボットテーブル作成：ユーザーごとの映画評価
    user_movie_matrix = ratings.pivot_table(index='userId', columns='movieId', values='rating')

    # レコメンド表示対象のユーザidを新設する
    user_id = max(user_movie_matrix.index) + 1

    # ユーザーが映画を評価したらその都度レコメンドを更新
    recommendations = rate_movie_and_get_recommendations(user_id, user_movie_matrix, movies, eval_data)
    recommendations_titles = recommendations.values
    recommendations_movie_ids = recommendations.index

    response = {}
    i = 0
    for title, movie_id in zip(recommendations_titles, recommendations_movie_ids):
        # API(detailでid調べて映画ページのurl取得)
        link_url = api.get_movie_link(movie_id)
        response[i] = [title[:-7], link_url]
        i = i + 1

    if len(response) == 0:
        return ["error"]
    else:
        return response


# ユーザー間の類似度を計算する関数
def calculate_user_similarity(user_movie_matrix):
    user_similarity = cosine_similarity(user_movie_matrix.fillna(0))
    return pd.DataFrame(user_similarity, index=user_movie_matrix.index, columns=user_movie_matrix.index)

# おすすめ映画を計算する関数
def recommend_movies_based_on_user(user_id, user_movie_matrix, user_similarity_df, movies_df):
    # 類似ユーザを抽出
    similar_users = user_similarity_df[user_id].sort_values(ascending=False)
    # 加重評価度の算出のため、user_movie_matrixをsimilar_usersの並び順と合わせて並び替え
    similar_user_ratings = user_movie_matrix.loc[similar_users.index]
    
    # 加重評価値＝ユーザ類似度＊評価値
    weighted_ratings = np.dot(similar_users.values.astype(float), similar_user_ratings.fillna(0).values.astype(float))
    recommendations = pd.Series(weighted_ratings, index=user_movie_matrix.columns)

    # ユーザーがまだ評価していない映画をフィルタリング
    already_rated = user_movie_matrix.loc[user_id].dropna().index
    recommendations = recommendations.drop(already_rated).sort_values(ascending=False)

    recommended_movie_ids = recommendations.head(10).index
    # isin()で対象idに含まれる行をTrueとする
    return movies_df[movies_df['movieId'].isin(recommended_movie_ids)]['title']

# ユーザーが映画を評価するシミュレーション関数
def rate_movie_and_get_recommendations(user_id, user_movie_matrix, movies_df, eval_data):
    for eval in eval_data:
        movie_id = movies_df[movies_df['title'].str.startswith(eval['title'])]['movieId'].values[0]
        # 新しい評価を反映
        user_movie_matrix.loc[user_id, movie_id] = eval['eval']

    # ユーザー間の類似度を再計算
    updated_user_similarity_df = calculate_user_similarity(user_movie_matrix)

    # 新しいおすすめ映画を表示
    recommendations = recommend_movies_based_on_user(user_id, user_movie_matrix, updated_user_similarity_df, movies_df)
    return recommendations

if __name__ == '__main__':
    app.run(debug=True)