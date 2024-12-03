import os
from datetime import timedelta
from io import BytesIO

from flask import Blueprint, jsonify, request, send_file, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_required

from . import db
from .models import Pacient, Zamestnanec, Pouzivatel, Osoba, Hospitalizacia
from .models import Zamestnanec, Osoba, Specializacia
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
        print(request.form)
        if request.form.get('new_password') and request.form.get('old_password'):
            print(select_current_user().heslo)
            if check_password_hash(select_current_user().heslo, request.form['old_password']):
                select_current_user().heslo = generate_password_hash(request.form['new_password'])
                db.session.commit()
                return jsonify({'message': 'Password updated'})
            return jsonify({'error': 'Invalid password'})
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
        to_return = select_patient_and_doctor_data(id_poistenca)
        if to_return:
            return jsonify(to_return)
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
        print(select_patients())
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

        print(f"Received parameters: meno={ID_Poistenca}, rodne_cislo={rodne_cislo}, vek={vek}, adresa={adresa}")

        query = Pacient.query
        if ID_Poistenca:
            query = query.filter(Pacient.id_poistenca.ilike(f'%{ID_Poistenca}%'))
        if rodne_cislo:
            query = query.filter(Pacient.rod_cislo.ilike(f'%{rodne_cislo}%'))
        if adresa:
            query = query.join(Osoba).filter(Osoba.adresa.ilike(f'%{adresa}%'))

        patients = query.all()

        # Filter by age after fetching
        if vek:
            vek = int(vek)
            patients = [
                patient for patient in patients
                if extract_age_from_date_of_birth(extract_date_of_birth(patient.rod_cislo)) == vek
            ]

        print(f"Found patients: {patients}")

        return jsonify({'patients': [patient.to_dic() for patient in patients]})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'An internal error occurred'}), 500


def extract_age_from_date_of_birth(date_of_birth):
    today = datetime.now()
    age = today.year - date_of_birth.year
    if (today.month, today.day) < (date_of_birth.month, date_of_birth.day):
        age -= 1
    return age

def extract_date_of_birth(rodne_cislo):
    rc_part = rodne_cislo[:6]
    year = int(rc_part[:2])
    month = int(rc_part[2:4])
    day = int(rc_part[4:6])
    if month > 50:
        month -= 50
    current_year = datetime.now().year % 100
    century = 1900 if year > current_year else 2000
    year += century
    return datetime(year, month, day)


@views.route('/pacient/<id_poistenca>/zdravotna-karta', methods=['GET'])
@login_required
def get_zdravotna_karta(id_poistenca):
    current_user_log = select_current_user()
    print("Current user:", current_user_log, "Role:", current_user_log.rola if current_user_log else None)
    if not current_user_log or current_user_log.rola != 'A' and current_user_log.rola != 'L':
        return jsonify({'error': 'Unauthorized access'}), 403
    try:
        print("Received parameters: ID_Poistenca=", id_poistenca)
        pacient = Pacient.query.filter_by(id_poistenca=id_poistenca).first()
        print('meno:', pacient.to_dic()['meno'])
        osoba = Osoba.query.filter_by(rod_cislo=pacient.rod_cislo).first()
        hosp = Hospitalizacia.query.filter_by(pacient=id_poistenca).all()
        hospitalizacie = [h.to_dic2() for h in hosp]
        rec = Recept.query.filter_by(pacient=id_poistenca).all()
        print('recept ', rec)
        rec = [r.zaznam() for r in rec]
        print(hospitalizacie)
        print('meno:', osoba.to_dic())
        if pacient:
            datum_narodenia = extract_date_of_birth(pacient.rod_cislo)
            zdravotna_karta = {
                'meno': pacient.to_dic()['meno'],
                'priezvisko': pacient.to_dic()['priezvisko'],
                'datumNarodenia': datum_narodenia.strftime('%Y-%m-%d'),
                'rodneCislo': pacient.to_dic()['id_poistenca'],
                'adresa': osoba.to_dic()['adresa'],
                'telefon': osoba.to_dic()['tel_cislo'],
                # 'krvnaSkupina': pacient.krvna_skupina,
                # 'alergie': pacient.alergie,
                # 'diagnozy': pacient.diagnozy,
                'hospitalizacie': hospitalizacie,
                # 'vysledkyVysetreni': pacient.vysledky_vysetreni,
                'recepty': rec
            }
            return jsonify({'zdravotna_karta': zdravotna_karta})
        return jsonify({'error': 'Pacient not found'})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': 'An internal error occurred'}), 500


@views.route('/pacient/<id_poistenca>/zaznam', methods=['GET', 'POST'])
@login_required
def add_diagnoza(id_poistenca):
    if request.method == 'GET':
        to_return = select_patient_and_doctor_data(id_poistenca)
        if to_return:
            return jsonify(to_return)
        return jsonify({'error': 'Patient not found'})
    elif request.method == 'POST':
        print(request.json)
        try:
            new_diagnoza = insert_new_diagnoza(
                diagnoza_kod=request.json['diagnoza_kod'],
                datum_vysetrenia=datetime.strptime(request.json['datum_vysetrenia'], '%Y-%m-%d'),
                pacient=id_poistenca,
                popis=request.json['popis'])
            return jsonify({'message': 'Diagnosis created'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@views.route('/staff', methods=['GET'])
@login_required
def get_zamestnanci():
    try:
        print("Fetching employees...")  # Debug log
        zamestnanci = select_zamestnanci()
        print(f"Found {len(zamestnanci)} employees")  # Debug log
        return jsonify({'zamestnanci': zamestnanci})
    except Exception as e:
        print("Error in get_zamestnanci:", str(e))  # Detailed error
        return jsonify({'error': str(e)}), 500