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


def select_current_doctor_orders():
    """this returns all orders of the current user (doctor)"""
    if select_current_user():
        objednavky = Objednavka.query.filter(Objednavka.lekar == select_current_user().id_zamestnanca).join(
            Pacient).all()
        to_return = []
        for objednavka in objednavky:
            to_return.append(objednavka.to_dic())
        return to_return


def select_last_order():
    """this returns the last order of the current user (doctor) based on the highest id_objednavky"""
    if select_current_user():
        objednavka = Objednavka.query.filter(Objednavka.lekar == select_current_user().id_zamestnanca).order_by(
            Objednavka.id_objednavky.desc()).first()
        return objednavka
    return None


def insert_new_order(reason, patient, doctor, room, blocks, date, time):
    """this creates a new order"""
    date_time_str = f"{date} {time}"
    date_time = datetime.strptime(date_time_str, '%Y-%m-%d %H:%M')
    patient = patient.split('-')[1][1:]

    doctor_id = Pouzivatel.query.filter(Pouzivatel.login == doctor).first().id_zamestnanca

    new_order = Objednavka(dovod=reason, pacient=patient, lekar=doctor_id, miesnost=room, pocet_blokov=blocks,
                           datum_objednavky=date_time)
    db.session.add(new_order)
    db.session.commit()
    return new_order


def delete_order(id):
    """this deletes an order"""
    order = Objednavka.query.filter(Objednavka.id_objednavky == id).first()
    db.session.delete(order)
    db.session.commit()
    return order


def update_order(id, reason, patient, doctor, room, blocks, date, time):
    """this updates an order"""
    order = Objednavka.query.filter(Objednavka.id_objednavky == id).first()
    date_time_str = f"{date} {time}"
    order.datum_objednavky = datetime.strptime(date_time_str, '%Y-%m-%d %H:%M')
    order.pacient = patient.split('-')[1][1:]
    order.lekar = Pouzivatel.query.filter(Pouzivatel.login == doctor).first().id_zamestnanca
    order.miesnost = room
    order.pocet_blokov = blocks
    order.dovod = reason
    db.session.commit()
    return order
