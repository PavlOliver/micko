from flask import Blueprint, jsonify, request
from flask_login import login_required

from . import db
from .queries import select_current_user, select_current_doctor_schedule, insert_new_order, select_last_order

views = Blueprint('views', __name__)


@views.route('/home')
@login_required
def home():
    if select_current_user():
        return jsonify({'username': select_current_user().login})
    return jsonify({'error': 'User not found'})


@views.route('/orders', methods=['GET', 'POST'])
@login_required
def orders():
    if request.method == 'GET':
        if select_current_user():
            objednavky = select_current_doctor_schedule()
            return jsonify({'username': select_current_user().login, 'appointments': objednavky})
        return jsonify({'error': 'User not found'})
    else:
        print(request.json)
        insert_new_order(request.json['reason'], request.json['patient'], request.json['doctor'], request.json['room'],
                         request.json['blocks'], request.json['date'], request.json['time'])
        return jsonify({'message': 'Order created'})


@views.route('/last_order', methods=['GET', 'POST'])
@login_required
def last_order():
    if request.method == 'GET':
        if select_current_user():
            objednavka = select_last_order()
            return jsonify({'last_order': objednavka.to_dic()})
        return jsonify({'error': 'User not found'})
    else:
        new_order = insert_new_order(request.json['reason'], request.json['patient'], request.json['doctor'],
                                     request.json['room'],
                                     request.json['blocks'], request.json['date'], request.json['time'])
        return jsonify({'last_order': new_order.to_dic()})


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
