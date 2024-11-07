import csv
import datetime

from flask import Blueprint, jsonify

from backend.files import db
from backend.files.models import Diagnoza

test_routes = Blueprint('test_routes', __name__)


@test_routes.route('/load')
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


@test_routes.route('/vek')
def vek():
    return jsonify(5)


@test_routes.route('/data')
def get_time():
    return {
        'Name': "geek",
        "Age": "22",
        "Date": datetime.datetime.now(),
        "programming": "python"
    }


@test_routes.route('/xx')
def xx():
    return jsonify({'username': 'current_user.login'})

