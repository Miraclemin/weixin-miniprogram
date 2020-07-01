//index.js
var app = getApp();
Page({
    data: {
      params: null
    },
    onLoad: function () {
    },
    onShow:function(){
        this.getCartList();
    },
    //每项前面的选中框
    selectTap: function (e) {
        var index = e.currentTarget.dataset.index;
        var list = this.data.list;
        if (index !== "" && index != null) {
            list[ parseInt(index) ].active = !list[ parseInt(index) ].active;
            this.setPageData(this.getSaveHide(), this.allSelect(), this.noSelect(), list);
        }
    },
    //计算是否全选了
    allSelect: function () {
        var list = this.data.list;
        var allSelect = false;
        for (var i = 0; i < list.length; i++) {
            var curItem = list[i];
            if (curItem.active) {
                allSelect = true;
            } else {
                allSelect = false;
                break;
            }
        }
        return allSelect;
    },
    //计算是否都没有选
    noSelect: function () {
        var list = this.data.list;
        var noSelect = 0;
        for (var i = 0; i < list.length; i++) {
            var curItem = list[i];
            if (!curItem.active) {
                noSelect++;
            }
        }
        if (noSelect == list.length) {
            return true;
        } else {
            return false;
        }
    },
    //全选和全部选按钮
    bindAllSelect: function () {
        var currentAllSelect = this.data.allSelect;
        var list = this.data.list;
        for (var i = 0; i < list.length; i++) {
            list[i].active = !currentAllSelect;
        }
        this.setPageData(this.getSaveHide(), !currentAllSelect, this.noSelect(), list);
    },
    //编辑默认全不选
    editTap: function () {
        var list = this.data.list;
        for (var i = 0; i < list.length; i++) {
            var curItem = list[i];
            curItem.active = false;
        }
        this.setPageData(!this.getSaveHide(), this.allSelect(), this.noSelect(), list);
    },
    //选中完成默认全选
    saveTap: function () {
        var list = this.data.list;
        for (var i = 0; i < list.length; i++) {
            var curItem = list[i];
            curItem.active = true;
        }
        this.setPageData(!this.getSaveHide(), this.allSelect(), this.noSelect(), list);
    },
    getSaveHide: function () {
        return this.data.saveHidden;
    },
    setPageData: function (saveHidden, allSelect, noSelect, list) {
        this.setData({
            list: list,
            saveHidden: saveHidden,
            allSelect: allSelect,
            noSelect: noSelect,
        });
    },
  createOrder: function () {
    var that = this;
    var data = {
            type:"cart",
            goods: []
        };
        var list = this.data.list;
        for (var i = 0; i < list.length; i++) {
            if ( !list[i].active) {
                continue;
            }
            data['goods'].push({
                "id": list[i].food_id,
                "speaker": list[i].speaker,
              "lecture_time": list[i].lecture_time,
              "speaker_address": list[i].speaker_address
            });
        }
    data = JSON.stringify(data)
    that.setData({
      params: JSON.parse(data)
    });
    data = {
      type: this.data.params.type,
      goods: JSON.stringify(this.data.params.goods)
    };
    wx.request({
      url: app.buildUrl("/order/create"),
      header: app.getRequestHeader(),
      method: 'POST',
      data: data,
      
      success: function (res) {
        wx.hideLoading();
        var resp = res.data;
        if (resp.code != 200) {
          app.alert({ "content": resp.msg });
          return;
        }
        wx.navigateTo({
          url: "/pages/my/order_list"
        });
      }
    });

  },
    //如果没有显示去光光按钮事件
    toIndexPage: function () {
        wx.switchTab({
            url: "/pages/lecture/index"
        });
    },
    //选中删除的数据
    deleteSelected: function () {
        var list = this.data.list;
        var goods = [];
        list = list.filter(function ( item ) {
            if( item.active ){
                goods.push( {
                    "id":item.food_id
                } )
            }
            return !item.active;
        });
        this.setPageData( this.getSaveHide(), this.allSelect(), this.noSelect(), list);
        //发送请求到后台删除数据
        wx.request({
            url: app.buildUrl("/cart/del"),
            header: app.getRequestHeader(),
            method: 'POST',
            data: {
                goods: JSON.stringify( goods )
            },
            success: function (res) {
            }
        });
    },
    getCartList: function () {
        var that = this;
        wx.request({
            url: app.buildUrl("/cart/index"),
            header: app.getRequestHeader(),
            success: function (res) {
                var resp = res.data;
                if (resp.code != 200) {
                    app.alert({"content": resp.msg});
                    return;
                }
                that.setData({
                    list:resp.data.list,
                    saveHidden: true,
                    allSelect: true,
                    noSelect: false
                });

                that.setPageData(that.getSaveHide(),that.allSelect(), that.noSelect(), that.data.list);
            }
        });
    },
    setCart:function( food_id, number ){
        var that = this;
        var data = {
            "id": food_id
        };
        wx.request({
            url: app.buildUrl("/cart/set"),
            header: app.getRequestHeader(),
            method: 'POST',
            data: data,
            success: function (res) {
            }
        });
    }
});
