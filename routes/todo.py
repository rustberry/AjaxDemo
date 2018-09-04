from utils import (
    log,
    redirect,
    template,
    http_response,
)


def main_index(request):
    return redirect('/todo/index')


def index(request):
    body = template('todo_index.html')
    return http_response(body)


route_dict = {
    '/': main_index,
    '/todo/index': index,
}
