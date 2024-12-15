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

@api.route('/add-employee', methods=['POST'])
@login_required
def add_employee():
    current_user = select_current_user()
    if not current_user or current_user.rola != 'A':
        return jsonify({'error': 'Nepovolený prístup'}), 403

    data = request.json
    try:
        rodne_cislo = data.get('rodne_cislo')
        meno = data.get('meno')
        priezvisko = data.get('priezvisko')
        id_zamestnanca = data.get('id_zamestnanca')
        id_specializacie = data.get('id_specializacie')

        existing_osoba = Osoba.query.filter_by(rod_cislo=rodne_cislo).first()
        if existing_osoba:
            return jsonify({'error': 'Osoba s daným rodným číslom už existuje'}), 400

        from sqlalchemy import text
        db.session.execute(text(
            f"INSERT INTO m_osoba (rod_cislo, meno, priezvisko) VALUES ('{rodne_cislo}', '{meno}', '{priezvisko}')"
        ))
        db.session.commit()

        existing_zamestnanec = Zamestnanec.query.filter_by(id_zamestnanca=id_zamestnanca).first()
        if existing_zamestnanec:
            return jsonify({'error': 'Zamestnanec s daným ID už existuje'}), 400

        new_zamestnanec = Zamestnanec(
            id_zamestnanca=id_zamestnanca,
            rod_cislo=rodne_cislo,
            specializacia=id_specializacie
        )
        db.session.add(new_zamestnanec)

        db.session.commit()

        return jsonify({'message': 'Nový zamestnanec bol úspešne pridaný'}), 201

    except Exception as e:
        db.session.rollback()
        print("Error adding new employee:", str(e))
        return jsonify({'error': 'Pridanie nového zamestnanca zlyhalo'}), 500

@api.route('/specializations', methods=['GET'])
@login_required
def get_specializations():
    try:
        specializations = Specializacia.query.all()
        return jsonify({
            'specializations': [
                {'kod': spec.kod_specializacie, 'nazov': spec.nazov_specializacie}
                for spec in specializations
            ]
        })
    except Exception as e:
        print("Error fetching specializations:", str(e))
        return jsonify({'error': 'Nepodarilo sa načítať špecializácie'}), 500