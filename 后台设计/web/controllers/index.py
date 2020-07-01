# -*- coding: utf-8 -*-
from application import  app,db
from flask import Blueprint
from common.libs.Helper import ops_render
from common.libs.Helper import getFormatDate
from common.models.stat.StatDailySite import StatDailySite
from common.models.food.Food import Food
from common.models.member.Member import Member
from common.models.food.FoodCat import FoodCat
from common.models.member.MemberComments import MemberComments

import datetime
route_index = Blueprint( 'index_page',__name__ )

@route_index.route("/")
def index():
    resp_data = {
        'data':{
            'member': {
                'count': 0
            },
            'order': {
                'count':0
            },
            'cat':{
            'count':0
            },
            'cart':{
            'count':0
            }
        }
    }

    resp_data['data']['member']['count']=Member.query.count()
    resp_data['data']['order']['count']=Food.query.count()
   
    resp_data['data']['cat']['count']=FoodCat.query.filter_by(status=1).count()

    resp_data['data']['cart']['count']=MemberComments.query.count()
    # now = datetime.datetime.now()
    # date_before_30days = now + datetime.timedelta( days = -30 )
    # date_from = getFormatDate( date = date_before_30days,format = "%Y-%m-%d" )
    # date_to = getFormatDate( date = now ,format = "%Y-%m-%d")

    # list = StatDailySite.query.filter(  StatDailySite.date >= date_from)\
    #     .filter( StatDailySite.date <= date_to ).order_by( StatDailySite.id.asc() )\
    #     .all()
    # data = resp_data['data']
    # if list:

    #     for item in list:
    #         data['finance']['month'] += item.total_pay_money
    #         data['member']['month_new'] += item.total_new_member_count
    #         data['member']['total'] = item.total_member_count
    #         data['order']['month'] += item.total_order_count
    #         data['shared']['month'] += item.total_shared_count
    #         if getFormatDate( date = item.date ,format = "%Y-%m-%d") == date_to:
    #             data['finance']['today'] = item.total_pay_money
    #             data['member']['today_new'] = item.total_new_member_count
    #             data['order']['today'] = item.total_order_count
    #             data['shared']['today'] = item.total_shared_count

    return ops_render( "index/index.html",resp_data )
