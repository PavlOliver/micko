from flask import Blueprint, jsonify, request
from . import db
from .queries import select_current_user

pds_api = Blueprint('pds_api', __name__)


@pds_api.route('/hosp_analysis/')
def hosp_analysis():
    from sqlalchemy import text
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    if start_date == '' and end_date == '':
        start_date = '2000-01-01'
        end_date = '2024-12-31'
    query = text('''SELECT meno,
       priezvisko,
       rod_cislo,
       pocet_dni,
       DENSE_RANK() OVER (ORDER BY pocet_dni DESC) AS rank
FROM (SELECT o.meno,
             o.priezvisko,
             o.rod_cislo,
             round(SUM(CASE
                     WHEN h.datum_do IS NULL THEN
                         GREATEST(LEAST(to_date(:end_date, 'YYYY-MM-DD'), SYSDATE) - GREATEST(h.datum_od, to_date(:start_date, 'YYYY-MM-DD')) + 1, 0)
                     ELSE
                         GREATEST(h.datum_do - GREATEST(h.datum_od, to_date(:start_date, 'YYYY-MM-DD')) + 1, 0)
                 END)) AS pocet_dni
      FROM m_osoba o
               JOIN m_pacient p ON o.rod_cislo = p.rod_cislo
               JOIN m_hospitalizacia h ON p.id_poistenca = h.pacient
      WHERE h.datum_od <= to_date(:end_date, 'YYYY-MM-DD')
        AND (h.datum_do IS NULL OR h.datum_do >= to_date(:start_date, 'YYYY-MM-DD'))
      GROUP BY o.meno, o.priezvisko, o.rod_cislo) t
ORDER BY rank
FETCH FIRST 10 ROWS ONLY

    ''')
    query = query.bindparams(start_date=start_date, end_date=end_date)
    result = db.session.execute(query).fetchall()
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
