var timeString = function(timestamp) {
    t = new Date(timestamp * 1000)
    t = t.toLocaleTimeString()
    return t
}

var commentsTemplate = function(comments) {
    var html = ''
    for(var i = 0; i < comments.length; i++) {
        var c = comments[i]
        var t = `
            <div class="comment-cell" data-comment-id=${c.id}>
                ${c.content}
                <button class="comment-delete">删除评论</button>
            </div>
        `
        html += t
    }
    return html
}

var WeiboTemplate = function(Weibo) {
    var content = Weibo.content
    var id = Weibo.id
    var comments = commentsTemplate(Weibo.comments)
//    log('Weibo.comments', Weibo.comments)
    var t = `
        <div class='weibo-cell' data-id=${id}>
            <div class="weibo-content">
                [WEIBO]: ${content}
            </div>
            <div class="comment-list">
                ${comments}
            </div>
            <button class="weibo-delete">删除微博</button>
            <button class="weibo-edit">修改微博</button>
            <div class="comment-form">
                <input class="comment-content">
                <br>
                <button class="comment-add">添加评论</button>
            </div>
        </div>
        <br>
    `
    return t
    /*
    t = """
    <div class="Weibo-cell">
        <button class="Weibo-delete">删除</button>
        <span>{}</span>
    </div>
    """.format(Weibo)
    */
}

var insertWeibo = function(Weibo) {
    var WeiboCell = WeiboTemplate(Weibo)
    // 插入
    var WeiboList = e('.weibo-list')
    WeiboList.insertAdjacentHTML('beforeend', WeiboCell)
}

var insertComment = function(Comment, CmtList) {
    var cmt = commentsTemplate([Comment])
    log('cmt = commentsTemplate()', '(', cmt, ')')
    log('Comment', [Comment])
    CmtList.insertAdjacentHTML('beforeend', cmt)
}

var insertEditForm = function(cell) {
    var form = `
        <div class='weibo-edit-form'>
            <input class="weibo-edit-input">
            <button class='weibo-update'>更新</button>
        </div>
    `
    cell.insertAdjacentHTML('afterend', form)
}

var loadWeibos = function() {
    apiWeiboAll(function(r) {
        var Weibos = JSON.parse(r)
        for(var i = 0; i < Weibos.length; i++) {
            var Weibo = Weibos[i]
            insertWeibo(Weibo)
        }
    })
}

var bindEventWeiboAdd = function() {
    var b = e('#id-button-add-weibo')
    b.addEventListener('click', function(){
        var input = e('#id-input-weibo')
        var content = input.value
        log('click add', content)
        var form = {
            'content': content,
        }
        apiWeiboAdd(form, function(r) {
            var Weibo = JSON.parse(r)
            log('JSON.parse(r)', JSON.parse(r))
            insertWeibo(Weibo)
        })
    })
}

var bindEventWeiboDelete = function() {
    var WeiboList = e('.weibo-list')
    WeiboList.addEventListener('click', function(event){
        var self = event.target
//        log('self:', self)
        if(self.classList.contains('weibo-delete')){
            var WeiboCell = self.parentElement
            log('parentElement', WeiboCell)
            var Weibo_id = WeiboCell.dataset.id
            apiWeiboDelete(Weibo_id, function(r){
                log('删除成功', Weibo_id)
                WeiboCell.remove()
            })
        }
    })
}

var bindEventWeiboEdit = function() {
    var WeiboList = e('.weibo-list')
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('weibo-edit')){
//            var WeiboCell = self.parentElement
            insertEditForm(self)
        }
    })
}


var bindEventWeiboUpdate = function() {
    var WeiboList = e('.weibo-list')
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('weibo-update')){
            log('点击了 update ')
            var editForm = self.parentElement
            var input = editForm.querySelector('.weibo-edit-input')
            var content = input.value
            // 用 closest 方法可以找到最近的直系父节点
            var WeiboCell = self.closest('.weibo-cell')
            var Weibo_id = WeiboCell.dataset.id
            var form = {
                'id': Weibo_id,
                'content': content,
            }
            apiWeiboUpdate(form, function(r){
                log('更新成功', Weibo_id)
                var Weibo = JSON.parse(r)
                var selector = "[data-id='wid']".replace('wid', Weibo_id)
                var WeiboCell = document.querySelectorAll(selector)[0]
                log('WeiboCell', WeiboCell)
                var contentDiv= WeiboCell.querySelector('.weibo-content')
                contentDiv.innerText = Weibo.content
            })
        }
    })
}

var bindEventWeiboComment = function() {
    var WeiboList = e('.weibo-list')
    WeiboList.addEventListener('click', function(event) {
        var self = event.target
        if (self.classList.contains('comment-add')) {
            var cmtForm = self.parentElement
            var content = cmtForm.querySelector('.comment-content').value
            var WeiboCell = self.closest('.weibo-cell')
            var Weibo_id = WeiboCell.dataset.id
            var form = {
                'content':content,
                'weibo_id':Weibo_id
            }
            apiWeiboComment(form, function(r) {
//                log('comment form:', form)
                var Comment = JSON.parse(r)
                var selector = "[data-id='wid']".replace('wid', Weibo_id)
                var WeiboCell = document.querySelectorAll(selector)[0]
                var CmtList = WeiboCell.querySelector('.comment-list')
                log('CmtList', CmtList)
                insertComment(Comment, CmtList)
            })
        }
    })
}

var bindEventWeiboCommentDelete = function() {
    var WeiboList = e('.weibo-list')
    WeiboList.addEventListener('click', function(event) {
        var self = event.target
        if (self.classList.contains('comment-delete')) {
            cmtCell = self.parentElement
            cmt_id = cmtCell.dataset.commentId
            log('cmtCell', cmtCell, 'comment-id', cmt_id)
            apiWeiboCommentDelete(cmt_id, function(r) {
                cmtCell.remove()
            })
        }
    })
}

var bindEvents = function() {
    bindEventWeiboAdd()
    bindEventWeiboDelete()
    bindEventWeiboEdit()
    bindEventWeiboUpdate()
    bindEventWeiboComment()
    bindEventWeiboCommentDelete()
}

var __main = function() {
    bindEvents()
    loadWeibos()
}

__main()
