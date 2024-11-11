from datetime import datetime

from flask_login import current_user
from . import db
from .models import Objednavka, Pouzivatel, Pacient


def select_current_user():
    if current_user.is_authenticated:
        if current_user.is_anonymous:
            return None
        return current_user
    return None


def select_current_doctor_schedule():
    if select_current_user():
        objednavky = Objednavka.query.filter(Objednavka.lekar == select_current_user().id_zamestnanca).join(
            Pacient).all()
        to_return = []
        for objednavka in objednavky:
            to_return.append(objednavka.to_dic())
        print(to_return)
        return to_return


def select_last_order():
    """this returns the last order of the current user (doctor) based on the highest id_objednavky"""
    if select_current_user():
        objednavka = Objednavka.query.filter(Objednavka.lekar == select_current_user().id_zamestnanca).order_by(
            Objednavka.id_objednavky.desc()).first()
        return objednavka
    return None


def insert_new_order(reason, patient, doctor, room, blocks, date, time):
    date_time_str = f"{date} {time}"
    date_time = datetime.strptime(date_time_str, '%Y-%m-%d %H:%M')
    formatted_date_time = date_time.strftime('%Y-%m-%d %H:%M:%S')

    doctor_id = Pouzivatel.query.filter(Pouzivatel.login == doctor).first().id_zamestnanca

    new_order = Objednavka(dovod=reason, pacient=patient, lekar=doctor_id, miesnost=room, pocet_blokov=blocks,
                           datum_objednavky=date_time)
    db.session.add(new_order)
    print(new_order)
    db.session.commit()
    return new_order
