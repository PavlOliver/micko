import csv
import datetime
import re

import chardet

from flask import Blueprint, jsonify
from telegram._files import file

from backend.files import db
from backend.files.models import Diagnoza

test_routes = Blueprint('test_routes', __name__)


@test_routes.route('/load')
def load():
    try:
        with open('Prvz.csv', newline='') as csvfile:
            csvreader = csv.reader(csvfile, delimiter=';')

            for row in csvreader:
                row = [cell.replace('\n', '') for cell in row]

                # Vypíšte obsah riadku na kontrolu
                # print(f"Spracovávaný riadok: {row}")

                # Skontrolujte, či kod_diagnozy neobsahuje viac ako 1 písmeno
                if len(re.findall(r'[A-Za-z]', row[0])) > 1:
                    print(f'Porušenie: kod_diagnozy "{row[0]}" obsahuje viac ako 1 písmeno.')
                    continue  # Preskočiť tento riadok

                # Skontrolujte dĺžku hodnoty kod_diagnozy
                if len(row[0]) > 7:
                    print(f'Porušenie: kod_diagnozy "{row[0]}" je dlhé {len(row[0])} znakov.')
                    # Vypíšte celý riadok, kde došlo k chybe
                    print(f'Riadiaci záznam s chybou: {row}')
                    continue  # Preskočiť tento riadok

                # Ak je dĺžka v poriadku, pridajte nový záznam do databázy
                new_diag = Diagnoza(
                    kod_diagnozy=row[0],
                    nazov_diagnozy=row[1],
                    doplnujuce_info=None if row[2] == '' else row[2]
                )
                db.session.add(new_diag)

            print("Nové objekty v session pred commitom:")
            for obj in db.session.new:
                print(obj)            # Uložte záznamy do databázy
            db.session.commit()  # Odkomentuj, keď overíš dáta
            print("Údaje boli úspešne uložené do databázy.")

    except Exception as e:
        print(f'Chyba pri spracovaní CSV alebo ukladaní do databázy: {str(e)}')

    return 'Kontrola dokončená'


@test_routes.route('/load2')
def load2():
    try:
        with open('Prvz.csv', newline='') as csvfile:
            csvreader = csv.reader(csvfile, delimiter=';')

            for row in csvreader:
                row = [cell.replace('\n', '') for cell in row]

                # Vypíšte obsah riadku na kontrolu
                print(f"Spracovávaný riadok: {row}")

                # Skontrolujte, či je kod_diagnozy príliš dlhý
                if len(re.findall(r'[A-Za-z]', row[0])) > 1:
                    print(f'Porušenie: kod_diagnozy "{row[0]}" obsahuje viac ako 1 písmeno.')
                    print(f"Riadok s chybou: {row}")
                    continue  # Preskoč tento riadok

                # Skontrolujte dĺžku kod_diagnozy
                elif len(row[0]) > 7:
                    print(f'Porušenie: kod_diagnozy "{row[0]}" je dlhé {len(row[0])} znakov.')
                    print(f'Riadiaci záznam s chybou: {row}')
                    continue  # Preskoč tento riadok

                # Skontrolujte dĺžku doplnjujuce_info a vypíšte riadok, ak je dlhší než 700
                elif len(row[2]) > 700:
                    print(f"Varovanie: doplnjujuce_info v riadku {row} je príliš dlhé ({len(row[2])} znakov).")
                    print(f"Riadok s chybou: {row}")
                    row[2] = row[2][:700]  # Orezanie na 700 znakov

                else:
                    # Ak sú všetky kontroly v poriadku, pridajte nový záznam
                    new_diag = Diagnoza(
                        kod_diagnozy=row[0],
                        nazov_diagnozy=row[1],
                        doplnujuce_info=None if row[2] == '' else row[2]
                    )
                    db.session.add(new_diag)

            db.session.commit()
            print("Údaje boli úspešne uložené do databázy.")

    except Exception as e:
        print(f'Chyba pri spracovaní CSV alebo ukladaní do databázy: {str(e)}')

    return 'Kontrola dokončená'


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
