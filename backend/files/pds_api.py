from flask import Blueprint, jsonify, request
from . import db
from .queries import select_current_user
from sqlalchemy import text

pds_api = Blueprint('pds_api', __name__)


@pds_api.route('/hosp_analysis/')
def hosp_analysis():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    if start_date == '' and end_date == '':
        start_date = '2000-01-01'
        end_date = '2024-12-31'
    query = text('''SELECT JSON_OBJECT('analysis' VALUE JSON_ARRAYAGG(
           JSON_OBJECT(
               'meno' VALUE meno,
               'priezvisko' VALUE priezvisko,
               'rod_cislo' VALUE rod_cislo,
               'pocet_dni' VALUE pocet_dni,
               'rank' VALUE rank
           )
       ), 'username' VALUE :username
       ) AS json_result
FROM (
    SELECT meno,
           priezvisko,
           rod_cislo,
           pocet_dni,
           DENSE_RANK() OVER (ORDER BY pocet_dni DESC) AS rank
    FROM (
        SELECT o.meno,
               o.priezvisko,
               o.rod_cislo,
               ROUND(SUM(CASE
                   WHEN h.datum_do IS NULL THEN
                       GREATEST(LEAST(TO_DATE(:end_date, 'YYYY-MM-DD'), SYSDATE) - 
                       GREATEST(h.datum_od, TO_DATE(:start_date, 'YYYY-MM-DD')) + 1, 0)
                   ELSE
                       GREATEST(h.datum_do - GREATEST(h.datum_od, TO_DATE(:start_date, 'YYYY-MM-DD')) + 1, 0)
               END)) AS pocet_dni
        FROM pavlanin2.m_osoba o
                 JOIN pavlanin2.m_pacient p ON o.rod_cislo = p.rod_cislo
                 JOIN pavlanin2.m_hospitalizacia h ON p.id_poistenca = h.pacient
        WHERE h.datum_od <= TO_DATE(:end_date, 'YYYY-MM-DD')
          AND (h.datum_do IS NULL OR h.datum_do >= TO_DATE(:start_date, 'YYYY-MM-DD'))
        GROUP BY o.meno, o.priezvisko, o.rod_cislo
    ) t
    ORDER BY rank
    FETCH FIRST 10 ROWS ONLY
)''')
    query = query.bindparams(start_date=start_date, end_date=end_date, username=select_current_user().login)
    result = db.session.execute(query).fetchone()
    return result[0]


@pds_api.route('/appointment_analysis')
def appointment_analysis():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    start_date = '2000-01-01' if start_date == '' else start_date
    end_date = '2024-12-31' if end_date == '' else end_date

    query = text('''SELECT 
    JSON_OBJECT(
        'analysis' VALUE JSON_ARRAYAGG(
            JSON_OBJECT(
                'lekar' VALUE lekar_name,
                'total_orders' VALUE total_orders,
                'doctor_rank' VALUE doctor_rank
            )
        ),
        'username' VALUE :username
    )
FROM (
    SELECT
        z.id_zamestnanca AS lekar,
        os.meno || ' ' || os.priezvisko AS lekar_name,
        COUNT(o.pacient) AS total_orders,
        RANK() OVER (ORDER BY COUNT(o.pacient) DESC) AS doctor_rank
    FROM
        pavlanin2.m_zamestnanec z
        LEFT JOIN pavlanin2.m_objednavka o ON z.id_zamestnanca = o.lekar
        LEFT JOIN pavlanin2.M_OSOBA os ON z.rod_cislo = os.rod_cislo
    WHERE
        o.datum_objednavky BETWEEN TO_DATE(:start_date, 'YYYY-MM-DD') AND TO_DATE(:end_date, 'YYYY-MM-DD')
    GROUP BY
        z.id_zamestnanca, os.meno, os.priezvisko
) ranked_data
WHERE doctor_rank <= 10
ORDER BY doctor_rank
''')

    query = query.bindparams(
        start_date=start_date,
        end_date=end_date,
        username=select_current_user().login
    )

    result = db.session.execute(query).fetchone()
    return result[0]


@pds_api.route('/diagnosis_analysis')
def diagnosis_analysis():
    year = request.args.get('year')
    query = text('''SELECT JSON_OBJECT(
    'analysis' VALUE JSON_ARRAYAGG(
        JSON_OBJECT(
            'kod_diagnozy' VALUE v.kod_diagnozy,
            'nazov_diagnozy' VALUE v.nazov_diagnozy,
            'pacienti' VALUE v.pacienti,
            'pocet_pacientov' VALUE v.pocet_pacientov
        )
    )
) AS analysis
FROM (
    SELECT
        d.kod_diagnozy,
        d.nazov_diagnozy,
        LISTAGG(p.id_poistenca, ', ') WITHIN GROUP (ORDER BY p.id_poistenca) AS pacienti,
        COUNT(p.id_poistenca) AS pocet_pacientov
    FROM
        pavlanin2.m_diagnoza d
    LEFT JOIN
        pavlanin2.m_zdravotny_zaznam z ON d.kod_diagnozy = z.kod_diagnozy
    LEFT JOIN
        pavlanin2.m_pacient p ON z.pacient = p.id_poistenca
    AND
        TO_CHAR(z.DATUM_VYSETRENIA, 'YYYY') = :year
    GROUP BY
        d.kod_diagnozy, d.nazov_diagnozy
    ORDER BY
        COUNT(p.id_poistenca) DESC
    FETCH FIRST 10 ROWS ONLY
) v''')
    query = query.bindparams(year=year)
    result = db.session.execute(query).fetchone()
    return result[0]


@pds_api.route('/hosp_discharge_analysis')
def hospitalization_patient_analysis():
    query = text('''SELECT
    year,
    SUM(number_of_hospitalizations) AS total_hospitalizations,
    SUM(number_of_discharges) AS total_discharges
FROM (
    SELECT
        EXTRACT(YEAR FROM datum_od) AS year,
        COUNT(*) AS number_of_hospitalizations,
        0 AS number_of_discharges
    FROM
        pavlanin2.m_hospitalizacia
    WHERE datum_od IS NOT NULL
    GROUP BY
        EXTRACT(YEAR FROM datum_od)

    UNION ALL

    SELECT
        EXTRACT(YEAR FROM datum_do) AS year,
        0 AS number_of_hospitalizations,
        COUNT(*) AS number_of_discharges
    FROM
        pavlanin2.m_hospitalizacia
    WHERE datum_do IS NOT NULL
    GROUP BY
        EXTRACT(YEAR FROM datum_do)
)
GROUP BY
    year
ORDER BY
    year''')
    result = db.session.execute(query).fetchall()
    to_return = {
        'username': select_current_user().login,
        'analysis': []
    }
    for row in result:
        to_return['analysis'].append({
            'year': row[0],
            'total_hospitalizations': row[1],
            'total_discharges': row[2]
        })
    return jsonify(to_return)
