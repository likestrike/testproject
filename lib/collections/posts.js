Posts = new Mongo.Collection('posts');

Meteor.methods({
  postInsert: function(postAttributes) {
  	//  보안검사
    check(Meteor.userId(), String); // login check
    check(postAttributes, { // 객체 문자열 검사.
      title: String,
      url: String
    });
    // futures npm package를 이용한 대기시간 보정관찰. (insert와 동시에 변경내용을 UI에 적용하고 뒷단에서 Data를 저장하는 작용.)
    if (Meteor.isServer) {
      postAttributes.title += "(server)";
      // wait for 5 seconds
      Meteor._sleepForMs(0);
    } else {
      postAttributes.title += "(client)";
    }

    // 이중 등록 방지
    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postWithSameLink) {
      return {
        postExists: true,
        _id: postWithSameLink._id
      }
    }
    
    var user = Meteor.user();
    var post = _.extend(postAttributes, {
      userId: user._id, 
      author: user.username, 
      submitted: new Date()
    });
    var postId = Posts.insert(post);
    return {
      _id: postId
    };
  }
});

Posts.allow({
  insert: function(userId, doc) {
    // only allow posting if you are logged in
    return !! userId;
  }
});