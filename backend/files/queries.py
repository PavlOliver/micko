from datetime import datetime

from flask_login import current_user
from . import db
from .models import Objednavka, Pouzivatel, Pacient, Recept, Hospitalizacia


def select_current_user():
    if current_user.is_authenticated:
        if current_user.is_anonymous:
            return None
        return current_user
    return None


def select_current_doctor_orders(week_number):
    """this returns all orders of the current user (doctor) based on the week number"""
    if select_current_user():
        objednavky = Objednavka.query.filter(Objednavka.lekar == select_current_user().id_zamestnanca).join(
            Pacient).all()
        to_return = []
        for objednavka in objednavky:
            if objednavka.datum_objednavky.isocalendar().week == week_number:
                to_return.append(objednavka.to_dic())
        return to_return
    # if select_current_user():
    #     objednavky = Objednavka.query.filter(Objednavka.lekar == select_current_user().id_zamestnanca).join(
    #         Pacient).all()
    #     to_return = []
    #     for objednavka in objednavky:
    #         to_return.append(objednavka.to_dic())
    #     return to_return


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

    new_order = Objednavka(dovod=reason, pacient=patient, lekar=doctor_id, miestnost=room, pocet_blokov=blocks,
                           datum_objednavky=date_time)
    db.session.add(new_order)
    db.session.commit()
    return new_order


def select_patients():
    patients = Pacient.query.all()
    to_return = []
    for patient in patients:
        to_return.append(patient.to_dic())
    return to_return


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
    order.miestnost = room
    order.pocet_blokov = blocks
    order.dovod = reason
    db.session.commit()
    return order


def select_hospitalisations():
    """this returns all hospitalisations"""
    hospitalisations = Hospitalizacia.query.all()
    to_return = []
    for hospitalisation in hospitalisations:
        to_return.append(hospitalisation.to_dic())
    return to_return


def insert_new_recept(liek, pacient, lekar, pocet, poznamka, vystavenie):
    """creates a new recept"""
    if pocet <= 0:
        raise ValueError("Počet musí byť viac ako 0")

    if not liek or not pacient or not lekar:
        raise ValueError("All not-nullable fields must be filled")

    new_recept = Recept(
        liek=liek,
        vystavenie=vystavenie,
        pacient=pacient,
        lekar=lekar,
        pocet=pocet,
        poznamka=poznamka
    )
    db.session.add(new_recept)
    db.session.commit()
    return new_recept


def update_profile_picture(filename):
    """this updates the profile picture of the current user"""
    user = select_current_user()
    user.fotka = filename
    db.session.commit()
    return user
