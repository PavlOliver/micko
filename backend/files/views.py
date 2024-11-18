import datetime

from flask import Blueprint, jsonify, request
from flask_login import login_required

from . import db
from .queries import select_current_user, select_current_doctor_orders, insert_new_order, select_last_order, \
    update_order, delete_order

views = Blueprint('views', __name__)


@views.route('/home')
@login_required
def home():
    if select_current_user():
        return jsonify({'username': select_current_user().login})
    return jsonify({'error': 'User not found'})


@views.route('/orders', methods=['GET', 'PUT', 'DELETE', 'POST'])
@login_required
def orders():
    """This route is used for managing orders
    GET - returns all orders of the current user (doctor)
    POST - creates a new order
    PUT - updates an order
    DELETE - deletes an order"""
    if request.method == 'GET':
        if select_current_user():
            if request.args.get('week'):
                this_week = int(request.args.get('week'))
            else:
                this_week = datetime.datetime.now().isocalendar().week
            current_year = datetime.datetime.now().year
            monday = datetime.datetime.strptime(f"{current_year}-W{this_week}-1", "%Y-W%W-%w").date()
            sunday = monday + datetime.timedelta(days=6)
            objednavky = select_current_doctor_orders(this_week)
            return jsonify(
                {'username': select_current_user().login,
                 'appointments': objednavky,
                 'week': this_week,
                 'monday': monday.strftime('%d.%m.%Y'),
                 'sunday': sunday.strftime('%d.%m.%Y')})
    elif request.method == 'POST':
        new_order = insert_new_order(request.json['reason'], request.json['patient'], request.json['doctor'],
                                     request.json['room'],
                                     request.json['blocks'], request.json['date'], request.json['time'])
        return jsonify({'last_order': new_order.to_dic()})
    elif request.method == 'PUT':
        print(request.json)
        edited_order = update_order(request.json['id'], request.json['reason'], request.json['patient'],
                                    request.json['doctor'],
                                    request.json['room'],
                                    request.json['blocks'], request.json['date'], request.json['time'])
        return jsonify({'updated_order': edited_order.to_dic()})
    elif request.method == 'DELETE':
        delete_order(request.json['id'])
        return jsonify({'message': 'Order deleted'})
    return jsonify({'error': 'User not found'})


@views.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == 'GET':
        if select_current_user():
            return jsonify({'username': select_current_user().login})
        return jsonify({'error': 'User not found'})
    else:
        new_password = request.json['new_password']
        select_current_user().heslo = new_password
        db.session.commit()
        return jsonify({'message': 'Profile updated'})
