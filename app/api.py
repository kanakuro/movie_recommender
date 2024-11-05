import requests
import urllib.parse
import os
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()

headers = {
    "accept": "application/json",
    "Authorization": os.environ.get('AUTH')
}

def get_movie_image_url(movie_title):
    movie_id = get_movie_id(movie_title)
    image_request_url = "https://api.themoviedb.org/3/movie/"
    image_request_url += str(movie_id)
    image_request_url += "/images"
    response = requests.get(image_request_url, headers=headers)
    image_url = ''
    if response:
        response = response.json()
        if len(response['posters']) > 0:
            image_path = response['posters'][0]['file_path']
            image_url = 'https://image.tmdb.org/t/p/w154' + image_path
    return image_url


def get_movie_id(movie_title):
    search_url = "https://api.themoviedb.org/3/search/movie?query="
    search_url += urllib.parse.quote(str(movie_title))
    search_url += '&include_adult=false&language=en-US&page=1'
    response = requests.get(search_url, headers=headers)
    movie_id = 0
    if response:
        response = response.json()
        if len(response['results']) > 0:
            movie_id = response['results'][0]['id']
    return movie_id

def get_movie_link(movie_id):
    # movie_id = get_movie_id(movie_title)
    link_request_url = "https://api.themoviedb.org/3/movie/"
    link_request_url += str(movie_id)
    link_request_url += "/watch/providers"
    response = requests.get(link_request_url, headers=headers)
    link_url = ''
    if response:
        response = response.json()
        if len(response['results']) > 0:
            first_key = next(iter(response['results']))
            link = response['results'][first_key]['link']
            link_url = link[:-10]
    return link_url
