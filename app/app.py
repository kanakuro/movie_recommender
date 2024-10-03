from flask import Flask, request, jsonify ,render_template
import api
import numpy as np
import pandas as pd
import random
import html

app = Flask(__name__)

#「/index」へアクセスがあった場合に、「index.html」を返す
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
        escaped_rand_list[i] = [escaped_rand_title, image_url]
    return render_template("index.html", rand_list = rand_list, escaped_rand_list = escaped_rand_list)

@app.route('/recommend', methods=['GET'])
def recommend():
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

    # 類似度スコアのリストを取得
    cosine_sim = np.loadtxt('/Users/kuro/dev/movie_recommend/app/static/datas/cosine_sim.txt')
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

if __name__ == '__main__':
    app.run(debug=True)