# -*- coding: utf-8 -*-
import hashlib,time,random,decimal,json
from application import  app,db
from common.models.food.Food import Food
from common.models.food.FoodSaleChangeLog import FoodSaleChangeLog
from common.models.pay.PayOrder import PayOrder
from common.models.pay.PayOrderItem import PayOrderItem
from common.models.pay.PayOrderCallbackData import PayOrderCallbackData
from common.libs.Helper import getCurrentDate
from common.libs.queue.QueueService import QueueService
from common.libs.food.FoodService import FoodService
class PayService():
    def __init__(self):
        pass
    def createOrder(self,member_id,items = None,params = None):
        resp = {'code': 200, 'msg': '操作成功~', 'data': {}}
        continue_cnt = 0
        food_ids = []
        for item in items:
            food_ids.append( item['id'] )
        if continue_cnt >= len(items ) :
            resp['code'] = -1
            resp['msg'] = '商品items为空~~'
            return resp
        note = params['note'] if params and 'note' in params else ''
        try:
            #为了防止并发库存出问题了，我们坐下selectfor update, 这里可以给大家演示下
            tmp_food_list = db.session.query( Food ).filter( Food.id.in_( food_ids ) )\
                .with_for_update().all()
            for item in items:
                exist_food_id = PayOrderItem.query.filter_by( member_id = member_id,food_id = item['id'] ).first()
                if exist_food_id:
                    resp['code'] = -1
                    resp['msg'] = '讲座已经完成，请直接去"我的讲座"评论'
                    return resp

                tmp_pay_item = PayOrderItem()
                tmp_pay_item.member_id = member_id
                tmp_pay_item.p_status = 1
                tmp_pay_item.speaker = item['speaker']
                tmp_pay_item.food_id = item['id']
                tmp_pay_item.lecture_time = item['lecture_time']
                tmp_pay_item.prepay_id = 0
                tmp_pay_item.comment_status = 0
                tmp_pay_item.speaker_address = item['speaker_address']
                tmp_pay_item.pay_time = tmp_pay_item.updated_time = tmp_pay_item.created_time = getCurrentDate()
                db.session.add( tmp_pay_item )
                db.session.flush()

            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print( e )
            resp['code'] = -1
            resp['msg'] = "失败,请重新选择"
            resp['msg'] = str(e)
            return resp
        return resp

    def closeOrder(self,pay_order_item_id = 0):
        pay_order_item_info = PayOrderItem.query.filter_by( id = pay_order_item_id ).first()
        pay_order_item_info.p_status = 0
        pay_order_item_info.updated_time = getCurrentDate()
        db.session.add( pay_order_item_info )
        db.session.commit()
        return True
        
    def orderSuccess(self,pay_order_id = 0,params = None):
        try:
            pay_order_info = PayOrder.query.filter_by( id = pay_order_id ).first()
            if not pay_order_info or pay_order_info.status not in [ -8,-7 ]:
                return True

            pay_order_info.pay_sn = params['pay_sn'] if params and 'pay_sn' in params else ''
            pay_order_info.status = 1
            pay_order_info.express_status = -7
            pay_order_info.updated_time = getCurrentDate()
            db.session.add( pay_order_info  )
            pay_order_items = PayOrderItem.query.filter_by( pay_order_id = pay_order_id ).all()
            for order_item in pay_order_items:
                tmp_model_sale_log = FoodSaleChangeLog()
                tmp_model_sale_log.food_id = order_item.food_id
                tmp_model_sale_log.quantity = order_item.quantity
                tmp_model_sale_log.price = order_item.price
                tmp_model_sale_log.member_id = order_item.member_id
                tmp_model_sale_log.created_time = getCurrentDate()
                db.session.add( tmp_model_sale_log )

            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(e)
            return False

        #加入通知队列，做消息提醒和
        QueueService.addQueue( "pay",{
            "member_id": pay_order_info.member_id,
            "pay_order_id":pay_order_info.id
        })
        return True

    def addPayCallbackData(self,pay_order_id = 0,type = 'pay',data = ''):
        model_callback = PayOrderCallbackData()
        model_callback.pay_order_id = pay_order_id
        if type == "pay":
            model_callback.pay_data = data
            model_callback.refund_data = ''
        else:
            model_callback.refund_data = data
            model_callback.pay_data = ''

        model_callback.created_time = model_callback.updated_time = getCurrentDate()
        db.session.add( model_callback )
        db.session.commit()
        return True

    def geneOrderSn(self):
        m = hashlib.md5()
        sn = None
        while True:
            str = "%s-%s"%( int( round( time.time() * 1000) ),random.randint( 0,9999999 ) )
            m.update(str.encode("utf-8"))
            sn = m.hexdigest()
            if not PayOrder.query.filter_by( order_sn = sn  ).first():
                break
        return sn
