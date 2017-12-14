const Post = require('../lib/mongo').Post;
const CommentModel = require('./comments');

const marked = require('marked');

//给post添加留言数CommentsCount
Post.plugin('addCommentsCount',{
    afterFind: function(posts){
        return Promise.all(posts.map(function(post){
            return CommentModel.getCommentsCount(post._id).then(function(commentsCount){
                post.commentsCount = commentsCount;
                return post;
            })
        }))
    },

    afterFindOne: function(post){
        if(post){
            return CommentModel.getCommentsCount(post._id).then(function(commentsCount){
                post.commentsCount = commentsCount;
                return post;
            })
        }
        return post;
    }
});


//将post的content的markdown转换成html
Post.plugin('contentToHtml',{
    afterFind: function(posts){
        return posts.map(function (post){
            post.content = marked(post.content);
            return post;
        });       
    },
    afterFindOne: function(post){
        if (post) {
            post.content = marked(post.content);
          }
          return post;
    }
})

module.exports = {
    //创建一篇文章
    create: function create(post){
        console.log(post);
        return Post.create(post).exec();
    },

    //通过文章id获取一篇文章,这里的文章是经过转换转成html的
    getPostById: function getPostById(postId){
        return Post.findOne({_id:postId})
                .populate({path:'author',model:'User'})
                .addCreatedAt()
                .contentToHtml()
                .addCommentsCount()
                .exec()
    },

    //按照创建时间降序获取所有用户文章或者某个特定用户的所有文章
    getPosts: function getPosts(author){
        const query = {};
        if(author){
            query.author = author;
        };

        return Post
        .find(query)
        .populate({ path: 'author', model: 'User' })
        .sort({ _id: -1 })
        .addCreatedAt()
        .contentToHtml()
        .addCommentsCount()
        .exec()
    },

    //通过给文章的pv加一
    incPv: function incPv(postId){
        return Post.update({_id:postId},{$inc:{pv:1}}).exec();
    },

    //获取一篇原生文章，这里是没有经过转换成html的
    getRawPostById : function getRawPostById(postId){
        return Post.findOne({_id:postId})
                .populate({path:'author',model:'User'})
                .exec();
    },

    //通过文章id更新一篇文章
    updatePostById: function updatePostById(postId, data){
        return Post.update({_id: postId},{$set:data}).exec();
    },

    //通过文章Id删除一篇文章
    delPostById: function delPostById(postId){
        return Post.remove({_id:postId}).exec()
                .then(function(res){
                    //删除文章以后，还要把文章下面的所有留言也都删除
                    if(res.result.ok && res.result.n>0){
                        return CommentModel.delCommentsByPostId(postId);
                    }
                })
    }
}