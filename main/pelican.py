import flask, flask.views
from flask import url_for, request, session, redirect, jsonify, Response, make_response, current_app
from jinja2 import environment, FileSystemLoader
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.ext.orderinglist import ordering_list
from sqlalchemy import Boolean
from sqlalchemy import or_
from sqlalchemy import func
from flask.ext import admin
from flask.ext.admin.contrib import sqla
from flask.ext.admin.contrib.sqla import ModelView
from flask.ext.admin import Admin, BaseView, expose
from dateutil.parser import parse as parse_date
from flask import render_template, request
from flask import session, redirect
from datetime import timedelta
from datetime import datetime
from functools import wraps, update_wrapper
import threading
from threading import Timer
from multiprocessing.pool import ThreadPool
import calendar
from calendar import Calendar
from time import sleep
import requests
import datetime
from datetime import date
import time
import json
import uuid
import random
import string
import smtplib
from email.mime.text import MIMEText as text
import os
import schedule
from werkzeug.utils import secure_filename
from tasks import blast_sms, send_reminders, upload_contacts
import db_conn
from db_conn import db, app
from models import *
import xlrd
import math

IPP_URL = 'https://devapi.globelabs.com.ph/smsmessaging/v1/outbound/%s/requests'
ALSONS_APP_ID = 'MEoztReRyeHzaiXxaecR65HnqE98tz9g'
ALSONS_APP_SECRET = '01c5d1f8d3bfa9966786065c5a2d829d7e84cf26fbfb4a47c91552cb7c091608'
ALSONS_PASSPHRASE = 'PF5H8S9t7u'
ALSONS_SHORTCODE = '21586853'

ALLOWED_EXTENSIONS = set(['xls', 'xlsx', 'csv'])
UPLOAD_FOLDER = 'static/records'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

class IngAdmin(sqla.ModelView):
    column_display_pk = True

class SchoolAdmin(sqla.ModelView):
    column_display_pk = True
    column_include_list = ['api_key', 'name', 'url', 'address', 'city', 'email', 'tel']

class StudentAdmin(sqla.ModelView):
    column_display_pk = True
    column_searchable_list = ['first_name', 'last_name', 'middle_name', 'id_no']

admin = Admin(app, name='raven')
admin.add_view(SchoolAdmin(Client, db.session))
admin.add_view(SchoolAdmin(AdminUser, db.session))
admin.add_view(SchoolAdmin(Raffle, db.session))
admin.add_view(SchoolAdmin(Shopper, db.session))
admin.add_view(SchoolAdmin(RaffleShopper, db.session))
admin.add_view(SchoolAdmin(RaffleEntry, db.session))

def nocache(view):
    @wraps(view)
    def no_cache(*args, **kwargs):
        response = make_response(view(*args, **kwargs))
        response.headers['Last-Modified'] = datetime.datetime.now()
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
        return response    
    return update_wrapper(no_cache, view)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_api_key():
    unique = False
    while unique == False:
        api_key = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(32))
        existing = AdminUser.query.filter_by(api_key=api_key).first()
        if not existing or existing == None:
            unique = True
    return api_key

def send_message(address,shortcode,app_id,app_secret,passphrase,message):
    message_options = {
        'app_id': app_id,
        'app_secret': app_secret,
        'message': message,
        'address': address,
        'passphrase': passphrase
    }
    try:
        r = requests.post(IPP_URL%shortcode,message_options)
        if r.status_code != 201:
            return jsonify(status='failed')
        return jsonify(status='success')

    except requests.exceptions.ConnectionError as e:
        return jsonify(
            status='failed',
            message='Something went wrong, please try again.'
            )


