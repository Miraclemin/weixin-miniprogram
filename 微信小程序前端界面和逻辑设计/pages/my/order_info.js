var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
Page({
    data: {},
    onLoad: function (e) {
        var that = this;
        that.setData({
            id: e.id
        });
    },
    onShow: function () {
        this.getPayOrderInfo();
    },
    getPayOrderInfo:function(){
        var that = this;
        wx.request({
            url: app.buildUrl("/my/order/info"),
            header: app.getRequestHeader(),
            data: {
                id:that.data.id
            },
            success: function (res) {
                var resp = res.data;
                if (resp.code != 200) {
                    app.alert({"content": resp.msg});
                    return;
                }

                that.setData({
                   info:resp.data.info
                });
              WxParse.wxParse('article', 'html', resp.data.info.summary, that, 5);
            }
        });
    }
});