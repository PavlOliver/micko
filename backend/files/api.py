from flask import Blueprint, request, jsonify
from flask_login import login_required
from .models import Pacient, Osoba, Pouzivatel, Zamestnanec, Liek, Miestnost, Diagnoza, Specializacia
from . import db
from .queries import select_current_user

api = Blueprint('api', __name__)


@api.route('/patients_list')
@login_required
def patients_list():
    print('patients_list')
    query_filter = request.args.get('query')
    patients = db.session.query(Pacient).select_from(Pacient).join(Osoba,
                                                                   Pacient.rod_cislo == Osoba.rod_cislo).filter(
        Osoba.meno.ilike(f'%{query_filter}%') |
        Osoba.priezvisko.ilike(f'%{query_filter}%') |
        Pacient.id_poistenca.ilike(f'%{query_filter}%')
    ).all()
    return {'patients': [patient.get_fullname_and_id() for patient in patients]}


@api.route('/doctors_list')
@login_required
def doctors_list():
    query_filter = request.args.get('query')
    doctors = Zamestnanec.query.join(Osoba, Zamestnanec.rod_cislo == Osoba.rod_cislo).filter(
        Osoba.meno.ilike(f'%{query_filter}%') |
        Osoba.priezvisko.ilike(f'%{query_filter}%')
    ).all()
    print([doctor.get_full_name_and_login() for doctor in doctors])

    return {'doctors': [doctor.get_full_name_and_login() for doctor in doctors]}


@api.route('/diagnosis_list')
@login_required
def diagnosis_list():
    query_filter = request.args.get('query')
    diagnosis = Diagnoza.query.filter(Diagnoza.kod_diagnozy.ilike(f'%{query_filter}%') |
                                      Diagnoza.nazov_diagnozy.ilike(f'%{query_filter}%')).limit(20).all()
    return {'diagnosis': [diag.to_dict() for diag in diagnosis]}


@api.route('/lieky')
@login_required
def get_drug_suggestions():
    query = request.args.get('query')
    if query:
        drugs = Liek.query.filter(
            Liek.nazov.ilike(f'%{query}%'),
            Liek.vydaj != 'F'
        ).all()
        return jsonify({'drugs': [{'name': drug.nazov, 'code': drug.kod} for drug in drugs]})
    return jsonify({'drugs': []})


@api.route('/user-role')
@login_required
def get_user_role():
    current_user = select_current_user()
    if current_user:
        return jsonify({'rola': current_user.rola})
    return jsonify({'error': 'User not found'}), 404


@api.route('/rooms_list')
@login_required
def rooms_list():
    query_filter = request.args.get('query')
    rooms = Miestnost.query.filter(
        Miestnost.cislo_miestnosti.ilike(f'%{query_filter}%') |
        Miestnost.typ.ilike(f'%{query_filter}%')
    ).all()
    return {'rooms': [room.cislo_miestnosti for room in rooms]}

@api.route('/employees-not-users')
@login_required
def employees_not_users():
    try:
        subquery = db.session.query(Pouzivatel.id_zamestnanca).subquery()
        employees = db.session.query(
            Zamestnanec.id_zamestnanca,
            Osoba.meno,
            Osoba.priezvisko,
            Specializacia.nazov_specializacie
        ).join(
            Osoba, Zamestnanec.rod_cislo == Osoba.rod_cislo
        ).join(
            Specializacia, Zamestnanec.specializacia == Specializacia.kod_specializacie
        ).filter(
            ~Zamestnanec.id_zamestnanca.in_(subquery)
        ).all()

        print("Query executed successfully. Number of employees found:", len(employees))

        employee_list = [{
            'id_zamestnanca': emp.id_zamestnanca,
            'meno': emp.meno,
            'priezvisko': emp.priezvisko,
            'specializacia': emp.nazov_specializacie
        } for emp in employees]

        print("Employee list prepared:", employee_list)

        return jsonify({'employees': employee_list})
    except Exception as e:
        print("Error executing query:", str(e))
        return jsonify({'error': 'Failed to load employees'}), 500