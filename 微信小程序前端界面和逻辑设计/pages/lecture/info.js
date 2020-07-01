//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
var utils = require('../../utils/util.js');

Page({
    data: {
        autoplay: true,
        interval: 3000,
        duration: 1000,
        swiperCurrent: 0,
        hideShopPopup: true,
        canSubmit: false, 
        shopCarInfo: {},
        shopType: "addLectureList",
        id: 0,
        commentCount:2
    },
    onLoad: function (e) {
        var that = this;
        that.setData({
            id: e.id
        });
    },
    onShow:function(){
        this.getInfo();
        this.getComments();
    },
    goShopCar: function () {
        wx.reLaunch({
            url: "/pages/lecture_res/index"
        });
    },
    toAddShopCar: function () {
        this.setData({
            shopType: "addLectureList"
        });
        this.bindGuiGeTap();
    },
    addLectureList: function () {
        var that = this;
        var data = {
            "id": this.data.info.id
        };
        wx.request({
            url: app.buildUrl("/cart/set"),
            header: app.getRequestHeader(),
            method: 'POST',
            data: data,
            success: function (res) {
                var resp = res.data;
                app.alert({"content": resp.msg});
                that.setData({
                    hideShopPopup: true
                });
            }
        });
    },
    /**
     * 规格选择弹出框
     */
    bindGuiGeTap: function () {
        this.setData({
            hideShopPopup: false
        });
    },
    /**
     * 规格选择弹出框隐藏
     */
    closePopupTap: function () {
        this.setData({
            hideShopPopup: true
        })
    },
    
    //事件处理函数
    swiperchange: function (e) {
        this.setData({
            swiperCurrent: e.detail.current
        })
    },
    getInfo: function () {
        var that = this;
        wx.request({
            url: app.buildUrl("/food/info"),
            header: app.getRequestHeader(),
            data: {
                id: that.data.id
            },
            success: function (res) {
                var resp = res.data;
                if (resp.code != 200) {
                    app.alert({"content": resp.msg});
                    wx.navigateTo({
                        url: "/pages/lecture/index"
                    });
                    return;
                }
                that.setData({
                    info: resp.data.info
                });

                WxParse.wxParse('article', 'html', resp.data.info.summary, that, 5);
            }
        });
    },
    getComments:function(){
        var that = this;
        wx.request({
            url: app.buildUrl("/food/comments"),
            header: app.getRequestHeader(),
            data: {
                id: that.data.id
            },
            success: function (res) {
                var resp = res.data;
                if (resp.code != 200) {
                    app.alert({"content": resp.msg});
                    return;
                }

                that.setData({
                    commentList: resp.data.list,
                    commentCount: resp.data.count,
                });
            }
        });
    },
    onShareAppMessage: function () {
        var that = this;
        return {
            title: that.data.info.name,
            path: '/pages/lecture/info?id=' + that.data.info.id,
            success: function (res) {
                // 转发成功
                wx.request({
                    url: app.buildUrl("/member/share"),
                    header: app.getRequestHeader(),
                    method: 'POST',
                    data: {
                        url: utils.getCurrentPageUrlWithArgs()
                    },
                    success: function (res) {

                    }
                });
            },
            fail: function (res) {
                // 转发失败
            }
        }
    }
});
