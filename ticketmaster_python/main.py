from flask import Flask, send_from_directory
from ticketmaster import fetch_event as search_func
from ticketmaster import fetch_detail as detail_func
from ticketmaster import fetch_venue as venue_func

app = Flask(__name__, static_url_path='/static')
app.add_url_rule('/search', view_func=search_func)
app.add_url_rule('/detail', view_func=detail_func)
app.add_url_rule('/venue', view_func=venue_func)


@app.route('/')
def homepage():
    return send_from_directory('static','events.html')

if __name__ == '__main__':
    app.run(host='127.0.0.1',port=8080,debug=True)