@app.route('/',methods=['GET','POST'])
@nocache
def index():
    if not session:
        return redirect('/login')
    session['raffles_limit'] = 50
    session['prizes'] = []
    session['brands'] = []
    total_entries = Raffle.query.filter_by(client_no=session['client_no']).count()
    raffles = Raffle.query.filter_by(client_no=session['client_no']).order_by(Raffle.created_at.desc()).slice(session['raffles_limit'] - 50, session['raffles_limit'])

    user = AdminUser.query.filter_by(id=session['user_id']).first()
    if user.password == user.temp_pw:
        change_pw = 'yes'
    else:
        change_pw = 'no'

    client = Client.query.filter_by(client_no=session['client_no']).first()
    bill = Bill.query.filter_by(date=datetime.datetime.now().strftime('%B, %Y'), client_no=session['client_no']).first()

    if not bill or bill == None:
        bill = Bill(
            date=datetime.datetime.now().strftime('%B, %Y'),
            year=datetime.datetime.now().strftime('%Y'),
            client_no=session['client_no'],
            created_at=datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S:%f'),
            transactions=0,
            price='0'
            )
        db.session.add(bill)
        db.session.commit()

    if total_entries < 50:
        return flask.render_template(
        'index.html',
        client_name=session['client_name'],
        user_name=session['user_name'],
        raffles=raffles,
        limit=total_entries,
        total_entries=total_entries,
        prev_btn='disabled',
        next_btn='disabled',
        change_pw=change_pw,
        user_role=user.role
    )
    return flask.render_template(
        'index.html',
        client_name=session['client_name'],
        user_name=session['user_name'],
        raffles=raffles,
        limit=session['raffles_limit'],
        total_entries=total_entries,
        prev_btn='disabled',
        next_btn='enabled',
        change_pw=change_pw,
        user_role=user.role
    )


@app.route('/login',methods=['GET','POST'])
@nocache
def login_page():
    if session:
        return redirect('/')
    return flask.render_template('login.html')


@app.route('/user/authenticate',methods=['GET','POST'])
def authenticate_user():
    data = flask.request.form.to_dict()
    client = Client.query.filter_by(client_no=data['client_no']).first()
    if not client or client == None:
        return jsonify(status='failed', error='Invalid client number.')
    user = AdminUser.query.filter_by(email=data['user_email'],password=data['user_password'],client_no=data['client_no']).first()
    if not user or user == None:
        return jsonify(status='failed', error='Invalid email or password.')
    session['user_name'] = user.name
    session['user_id'] = user.id
    session['client_no'] = client.client_no
    session['client_name'] = client.name

    return jsonify(status='success', error=''),200


@app.route('/logout', methods=['GET', 'POST'])
def logout():
    session.clear()
    return redirect('/login')


