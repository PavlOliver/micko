import os
from datetime import timedelta
from io import BytesIO

from flask import Blueprint, jsonify, request, send_file, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_required

from .models import Zamestnanec, Osoba
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
            if request.args.get('week'):
                this_week = int(request.args.get('week'))
            else:
                this_week = datetime.now().isocalendar().week
            current_year = datetime.now().year
            monday = datetime.strptime(f"{current_year}-W{this_week}-1", "%Y-W%W-%w").date()
            sunday = monday + timedelta(days=6)
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


@views.route('/profile_picture', methods=['GET'])
def profile_picture():
    file = Zamestnanec.query.filter_by(id_zamestnanca=select_current_user().id_zamestnanca).first().fotka
    if file:
        file_stream = BytesIO(file)
        return send_file(file_stream, mimetype='image/png')
    return jsonify({'error': 'No file found'})


@views.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == 'GET':
        if select_current_user():
            return jsonify({
                'username': select_current_user().login
                # 'picture': select_current_user().get_profile_picture()
            })
        return jsonify({'error': 'User not found'})
    else:
        if request.files:
            print(request.files['profile_picture'])
            file = request.files['profile_picture']
            if file:
                zamestnanec = Zamestnanec.query.filter_by(id_zamestnanca=select_current_user().id_zamestnanca).first()
                zamestnanec.fotka = file.read()
                db.session.commit()
                return jsonify({'message': 'Profile picture updated'})
        return jsonify({'error': 'No file found'})


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
            lekar_meno = Zamestnanec.query.filter_by(
                id_zamestnanca=select_current_user().id_zamestnanca).first().get_full_name()
            lekar_id = select_current_user().id_zamestnanca
            if pacient:
                return jsonify({
                    'pacient_meno': pacient_meno, 'pacient_id': pacient_id,
                    'username': lekar_login, 'lekar_id': lekar_id,
                    'lekar_meno': lekar_meno,
                })
            return jsonify({'error': 'Pacient not found'})
    return jsonify({'error': 'Invalid request method'})


@views.route('/user-management', methods=['GET', 'POST'])
@login_required
def user_management():
    current_user_log = select_current_user()
    print("Current user:", current_user_log, "Role:", current_user_log.rola if current_user_log else None)
    if not current_user_log or current_user_log.rola != 'A':
        return jsonify({'error': 'Unauthorized access'}), 403

    if request.method == 'POST':
        try:
            new_user = Pouzivatel(
                id_zamestnanca=request.json['id_zamestnanca'],
                login=request.json['login'],
                heslo=generate_password_hash(request.json['heslo']),
                rola=request.json['rola']
            )
            db.session.add(new_user)
            print(new_user)
            db.session.commit()
            return jsonify({'message': 'User created successfully'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    elif request.method == 'GET':
        try:
            users = db.session.query(
                Pouzivatel.id_zamestnanca,
                Pouzivatel.login,
                Pouzivatel.rola,
                Osoba.meno,
                Osoba.priezvisko,
                Osoba.rod_cislo
            ).join(
                Zamestnanec,
                Pouzivatel.id_zamestnanca == Zamestnanec.id_zamestnanca
            ).join(
                Osoba,
                Zamestnanec.rod_cislo == Osoba.rod_cislo
            ).all()

            # print("Debug - Users:", users) # Debug print

            return jsonify({
                'users': [{
                    'id': u.id_zamestnanca.strip(),
                    'login': u.login,
                    'rola': u.rola,
                    'meno': u.meno,
                    'priezvisko': u.priezvisko
                } for u in users]
            })

        except Exception as e:
            print("Database error:", str(e))  # Debug
            return jsonify({'error': str(e)}), 500


@views.route('/patients', methods=['GET'])
@login_required
def patients():
    if select_patients():
        return jsonify({'patients': select_patients(), 'username': select_current_user().login})
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
