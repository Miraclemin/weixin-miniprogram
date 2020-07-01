var app = getApp();
Page({
    data: {
        order_list:[],
        statusType: [ "等待总结", "总结已完成","取消总结"],
        status:[ "-5","1","0" ],
        currentType: 0,
        tabClass: [ "", "", ""]
    },
    statusTap: function (e) {
        var curType = e.currentTarget.dataset.index;
        this.setData({
            currentType: curType
        });
        this.getPayOrder();
    },
    orderDetail: function (e) {
        wx.navigateTo({
            url: "/pages/my/order_info?id=" + e.currentTarget.dataset.id
        })
    },
    onLoad: function (options) {
        // 生命周期函数--监听页面加载
    },
    onShow: function () {
        this.getPayOrder();
    },
    orderCancel:function( e ){
        this.orderOps( e.currentTarget.dataset.id,"cancel","确定取消讲座？" );
    },
    getPayOrder:function(){
        var that = this;
        wx.request({
            url: app.buildUrl("/my/order"),
            header: app.getRequestHeader(),
            data: {
                status: that.data.status[ that.data.currentType ]
            },
            success: function (res) {
                var resp = res.data;
                if (resp.code != 200) {
                    app.alert({"content": resp.msg});
                    return;
                }

                that.setData({
                   order_list:resp.data.pay_order_list
                });
            }
        });
    },
    toPay:function( e ){
        var that = this;
        wx.request({
            url: app.buildUrl("/order/pay"),
            header: app.getRequestHeader(),
            method: 'POST',
            data: {
                order_sn: e.currentTarget.dataset.id
            },
            success: function (res) {
                var resp = res.data;
                if (resp.code != 200) {
                    app.alert({"content": resp.msg});
                    return;
                }
                var pay_info = resp.data.pay_info;
                wx.requestPayment({
                    'timeStamp': pay_info.timeStamp,
                    'nonceStr': pay_info.nonceStr,
                    'package': pay_info.package,
                    'signType': 'MD5',
                    'paySign': pay_info.paySign,
                    'success': function (res) {
                    },
                    'fail': function (res) {
                    }
                });
            }
        });
    },
    orderConfirm:function( e ){
        this.orderOps( e.currentTarget.dataset.id,"confirm","确定收到？" );
    },
    orderComment:function( e ){
        wx.navigateTo({
            url: "/pages/my/comment?id=" + e.currentTarget.dataset.id
        });
    },
    orderOps:function(id,act,msg){
        var that = this;
        var params = {
            "content":msg,
            "cb_confirm":function(){
                wx.request({
                    url: app.buildUrl("/order/ops"),
                    header: app.getRequestHeader(),
                    method: 'POST',
                    data: {
                        id: id,
                        act:act
                    },
                    success: function (res) {
                        var resp = res.data;
                        app.alert({"content": resp.msg});
                        if ( resp.code == 200) {
                            that.getPayOrder();
                        }
                    }
                });
            }
        };
        app.tip( params );
    }
});
