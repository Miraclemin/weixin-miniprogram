//获取应用实例
var app = getApp();
Page({
  data: {
    userInfo: {},
    regFlag: true
    },
    onLoad() {
      this.checkLogin();
      console.log(this.data.regFlag)
    },
    onShow() {
      // this.checkLogin();
      // if(this.data.regFlag==true)
      //   { 
          this.getInfo();
      //   }
    },
    getInfo:function(){
        var that = this;
        wx.request({
            url: app.buildUrl("/member/info"),
            header: app.getRequestHeader(),
            success: function (res) {
                var resp = res.data;
                if (resp.code != 200) {
                    app.alert({"content": resp.msg});
                    return;
                }
                that.setData({
                   user_info:resp.data.info
                });
            }
        });
    },
  checkLogin: function () {
    var that = this;
    wx.login({
      success: function (res) {
        if (!res.code) {
          app.alert({ 'content': '登录失败，请再次点击~~' });
          return;
        }
        wx.request({
          url: app.buildUrl('/member/check-reg'),
          header: app.getRequestHeader(),
          method: 'POST',
          data: { code: res.code },
          success: function (res) {
            if (res.data.code != 200) {
              that.setData({
                regFlag: false
              });
              return;
            }

            app.setCache("token", res.data.data.token);
            //that.goToIndex();
          }
        });
      }
    });
  },
  login: function (e) {
    var that = this;
    if (!e.detail.userInfo) {
      app.alert({ 'content': '登录失败，请再次点击~~' });
      return;
    }

    var data = e.detail.userInfo;
    wx.login({
      success: function (res) {
        if (!res.code) {
          app.alert({ 'content': '登录失败，请再次点击~~' });
          return;
        }
        data['code'] = res.code;
        wx.request({
          url: app.buildUrl('/member/login'),
          header: app.getRequestHeader(),
          method: 'POST',
          data: data,
          success: function (res) {
            if (res.data.code != 200) {
              app.alert({ 'content': res.data.msg });
              return;
            }
            app.setCache("token", res.data.data.token);
            // that.goToIndex();
            that.getInfo();
            that.setData({
              regFlag: true
            });
          }
        });
      }
    });
  }
});