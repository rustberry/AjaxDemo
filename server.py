import socket
import urllib.parse
import _thread

from routes.routes_static import route_static
# from routes.routes_user import route_dict as user_routes
from routes.routes_weibo import route_dict as weibo_routes
from routes.todo import route_dict as todo_routes
from routes.api_todo import route_dict as api_todo
from utils import (
    log,
    error,
)


class Request(object):
    def __init__(self):
        self.method = 'GET'
        self.path = ''
        self.query = {}
        self.body = ''
        self.headers = {}
        self.cookies = {}

    def add_cookies(self):
        cookies = self.headers.get('Cookie', '')
        kvs = cookies.split('; ')
        log('cookie', kvs)
        for kv in kvs:
            if '=' in kv:
                k, v = kv.split('=')
                self.cookies[k] = v

    def add_headers(self, header):
        # lines = header.split('\r\n')
        lines = header
        for line in lines:
            k, v = line.split(': ', 1)
            self.headers[k] = v
        self.add_cookies()

    def form(self):
        body = urllib.parse.unquote(self.body)
        args = body.split('&')
        f = {}
        log('form debug', args, len(args))
        for arg in args:
            k, v = arg.split('=')
            f[k] = v
        return f

    def json(self):
        import json
        return json.loads(self.body)


def parsed_path(path):
    index = path.find('?')
    if index == -1:
        return path, {}
    else:
        path, query_string = path.split('?', 1)
        args = query_string.split('&')
        query = {}
        for arg in args:
            k, v = arg.split('=')
            query[k] = v
        return path, query


def response_for_path(path, request):
    path, query = parsed_path(path)
    request.path = path
    request.query = query
    log('path and query', path, query, request.body)
    r = {
        '/static': route_static,
    }
    r.update(api_todo)
    # r.update(user_routes)
    r.update(todo_routes)
    r.update(weibo_routes)
    #
    response = r.get(path, error)
    return response(request)


def process_request(connection):
    r = connection.recv(1100)
    r = r.decode('utf-8')
    log('完整请求')
    log('请求结束')
    if len(r.split()) < 2:
        connection.close()
    path = r.split()[1]
    request = Request()

    request.method = r.split()[0]
    request.add_headers(r.split('\r\n\r\n', 1)[0].split('\r\n')[1:])
    request.body = r.split('\r\n\r\n', 1)[1]
    response = response_for_path(path, request)
    # 把响应发送给客户端
    connection.sendall(response)
    print('完整响应')
    try:
        log('响应\n', response.decode('utf-8').replace('\r\n', '\n'))
    except Exception as e:
        log('异常', e)

    connection.close()
    print('关闭')


def run(host='', port=3000):
    print('start at', '{}:{}'.format(host, port))
    with socket.socket() as s:
        s.bind((host, port))
        s.listen(3)

        while True:
            connection, address = s.accept()
            print('连接成功, 使用多线程处理请求', address)

            _thread.start_new_thread(process_request, (connection,))


if __name__ == '__main__':
    config = dict(
        host='',
        port=3000,
    )
    run(**config)
