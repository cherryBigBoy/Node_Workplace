
//操作Mongodb

const config = require('config-lite')(__dirname);
const Mongolass = require('mongolass');
const mongolass = new Mongolass();

//连接Mongodb
mongolass.connect(config.mongodb);
//生成时间戳工具
const monent = require('moment');
const objectIdToTimestamp = require('objectid-to-timestamp');

//根据id生成创建时间 create_at
mongolass.plugin('addCreatedAt',{
    afterFind : function(results){
        results.forEach(function(item){
            item.created_at = monent(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm:ss');
        })
        return results;
    },
    afterFindOne: function(result){
        if(result){
            result.created_at = monent(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm:ss');
        }
        return result
    }
});



//定义用户模型
exports.User = mongolass.model('User',{
    name: { type: 'string' },
    password: { type: 'string' },
    avatar: { type: 'string' },
    gender: { type: 'string', enum: ['m', 'f', 'x'] },
    bio: { type: 'string' }
});

//根据用户名生成唯一索引
exports.User.index({name: 1},{unique:true}).exec();


//定义文章模型
exports.Post = mongolass.model('Post', {
    author: { type: Mongolass.Types.ObjectId },
    title: { type: 'string' },
    content: { type: 'string' },
    pv: { type: 'number' }
})
exports.Post.index({ author: 1 , _id: -1 }).exec()// 按创建时间降序查看用户的文章列表


//定义留言模型
exports.Comment = mongolass.model('Comment',{
    author:{type:Mongolass.Types.ObjectId},
    content:{type:'string'},
    postId:{type:Mongolass.Types.ObjectId}
})
exports.Comment.index({postId:1,_id:-1}).exec();