import csv

from flask import Blueprint, jsonify

from .models import Diagnoza, db
views = Blueprint('views', __name__)


@views.route('/')
def index():
    return 'Hello, World!'


@views.route('/load')
def load():
    with open('diagnozyAB.csv', newline='') as csvfile:
        csvreader = csv.reader(csvfile, delimiter=';')

        for row in csvreader:
            row = [cell.replace('\n', '') for cell in row]
            if len(row[0]) <= 6:
                new_diag = Diagnoza(
                    kod_diagnozy=row[0],
                    nazov_diagnozy=row[1],
                    doplnujuce_info=None if row[2] == '' else row[2]
                )
                print(new_diag.kod_diagnozy)
                db.session.add(new_diag)
        db.session.commit()

    return 'load'
@views.route('/test')
def test():
    premena = Diagnoza.query.all()
    print("test")
    print(premena)
    return 'test'
@views.route('/vek')
def vek():

    print("te54st")
    return jsonify(5)