@app.route('/webhooks/globe',methods=['GET','POST'])
def globe_webook():
    data = request.json['inboundSMSMessageList']['inboundSMSMessage'][0]
    shortcode = data['destinationAddress'][-8:]
    client = Client.query.filter_by(shortcode=shortcode).first()
    if not client or client == None:
        return jsonify(
            status='failed',
            message='Invalid shortcode'
            ),422
    client_code = data['message'].split()[0]
    
    if client_code.lower() != client.client_code.lower():
        send_message(
            '0%s' % data['senderAddress'][-10:],
            client.shortcode,
            client.app_id,
            client.app_secret,
            client.passphrase,
            '%s is not a valid keyword. Please try again.' % data['message'].split()[0]
            )
        return jsonify(
            status='success',
            message='Message processed successfully.'
            ),200

    raffle = Raffle.query.filter(Raffle.client_no==client.client_no,func.lower(Raffle.title)==func.lower(data['message'].split()[1])).first()
    if not raffle or raffle == None:
        send_message(
            '0%s' % data['senderAddress'][-10:],
            client.shortcode,
            client.app_id,
            client.app_secret,
            client.passphrase,
            '%s is not a valid keyword. Please try again.' % data['message'].split()[1]
            )
        return jsonify(
            status='success',
            message='Message processed successfully.'
            ),200

    if data['message'].split()[2].lower() != 'reg':
        if data['message'].split()[2].lower() == 'help':
            send_message(
                '0%s' % data['senderAddress'][-10:],
                client.shortcode,
                client.app_id,
                client.app_secret,
                client.passphrase,
                raffle.description
                )
            return jsonify(
                status='success',
                message='Message processed successfully.'
                ),200

        shopper = Shopper.query.filter_by(client_no=client.client_no,msisdn='0%s' % data['senderAddress'][-10:]).first()
        if not shopper or shopper == None:
            send_message(
                '0%s' % data['senderAddress'][-10:],
                client.shortcode,
                client.app_id,
                client.app_secret,
                client.passphrase,
                ('Sorry, but you are not yet registered to %s %s raffle promo. To validate '
                 'your entries and qualify for this raffle, please register first by texting %s '
                 'PROMO-TITLE REG <name/complete address/birthday MMDDYY>. Example: %s %s REG '
                 'Amadeo L. Vertigo/112 Roxas Street, Davao City/020287. Get a chance to win %s ' 
                 'and other exciting prizes! Hotline %s. Promo period %s until %s. Per DTI %s') % \
                 (client.client_code, raffle.title, client.client_code, client.client_code,\
                    raffle.title, raffle.grand_prize, client.shortcode, raffle.start_date,\
                    raffle.end_date, raffle.dti_permit)
                )
            return jsonify(
                status='success',
                message='Message processed successfully.'
                ),200

        promo_code = data['message'].split()[2]
        # VALIDATE PROMO CODE HERE
        if not existing_promocode or existing_promocode == None:
            send_message(
                '0%s' % data['senderAddress'][-10:],
                client.shortcode,
                client.app_id,
                client.app_secret,
                client.passphrase,
                ('The promo code you sent for %s %s is not valid. Please check and send again to %s. '
                'For more details, call or text hotline %s or visit any LCC store nearest to you. Thank you.') % \
                (client.client_code, raffle.title, client.shortcode, client.hotline)
                )
            return jsonify(
                status='success',
                message='Message processed successfully.'
                ),200


    elif data['message'].split()[2].lower() == 'reg':
        name = data['message'].lower().split('reg ')[1].split('/')[0].title()
        address = data['message'].lower().split('reg ')[1].split('/')[1].title()
        birthday_raw = data['message'].lower().split('reg ')[1].split('/')[2]
        birthday_clean = datetime.datetime.strptime(birthday_raw, '%m%d%y').strftime('%B %d, %Y')

        shopper = Shopper.query.filter_by(client_no=client.client_no,msisdn='0%s' % data['senderAddress'][-10:]).first()
        if not shopper or shopper == None:
            shopper = Shopper(
                client_no=client.client_no,
                name=name,
                msisdn='0%s' % data['senderAddress'][-10:],
                address=address,
                birthday=birthday_clean,
                join_date=datetime.datetime.now().strftime('%B %d, %Y'),
                created_at=datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S:%f')
                )
            db.session.add(shopper)
            db.session.commit()
        shopper.name = name
        shopper.address = address
        db.session.commit()

        raffle_shopper = RaffleShopper.query.filter_by(raffle_id=raffle.id, shopper_id=shopper.id).first()

        if not raffle_shopper or raffle_shopper == None:

            raffle_shopper = RaffleShopper(
                client_no=client.client_no,
                raffle_id=raffle.id, 
                shopper_id=shopper.id,
                register_date=datetime.datetime.now().strftime('%B %d, %Y'),
                register_time=time.strftime("%I:%M %p"),
                created_at=datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S:%f')
                )

            db.session.add(raffle_shopper)
            db.session.commit()

            send_message(
                '0%s' % data['senderAddress'][-10:],
                client.shortcode,
                client.app_id,
                client.app_secret,
                client.passphrase,
                ('Thank you for registering to the %s %s raffle promo! You may win %s and other '
                'exciting prizes! Text %s %s HELP to %s for more information on how to join. '
                'Hotline %s. Promo period: %s until %s. Per DTI R5 Permint No. %s') % \
                (client.client_code, raffle.title, raffle.grand_prize, client.client_code,\
                    raffle.title, client.shortcode, client.hotline, raffle.start_date,\
                    raffle.end_date, raffle.dti_permit)
                )
            return jsonify(
                status='success',
                message='Message processed successfully.'
                ),200
        send_message(
            '0%s' % data['senderAddress'][-10:],
            client.shortcode,
            client.app_id,
            client.app_secret,
            client.passphrase,
            'You are already registered to %s %s. For more info, text %s %s HELP to %s.' % \
            (client.client_code, raffle.title, client.client_code, raffle.title, client.shortcode)
            )
        return jsonify(
            status='success',
            message='Message processed successfully.'
            ),200
    else:
        send_message(
            '0%s' % data['senderAddress'][-10:],
            client.shortcode,
            client.app_id,
            client.app_secret,
            client.passphrase,
            'Invalid text format. For more info, please text %s %s HELP to %s' % \
            (client.client_code, raffle.title, client.shortcode)
            )
        return jsonify(
            status='success',
            message='Message processed successfully.'
            ),200


