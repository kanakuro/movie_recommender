import requests

url = "https://api.themoviedb.org/3/authentication"

headers = {
    "accept": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4M2YwNWJlMDJmMTgyZGM2MWJlM2QxN2QyMmMzMTljMyIsIm5iZiI6MTcyNzgzMDYzOC4wNDI5NDMsInN1YiI6IjY2Zjc0Zjg4ZTdkMjRlYmIyYmExZTU5MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.YOZRYiYWWvUEgUdmWBvORhmN3gy1ZUQZge4Am83tTAo"
}

response = requests.get(url, headers=headers)

print(response.text)