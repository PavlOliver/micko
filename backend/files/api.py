from flask import Blueprint, request
from flask_login import login_required
from .models import Pacient, Osoba, Pouzivatel, Zamestnanec
from . import db

api = Blueprint('api', __name__)


@api.route('/patients_list')
def patients_list():
    query_filter = request.args.get('query')
    patients = db.session.query(Pacient).select_from(Pacient).join(Osoba,
                                                                   Pacient.rod_cislo == Osoba.rod_cislo).filter(
        Osoba.meno.ilike(f'%{query_filter}%') |
        Osoba.priezvisko.ilike(f'%{query_filter}%') |
        Pacient.id_poistenca.ilike(f'%{query_filter}%')
    ).all()

    pacient_tst = Pacient.query.all()
    print([patient.get_fullname_and_id() for patient in pacient_tst])
    return {'patients': [patient.get_fullname_and_id() for patient in patients]}


@api.route('/doctors_list')
def doctors_list():
    query_filter = request.args.get('query')
    doctors = Zamestnanec.query.join(Osoba, Zamestnanec.rod_cislo == Osoba.rod_cislo).filter(
        Osoba.meno.ilike(f'%{query_filter}%') |
        Osoba.priezvisko.ilike(f'%{query_filter}%')
    ).all()
    print([doctor.get_full_name_and_login() for doctor in doctors])

    return {'doctors': [doctor.get_full_name_and_login() for doctor in doctors]}