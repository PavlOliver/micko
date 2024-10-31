import csv

from flask import Blueprint

from .models import Diagnoza, db
from .queries import select_test

views = Blueprint('views', __name__)


@views.route('/')
def index():
    names = select_test()
    return names


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
