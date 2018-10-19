import flask
from flask import request
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.ext.orderinglist import ordering_list
from sqlalchemy import Boolean
from db_conn import db, app
import json

class Serializer(object):
  __public__ = None

  def to_serializable_dict(self):
    dict = {}
    for public_key in self.__public__:
      value = getattr(self, public_key)
      if value:
        dict[public_key] = value
    return dict

class SWEncoder(json.JSONEncoder):
  def default(self, obj):
    if isinstance(obj, Serializer):
      return obj.to_serializable_dict()
    if isinstance(obj, (datetime)):
      return obj.isoformat()
    return json.JSONEncoder.default(self, obj)

def SWJsonify(*args, **kwargs):
  return app.response_class(json.dumps(dict(*args, **kwargs), cls=SWEncoder, 
         indent=None if request.is_xhr else 2), mimetype='application/json')
        # from https://github.com/mitsuhiko/flask/blob/master/flask/helpers.py

class Client(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    client_no = db.Column(db.String(32), unique=True)
    name = db.Column(db.String(50))
    client_code = db.Column(db.String(32), unique=True)
    app_id = db.Column(db.Text())
    app_secret = db.Column(db.Text())
    passphrase = db.Column(db.Text())
    shortcode = db.Column(db.String(30))
    hotline = db.Column(db.String(30))
    created_at = db.Column(db.String(50))

class AdminUser(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    client_no = db.Column(db.String(32))
    email = db.Column(db.String(60))
    password = db.Column(db.String(20))
    api_key = db.Column(db.String(32))
    temp_pw = db.Column(db.String(20))
    name = db.Column(db.String(100))
    role = db.Column(db.String(30))
    added_by_id = db.Column(db.Integer)
    added_by_name = db.Column(db.String(100))
    join_date = db.Column(db.String(50))
    created_at = db.Column(db.String(50))

class Raffle(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    client_no = db.Column(db.String(32))
    name = db.Column(db.String(50))
    title = db.Column(db.String(50))
    description = db.Column(db.Text())
    auto_draw = db.Column(db.Boolean(), default=False)
    limited_slots = db.Column(db.Boolean())
    vacant_slots = db.Column(db.String(30))
    participants = db.Column(db.Integer, default=0)
    created_by_id = db.Column(db.Integer)
    created_by_name = db.Column(db.String(100))
    created_date = db.Column(db.String(20))
    created_time = db.Column(db.String(10))
    drawn_by_id = db.Column(db.Integer)
    drawn_by_name = db.Column(db.String(100))
    draw_date = db.Column(db.String(20))
    draw_time = db.Column(db.String(10))
    start_date = db.Column(db.String(20))
    end_date = db.Column(db.String(20))
    dti_permit = db.Column(db.String(60))
    winner_count = db.Column(db.Integer)
    grand_prize = db.Column(db.String(60))
    min_purchase_req = db.Column(db.String(10))
    ref_key = db.Column(db.String(12))
    status = db.Column(db.String(10),default='Pending')
    created_at = db.Column(db.String(50))

class RaffleBrand(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    client_no = db.Column(db.String(32))
    raffle_id = db.Column(db.Integer)
    brand_name = db.Column(db.String(60))
    brand_code = db.Column(db.String(60))
    created_at = db.Column(db.String(50))

class RafflePrize(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    client_no = db.Column(db.String(32))
    raffle_id = db.Column(db.Integer)
    prize_label = db.Column(db.String(60))
    prize = db.Column(db.Text())
    created_at = db.Column(db.String(50))

class Shopper(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    client_no = db.Column(db.String(32))
    name = db.Column(db.String(100))
    msisdn = db.Column(db.String(20))
    address = db.Column(db.Text())
    birthday = db.Column(db.String(20))
    join_date = db.Column(db.String(20))
    created_at = db.Column(db.String(50))

class RaffleShopper(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    client_no = db.Column(db.String(32))
    raffle_id = db.Column(db.Integer)
    shopper_id = db.Column(db.Integer)
    register_date = db.Column(db.String(20))
    register_time = db.Column(db.String(10))
    entries = db.Column(db.Integer())
    created_at = db.Column(db.String(50))

class RaffleEntry(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    client_no = db.Column(db.String(32))
    raffle_id = db.Column(db.Integer)
    shopper_id = db.Column(db.Integer)
    created_at = db.Column(db.String(50))

class Bill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_no = db.Column(db.String(32))
    date = db.Column(db.String(60))
    year = db.Column(db.String(10))
    transactions = db.Column(db.Integer())
    price = db.Column(db.String(30))
    created_at = db.Column(db.String(50))
    receipt_path = db.Column(db.Text(), default='')