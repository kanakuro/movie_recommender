import requests
import urllib.parse

headers = {
    "accept": "application/json",
}

def get_movie_image_url(movie_title):
    movie_id = get_movie_id(movie_title)
    image_url = "https://api.themoviedb.org/3/movie/"
    image_url += str(movie_id)
    image_url += "/images"
    response = requests.get(image_url, headers=headers)
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