@app.route('/raffles',methods=['GET','POST'])
def show_raffles():
    slice_from = flask.request.args.get('slice_from')
    prev_btn = 'enabled'
    if slice_from == 'reset':
        session['raffles_limit'] = 50
        prev_btn = 'disabled'
    total_entries = Raffle.query.filter_by(client_no=session['client_no']).count()
    raffles = Raffle.query.filter_by(client_no=session['client_no']).order_by(Raffle.created_at.desc()).slice(session['raffles_limit'] - 50, session['raffles_limit'])

    if total_entries < 50:
        showing='1 - %s' % total_entries
        prev_btn = 'disabled'
        next_btn='disabled'
    else:
        diff = total_entries - (session['raffles_limit'] - 50)
        if diff > 50:
            showing = '%s - %s' % (str(session['raffles_limit'] - 49),str(session['raffles_limit']))
            next_btn='enabled'
        else:
            showing = '%s - %s' % (str(session['raffles_limit'] - 49),str((session['raffles_limit']-50)+diff))
            prev_btn = 'enabled'
            next_btn='disabled'

    return flask.render_template(
        'raffles.html',
        raffles=raffles,
        showing=showing,
        total_entries=total_entries,
        prev_btn=prev_btn,
        next_btn=next_btn,
    )


@app.route('/raffle/prize/save',methods=['GET','POST'])
def add_prize():
    data = flask.request.form.to_dict()
    prize_id = str(uuid.uuid4().fields[-1])[:5]
    if session['prizes'] == []:
        session['prizes'] = [{
            'id':prize_id,
            'label':data['label'],
            'prize':data['prize'],
            'created_at': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S:%f')
        }]
    else:
        session['prizes'].append({
                'id':prize_id,
                'label':data['label'],
                'prize':data['prize'],
                'created_at': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S:%f')
            })
    return jsonify(
        template=flask.render_template(
            'prizes.html',
            id=prize_id,
            label=data['label'],
            prize=data['prize'],
            ),
        item_count=len(session['prizes'])
        )


@app.route('/raffle/brand/save',methods=['GET','POST'])
def add_brand():
    data = flask.request.form.to_dict()
    brand_id = str(uuid.uuid4().fields[-1])[:5]
    if session['brands'] == []:
        session['brands'] = [{
            'id':brand_id,
            'name':data['name'],
            'code':data['code'],
            'created_at': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S:%f')
        }]
    else:
        session['brands'].append({
                'id':brand_id,
                'name':data['name'],
                'code':data['code'],
                'created_at': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S:%f')
            })
    return jsonify(
        template=flask.render_template(
            'brands.html',
            id=brand_id,
            name=data['name'],
            code=data['code'],
            ),
        item_count=len(session['brands'])
        )


@app.route('/raffle/brand/clear',methods=['GET','POST'])
def clear_rbands():
    session['brands'] = []
    return jsonify(status='success'),201


@app.route('/raffle/prize/clear',methods=['GET','POST'])
def clear_prizes():
    session['prizes'] = []
    return jsonify(status='success'),201


@app.route('/db/rebuild',methods=['GET','POST'])
def rebuild_database():
    db.drop_all()
    db.create_all()
    client = Client(
        client_no='lcc2018',
        name='LCC, Inc.',
        client_code='LCC',
        app_id='EGXMuB5eEgCMLTKxExieqkCGeGeGuBon',
        app_secret='f3e1ab30e23ea7a58105f058318785ae236378d1d9ebac58fe8b42e1e239e1c3',
        passphrase='24BUubukMQ',
        shortcode='21588479',
        hotline='373-1631',
        created_at=datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S:%f')
        )

    admin = AdminUser(
        client_no='lcc2018',
        email='hello@pisara.tech',
        password='ratmaxi8',
        api_key=generate_api_key(),
        name='Super Admin',
        role='Administrator',
        join_date=datetime.datetime.now().strftime('%B %d, %Y'),
        added_by_name='None',
        created_at=datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S:%f')
        )

    raffle = Raffle(
        client_no='lcc2018',
        name='Win A Million 2018',
        title='WIN-A-MILLION',
        description='This will appear as the reply for HELP.',
        auto_draw=False,
        limited_slots=False,
        participants=0,
        created_by_id=1,
        created_by_name='Super Admin',
        created_date=datetime.datetime.now().strftime('%B %d, %Y'),
        created_time=time.strftime("%I:%M %p"),
        start_date=datetime.datetime.now().strftime('%B %d, %Y'),
        end_date='December 25, 2018',
        dti_permit='1234',
        winner_count=5,
        grand_prize='Php 1,000,000',
        min_purchase_req='1000',
        created_at=datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S:%f')
        )

    db.session.add(client)
    db.session.add(admin)
    db.session.add(raffle)
    db.session.commit()

    return jsonify(
        status = 'success'
        ), 201


if __name__ == '__main__':
    app.run(port=5000,debug=True,host='0.0.0.0')
    # port=int(os.environ['PORT']), host='0.0.0.0'