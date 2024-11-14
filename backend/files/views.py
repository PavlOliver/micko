from flask import Blueprint, jsonify, request
from flask_login import login_required

from . import db
from .models import Pacient, Zamestnanec
from .queries import *

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
            objednavky = select_current_doctor_orders()
            return jsonify({'username': select_current_user().login, 'appointments': objednavky})
    elif request.method == 'POST':
        new_order = insert_new_order(request.json['reason'], request.json['patient'], request.json['doctor'],
                                     request.json['room'],
                                     request.json['blocks'], request.json['date'], request.json['time'])
        return jsonify({'last_order': new_order.to_dic()})
    elif request.method == 'PUT':
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

@views.route('/pacient/<id_poistenca>/recepty', methods=['GET', 'POST'])
@login_required
def add_recept(id_poistenca):
    if request.method == 'POST':
        print(request.json)
        try:
            new_recept = insert_new_recept(
                liek=request.json['liek'],
                pacient=request.json['pacient'],
                lekar=request.json['lekar'],
                pocet=request.json['pocet'],
                poznamka=request.json['poznamka'],
                vystavenie=datetime.now()
            )
            return jsonify({'message': 'Recept created'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    elif request.method == 'GET':
        if select_current_user():
            pacient = Pacient.query.filter_by(id_poistenca=id_poistenca).first()
            pacient_meno = pacient.get_full_name()
            pacient_id = pacient.id_poistenca
            lekar_login = select_current_user().login
            lekar_meno = Zamestnanec.query.filter_by(id_zamestnanca=select_current_user().id_zamestnanca).first().get_full_name()
            lekar_id = select_current_user().id_zamestnanca
            if pacient:
                return jsonify({
                    'pacient_meno': pacient_meno, 'pacient_id': pacient_id,
                    'username': lekar_login, 'lekar_id': lekar_id,
                    'lekar_meno': lekar_meno,
                })
            return jsonify({'error': 'Pacient not found'})
    return jsonify({'error': 'Invalid request method'})
