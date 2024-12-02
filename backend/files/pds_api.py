from flask import Blueprint, jsonify
from . import db
from .queries import select_current_user

pds_api = Blueprint('pds_api', __name__)


@pds_api.route('/hosp_analysis')
def hosp_analysis():
    from sqlalchemy import text
    query = text('''select o.meno, o.priezvisko, o.rod_cislo, 
    SUM(case when h.datum_do is null then sysdate -  h.datum_do
             else  h.datum_do -  h.datum_od
        end) as pocet_dni,
    rank() over (order by SUM(case when h.datum_do is null then sysdate -  h.datum_do
                              else  h.datum_do -  h.datum_od
                           end) desc) as rank
from m_osoba o
    join m_pacient p on o.rod_cislo = p.rod_cislo
    join m_hospitalizacia h on p.id_poistenca = h.pacient
group by o.meno, o.priezvisko, o.rod_cislo
order by RANK''')
    result = db.engine.connect().execute(query)
    to_return = {
        'username': select_current_user().login,
        'analysis': []
    }
    for row in result:
        to_return['analysis'].append({
            'meno': row[0],
            'priezvisko': row[1],
            'rod_cislo': row[2],
            'pocet_dni': row[3],
            'rank': row[4]
        })
    return jsonify(to_return)
