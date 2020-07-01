//获取应用实例
var app = getApp();
Page({
    data: {
        "content":"无",
        "score":10,
        "id":null
    },
    onLoad: function (e) {
        var that = this;
        that.setData({
            "id": e.id
        });
    },
    scoreChange: function (e) {
        this.setData({
            "score": e.detail.value
        });
    },
    contentBlur: function ( e ) {
        app.console( e );
        this.setData({
            "content": e.detail.value
        });
    },
    doComment: function (e) {
        var that = this;
        this.setData({
        "content": e.detail.value.content
      });
        wx.request({
            url: app.buildUrl("/my/comment/add"),
            header: app.getRequestHeader(),
            method: "POST",
            data: {
                "content": that.data.content,
                "score": that.data.score,
                "id": that.data.id
            },
            success: function (res) {
                var resp = res.data;
                if (resp.code != 200) {
                    app.alert({"content": resp.msg});
                    return;
                }
                wx.navigateTo({
                    url: "/pages/my/commentList"
                });
            }
        });
    }
});