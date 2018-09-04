import json
from routes.session import session
from utils import (
    log,
    redirect,
    http_response,
    json_response,
)
from models.todo import Todo
from models.weibo import Weibo
from models.weibo import Comment


def all_weibo(request):
    ms = Weibo.all()
    data = [m.json() for m in ms]
    return json_response(data)


def add_weibo(request):
    form = request.json()

    m = Weibo.new(form)
    return json_response(m.json())


def delete_weibo(request):
    id = int(request.query.get('id'))
    wb = Weibo.delete(id)
    return json_response(wb.json())

def update_weibo(request):
    form = request.json()
    id = int(form.get('id'))
    wb = Weibo.update(form, id, 'content')
    return json_response(wb.json())

def comment_weibo(request):
    form = request.json()
    # wid = int(form.get('id'))
    cmt = Comment.new(form)
    return json_response(cmt.json())

def comment_delete_weibo(request):
    cmt_id = int(request.query.get('id'))
    # print('cmt_id', cmt_id)
    cmt = Comment.delete(cmt_id)
    return json_response(cmt.json())


def all(request):
    todo_list = Todo.all()
    todos = [t.json() for t in todo_list]
    return json_response(todos)


def add(request):
    form = request.json()
    t = Todo.new(form)
    return json_response(t.json())


def delete(request):
    """
    /delete?id=1
    """
    todo_id = int(request.query.get('id'))
    t = Todo.delete(todo_id)
    return json_response(t.json())


def update(request):
    form = request.json()
    todo_id = int(form.get('id'))
    t = Todo.update(todo_id, form)
    return json_response(t.json())


route_dict = {
    '/api/todo/all': all,
    '/api/todo/add': add,
    '/api/todo/delete': delete,
    '/api/todo/update': update,
    # weibo api
    '/api/weibo/all': all_weibo,
    '/api/weibo/add': add_weibo,
    '/api/weibo/delete': delete_weibo,
    '/api/weibo/update': update_weibo,
    '/api/weibo/comment': comment_weibo,
    '/api/weibo/comment/delete': comment_delete_weibo,

}
