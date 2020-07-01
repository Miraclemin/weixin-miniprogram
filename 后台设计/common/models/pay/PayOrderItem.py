# coding: utf-8
from sqlalchemy import BigInteger, Column, DateTime, Integer, Numeric, Text
from sqlalchemy.schema import FetchedValue
from application import db,app


class PayOrderItem(db.Model):
    __tablename__ = 'pay_order_item'

    id = db.Column(db.Integer, primary_key=True)
    pay_order_id = db.Column(db.Integer, nullable=True, index=True, server_default=db.FetchedValue())
    member_id = db.Column(db.BigInteger, nullable=False, server_default=db.FetchedValue())
    lecture_time = db.Column(db.String(100), nullable=False, server_default=db.FetchedValue())
    speaker = db.Column(db.String(100), nullable=False, server_default=db.FetchedValue())
    food_id = db.Column(db.Integer, nullable=False, index=True,server_default=db.FetchedValue())
    note = db.Column(db.Text, nullable=True)
    status = db.Column(db.Integer, nullable=False, server_default=db.FetchedValue())
    updated_time = db.Column(db.DateTime, nullable=False, server_default=db.FetchedValue())
    created_time = db.Column(db.DateTime, nullable=False, server_default=db.FetchedValue())
    speaker_address = db.Column(db.String(100), nullable=False,server_default=db.FetchedValue())
    pay_time = db.Column(db.DateTime, nullable=False, server_default=db.FetchedValue())
    comment_status = db.Column(db.Integer, nullable=True, server_default=db.FetchedValue())
    prepay_id = db.Column(db.String(128), nullable=True, server_default=db.FetchedValue())
    p_status = db.Column(db.Integer, nullable=True, server_default=db.FetchedValue())
    
    
    
    
    @property
    def pay_status(self):
        tmp_status = self.p_status
        if self.p_status == 1:
    #            tmp_status = self.express_status
            if self.comment_status == 0:
                tmp_status = -5
            if self.comment_status == 1:
                tmp_status = 1
        return tmp_status

    @property
    def status_desc(self):
        return app.config['PAY_STATUS_DISPLAY_MAPPING'][ str( self.pay_status )]
