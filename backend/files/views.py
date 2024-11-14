from flask import Blueprint, jsonify, request
from flask_login import login_required

from . import db
from .models import Pacient
from .queries import select_current_user, select_current_doctor_schedule, insert_new_order, select_last_order, \
    select_patients

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

@views.route('/patients', methods=['GET'])
@login_required
def patients():
    if select_patients():
        return jsonify({'patients': select_patients()})
    return jsonify({'error': 'Patients not found'})

@views.route('/search_patients', methods=['GET'])
@login_required
def search_patients():
    try:
        ID_Poistenca = request.args.get('ID_Poistenca')
        rodne_cislo = request.args.get('rodne_cislo')
        vek = request.args.get('vek')
        adresa = request.args.get('adresa')

        # Logovanie parametrov
        print(f"Received parameters: meno={ID_Poistenca}, rodne_cislo={rodne_cislo}, vek={vek}, adresa={adresa}")

        # Vyhľadávacie filtre na základe parametrov
        query = Pacient.query
        if ID_Poistenca:
            query = query.filter(Pacient.id_poistenca.ilike(f'%{ID_Poistenca}%'))
        if rodne_cislo:
            query = query.filter(Pacient.rod_cislo.ilike(f'%{rodne_cislo}%'))
        if vek:
            query = query.filter(Pacient.vek == vek)
        if adresa:
            query = query.filter(Pacient.adresa.ilike(f'%{adresa}%'))

        # Získanie pacientov
        patients = query.all()

        # Logovanie odpovede
        print(f"Found patients: {patients}")

        # Vrátenie pacientov ako JSON
        return jsonify({'patients': [patient.to_dic() for patient in patients]})

    except Exception as e:
        # Logovanie chyby
        print(f"Error: {e}")
        return jsonify({'error': 'An internal error occurred'}), 500
