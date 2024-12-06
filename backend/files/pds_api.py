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
      FROM pavlanin2.m_osoba o
               JOIN pavlanin2.m_pacient p ON o.rod_cislo = p.rod_cislo
               JOIN pavlanin2.m_hospitalizacia h ON p.id_poistenca = h.pacient
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


@pds_api.route('/appointment_analysis')
def appointment_analysis():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    start_date = '2000-01-01' if start_date == '' else start_date
    end_date = '2024-12-31' if end_date == '' else end_date
    query = text('''SELECT
    z.id_zamestnanca AS lekar,
    COUNT(o.pacient) AS total_orders,
    RANK() OVER (ORDER BY COUNT(o.pacient) DESC) AS doctor_rank
FROM
    pavlanin2.m_zamestnanec z
    LEFT JOIN pavlanin2.m_objednavka o ON z.id_zamestnanca = o.lekar
WHERE o.datum_objednavky BETWEEN TO_DATE(:start_date, 'YYYY-MM-DD') AND TO_DATE(:end_date, 'YYYY-MM-DD')
GROUP BY
    z.id_zamestnanca FETCH FIRST 10 ROWS ONLY''')
    query = query.bindparams(start_date=start_date, end_date=end_date)
    result = db.session.execute(query).fetchall()
    to_return = {
        'username': select_current_user().login,
        'analysis': []
    }
    for row in result:
        to_return['analysis'].append({
            'lekar': row[0],
            'total_orders': row[1],
            'doctor_rank': row[2]
        })
    return jsonify(to_return)


@pds_api.route('/diagnosis_analysis')
def diagnosis_analysis():
    year = request.args.get('year')
    query = text('''SELECT
    d.kod_diagnozy,
    d.nazov_diagnozy AS choroba,
    listagg(p.id_poistenca, ', ') WITHIN GROUP (ORDER BY p.id_poistenca) AS pacienti,
    COUNT(p.id_poistenca) AS pocet_pacientov
FROM
    pavlanin2.m_diagnoza d
LEFT JOIN
    pavlanin2.m_zdravotny_zaznam z ON d.kod_diagnozy = z.kod_diagnozy
LEFT JOIN
    pavlanin2.m_pacient p ON z.pacient = p.id_poistenca
AND
    to_char(z.DATUM_VYSETRENIA, 'YYYY') = :year
GROUP BY
    d.kod_diagnozy,d.nazov_diagnozy
ORDER BY
    pocet_pacientov DESC fetch first 10 rows only''')
    query = query.bindparams(year=year)
    result = db.session.execute(query).fetchall()
    to_return = {
        'username': select_current_user().login,
        'analysis': []
    }
    for row in result:
        to_return['analysis'].append({
            'kod_diagnozy': row[0],
            'choroba': row[1],
            'pacienti': row[2],
            'pocet_pacientov': row[3]
        })
    return jsonify(to_return)


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

@pds_api.route('/recepty_za_mesiac_narast')
def recepty_za_mesiac_narast():
    # Váš SQL dotaz
    query = text('''
    SELECT
        aktualny_mesac.mesiac,
        aktualny_mesac.pocet_predpisov,
        ROUND(
            (aktualny_mesac.pocet_predpisov - predchadzajuci_mesac.pocet_predpisov) * 100.0
            / predchadzajuci_mesac.pocet_predpisov,
            2
        ) AS percentualny_narast,
        RANK() OVER (ORDER BY aktualny_mesac.pocet_predpisov DESC) AS poradove_cislo
    FROM
        (SELECT
            TO_CHAR(vystavenie, 'MM') AS mesiac,
            COUNT(id_receptu) AS pocet_predpisov
        FROM
            pavlanin2.m_recept
        GROUP BY
            TO_CHAR(vystavenie, 'MM')
        ) aktualny_mesac
    LEFT JOIN
        (SELECT
            TO_CHAR(vystavenie, 'MM') AS mesiac,
            COUNT(id_receptu) AS pocet_predpisov
        FROM
            pavlanin2.m_recept
        GROUP BY
            TO_CHAR(vystavenie, 'MM')
        ) predchadzajuci_mesac
    ON
        TO_NUMBER(aktualny_mesac.mesiac) = TO_NUMBER(predchadzajuci_mesac.mesiac) + 1
    ORDER BY
        aktualny_mesac.mesiac
    ''')

    result = db.session.execute(query).fetchall()

    data = []
    for row in result:
        data.append({
            'mesiac': row[0],
            'pocet_predpisov': row[1],
            'percentualny_narast': row[2],
            'poradove_cislo': row[3]
        })

    return jsonify(data)

@pds_api.route('/trendy_novych_pacientov')
def trendy_novych_pacientov():
    query = text('''
    SELECT
        aktualny_mesac.mesiac,
        aktualny_mesac.pocet_novych_pacientov,
        ROUND(
            (aktualny_mesac.pocet_novych_pacientov - predchadzajuci_mesac.pocet_novych_pacientov) * 100.0
            / predchadzajuci_mesac.pocet_novych_pacientov,
            2
        ) AS percentualny_narast,
        RANK() OVER (ORDER BY aktualny_mesac.pocet_novych_pacientov DESC) AS poradove_cislo
    FROM
        (SELECT
            TO_CHAR(datum_od, 'MM') AS mesiac,
            COUNT(id_poistenca) AS pocet_novych_pacientov
        FROM
            pavlanin2.m_pacient
        GROUP BY
            TO_CHAR(datum_od, 'MM')
        ) aktualny_mesac
    LEFT JOIN
        (SELECT
            TO_CHAR(datum_od, 'MM') AS mesiac,
            COUNT(id_poistenca) AS pocet_novych_pacientov
        FROM
            pavlanin2.m_pacient
        GROUP BY
            TO_CHAR(datum_od, 'MM')
        ) predchadzajuci_mesac
    ON
        TO_NUMBER(aktualny_mesac.mesiac) = TO_NUMBER(predchadzajuci_mesac.mesiac) + 1
    ORDER BY
        aktualny_mesac.mesiac
    ''')

    result = db.session.execute(query).fetchall()

    data = []
    for row in result:
        data.append({
            'mesiac': row[0],
            'pocet_novych_pacientov': row[1],
            'percentualny_narast': row[2],
            'poradove_cislo': row[3]
        })

    return jsonify(data)


@pds_api.route('/specializacie_rok', methods=['GET'])
def get_specializacie_rok():
    rok = request.args.get('rok')

    sql = text("""
    SELECT
        s.NAZOV_SPECIALIZACIE,
        EXTRACT(YEAR FROM zk.datum_vysetrenia) AS rok,
        COUNT(zk.kod_diagnozy) AS pocet_zaznamov,
        ROUND(
            (COUNT(zk.kod_diagnozy) * 100.0) / 
            (SELECT COUNT(*) FROM pavlanin2.m_zdravotny_zaznam 
             WHERE EXTRACT(YEAR FROM datum_vysetrenia) = EXTRACT(YEAR FROM zk.datum_vysetrenia)
            ), 
            2
        ) AS percentualny_podiel,
        RANK() OVER (PARTITION BY EXTRACT(YEAR FROM zk.datum_vysetrenia) ORDER BY COUNT(zk.kod_diagnozy) DESC) AS poradove_cislo
    FROM
        pavlanin2.m_zdravotny_zaznam zk
    JOIN
        pavlanin2.m_zamestnanec d ON zk.lekar = d.id_zamestnanca
    JOIN 
        pavlanin2.m_specializacia s ON s.KOD_SPECIALIZACIE = d.SPECIALIZACIA
    WHERE
        EXTRACT(YEAR FROM zk.datum_vysetrenia) = :rok
    GROUP BY
        s.NAZOV_SPECIALIZACIE, EXTRACT(YEAR FROM zk.datum_vysetrenia)
    ORDER BY
        pocet_zaznamov DESC
    """)

    query = sql.bindparams(rok=rok)
    result = db.session.execute(query).fetchall()

    data = []
    for row in result:
        data.append({
            'NAZOV_SPECIALIZACIE': row[0],  # First column is NAZOV_SPECIALIZACIE
            'rok': row[1],  # Second column is rok
            'pocet_zaznamov': row[2],  # Third column is pocet_zaznamov
            'percentualny_podiel': row[3],  # Fourth column is percentualny_podiel
            'poradove_cislo': row[4]  # Fifth column is poradove_cislo
        })

    return jsonify(data)

@pds_api.route('/vekove-skupiny', methods=['GET'])
def get_age_groups():
    query = text("""
        SELECT
    vekova_skupina,
    pocet_pacientov,
    ROUND(
        (pocet_pacientov * 100.0) / celkovy_pocet_pacientov, 
        2
    ) AS percentualny_podiel,
    RANK() OVER (ORDER BY pocet_pacientov DESC) AS poradove_cislo
FROM (
    SELECT
        CASE
            WHEN EXTRACT(YEAR FROM CURRENT_DATE) - 
                 (CASE
                     WHEN TO_NUMBER(SUBSTR(rod_cislo, 1, 2)) < 50 THEN 2000 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                     ELSE 1900 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                 END) < 18 THEN 'Mladší ako 18'
            WHEN EXTRACT(YEAR FROM CURRENT_DATE) - 
                 (CASE
                     WHEN TO_NUMBER(SUBSTR(rod_cislo, 1, 2)) < 50 THEN 2000 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                     ELSE 1900 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                 END) BETWEEN 18 AND 34 THEN '18-34'
            WHEN EXTRACT(YEAR FROM CURRENT_DATE) - 
                 (CASE
                     WHEN TO_NUMBER(SUBSTR(rod_cislo, 1, 2)) < 50 THEN 2000 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                     ELSE 1900 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                 END) BETWEEN 35 AND 49 THEN '35-49'
            WHEN EXTRACT(YEAR FROM CURRENT_DATE) - 
                 (CASE
                     WHEN TO_NUMBER(SUBSTR(rod_cislo, 1, 2)) < 50 THEN 2000 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                     ELSE 1900 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                 END) BETWEEN 50 AND 64 THEN '50-64'
            WHEN EXTRACT(YEAR FROM CURRENT_DATE) - 
                 (CASE
                     WHEN TO_NUMBER(SUBSTR(rod_cislo, 1, 2)) < 50 THEN 2000 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                     ELSE 1900 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                 END) BETWEEN 65 AND 79 THEN '65-79'
            ELSE '80 a viac'
        END AS vekova_skupina,
        COUNT(*) AS pocet_pacientov
    FROM
        pavlanin2.m_pacient
    GROUP BY
        CASE
            WHEN EXTRACT(YEAR FROM CURRENT_DATE) - 
                 (CASE
                     WHEN TO_NUMBER(SUBSTR(rod_cislo, 1, 2)) < 50 THEN 2000 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                     ELSE 1900 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                 END) < 18 THEN 'Mladší ako 18'
            WHEN EXTRACT(YEAR FROM CURRENT_DATE) - 
                 (CASE
                     WHEN TO_NUMBER(SUBSTR(rod_cislo, 1, 2)) < 50 THEN 2000 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                     ELSE 1900 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                 END) BETWEEN 18 AND 34 THEN '18-34'
            WHEN EXTRACT(YEAR FROM CURRENT_DATE) - 
                 (CASE
                     WHEN TO_NUMBER(SUBSTR(rod_cislo, 1, 2)) < 50 THEN 2000 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                     ELSE 1900 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                 END) BETWEEN 35 AND 49 THEN '35-49'
            WHEN EXTRACT(YEAR FROM CURRENT_DATE) - 
                 (CASE
                     WHEN TO_NUMBER(SUBSTR(rod_cislo, 1, 2)) < 50 THEN 2000 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                     ELSE 1900 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                 END) BETWEEN 50 AND 64 THEN '50-64'
            WHEN EXTRACT(YEAR FROM CURRENT_DATE) - 
                 (CASE
                     WHEN TO_NUMBER(SUBSTR(rod_cislo, 1, 2)) < 50 THEN 2000 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                     ELSE 1900 + TO_NUMBER(SUBSTR(rod_cislo, 1, 2))
                 END) BETWEEN 65 AND 79 THEN '65-79'
            ELSE '80 a viac'
        END
) subquery,
(
    SELECT COUNT(*) AS celkovy_pocet_pacientov FROM pavlanin2.m_pacient
) total
ORDER BY
    vekova_skupina
    """)

    # Vykonanie dopytu
    result = db.session.execute(query).fetchall()

    data = []
    for row in result:
        data.append({
            'vekova_skupina': row[0],  # Prvý stĺpec je vekova_skupina
            'pocet_pacientov': row[1],
            'percentualny_podiel': row[2], # Druhý stĺpec je pocet_pacientov
            'poradove_cislo': row[3]  ,
        })

    # Vrátenie dát ako JSON
    return jsonify(data)


@pds_api.route('/shift_analysis/')
def shift_analysis_json():
    query = text('''
     SELECT
        z.id_zamestnanca,
        o.meno,
        o.priezvisko,
        ROUND(
            SUM((zm.do_kedy - zm.od_kedy) * 24), 
            2
        ) AS total_hours,
        DENSE_RANK() OVER (
            ORDER BY SUM((zm.do_kedy - zm.od_kedy) * 24) DESC
        ) AS doctor_rank
    FROM
        pavlanin2.m_zmena zm
    JOIN
        pavlanin2.m_zamestnanec z ON zm.zamestnanec = z.id_zamestnanca
    JOIN
        pavlanin2.m_osoba o ON z.rod_cislo = o.rod_cislo
    WHERE
        zm.od_kedy BETWEEN TO_DATE(:start_date, 'YYYY-MM-DD') AND TO_DATE(:end_date, 'YYYY-MM-DD')
        AND zm.do_kedy BETWEEN TO_DATE(:start_date, 'YYYY-MM-DD') AND TO_DATE(:end_date, 'YYYY-MM-DD')
    GROUP BY
        z.id_zamestnanca,
        o.meno,
        o.priezvisko
    ORDER BY
        doctor_rank
    ''')

    start_date = request.args.get('start_date', '2023-01-01')
    end_date = request.args.get('end_date', '2024-12-31')

    results = db.session.execute(query, {'start_date': start_date, 'end_date': end_date}).fetchall()

    shifts = []
    for row in results:
        shifts.append({
            'id_zamestnanca': row[0],
            'meno': row[1],
            'priezvisko': row[2],
            'total_hours': row[3],
            'doctor_rank': row[4]
        })

    to_return = {
        'username': select_current_user().login,
        'shift_analysis': shifts
    }
    return jsonify(to_return)


#TODO nefunguje nepouzivat !!
@pds_api.route('/readmissions_analysis/')
def readmissions_analysis():
    query = text('''
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'id_poistenca' VALUE sub.id_poistenca,
            'meno' VALUE sub.meno,
            'priezvisko' VALUE sub.priezvisko,
            'pocet_readmisii' VALUE sub.readmission_count,
            'priemerne_dni_medzi' VALUE sub.avg_days,
            'rank' VALUE sub.patient_rank,
            'posledne_prepustenie' VALUE sub.last_discharge,
            'posledna_readmisia' VALUE sub.last_readmission
        )
    ) AS readmissions_json
    FROM (
        SELECT 
            p.id_poistenca,
            o.meno,
            o.priezvisko,
            COUNT(*) as readmission_count,
            ROUND(AVG(h2.datum_od - h1.datum_do), 2) as avg_days,
            DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) as patient_rank,
            MAX(TO_CHAR(h1.datum_do, 'YYYY-MM-DD')) as last_discharge,
            MAX(TO_CHAR(h2.datum_od, 'YYYY-MM-DD')) as last_readmission
        FROM 
            pavlanin2.m_hospitalizacia h1
        JOIN 
            pavlanin2.m_hospitalizacia h2 ON h1.pacient = h2.pacient
            AND h2.datum_od > h1.datum_do 
            AND h2.datum_od <= h1.datum_do + 30
        JOIN
            pavlanin2.m_pacient p ON h1.pacient = p.id_poistenca
        JOIN
            pavlanin2.m_osoba o ON p.rod_cislo = o.rod_cislo
        WHERE
            h1.datum_do IS NOT NULL
            AND h1.datum_do BETWEEN TO_DATE(:start_date, 'YYYY-MM-DD') AND TO_DATE(:end_date, 'YYYY-MM-DD')
        GROUP BY
            p.id_poistenca,
            o.meno,
            o.priezvisko
        ORDER BY
            readmission_count DESC
    ) sub
    ''')

    start_date = request.args.get('start_date', '2024-01-01')
    end_date = request.args.get('end_date', '2024-12-31')

    result = db.session.execute(query, {'start_date': start_date, 'end_date': end_date}).fetchone()

    to_return = {
        'username': select_current_user().login,
        'readmissions': result[0] if result and result[0] else '[]'
    }

    return jsonify(to_return)

@pds_api.route('/room_usage_analysis/')
def room_usage_analysis():
    query = text('''
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'cislo_miestnosti' VALUE sub.cislo_miestnosti,
            'typ' VALUE sub.typ,
            'kapacita' VALUE sub.kapacita,
            'celkove_vyuzitie' VALUE sub.total_usage,
            'rank' VALUE sub.room_rank
        )
    ) AS room_usage_json
    FROM (
        SELECT 
            m.cislo_miestnosti,
            m.typ,
            m.kapacita,
            COUNT(h.id_hospitalizacie) as total_usage,
            DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) as room_rank
        FROM 
            pavlanin2.m_miestnost m
        JOIN 
            pavlanin2.m_hospitalizacia h ON m.cislo_miestnosti = h.miestnost
        WHERE 
            h.datum_od BETWEEN TO_DATE(:start_date, 'YYYY-MM-DD') AND TO_DATE(:end_date, 'YYYY-MM-DD')
        GROUP BY 
            m.cislo_miestnosti,
            m.typ,
            m.kapacita
        ORDER BY 
            total_usage DESC
    ) sub
    ''')

    start_date = request.args.get('start_date', '2024-01-01')
    end_date = request.args.get('end_date', '2024-12-31')

    result = db.session.execute(query, {'start_date': start_date, 'end_date': end_date}).fetchone()

    to_return = {
        'username': select_current_user().login,
        'room_usage': result[0] if result and result[0] else '[]'
    }

    return jsonify(to_return)


@pds_api.route('/prescription_monthly_analysis/')
def prescription_monthly_analysis():
    query = text('''
    SELECT *
    FROM (
        SELECT 
            TO_CHAR(r.vystavenie, 'YYYY-MM') as month_year,
            p.id_poistenca,
            o.meno,
            o.priezvisko,
            COUNT(*) as prescription_count,
            ROW_NUMBER() OVER (
                PARTITION BY TO_CHAR(r.vystavenie, 'YYYY-MM') 
                ORDER BY COUNT(*) DESC,
                         p.id_poistenca
            ) as patient_order
        FROM 
            pavlanin2.m_recept r
        JOIN 
            pavlanin2.m_pacient p ON r.pacient = p.id_poistenca
        JOIN 
            pavlanin2.m_osoba o ON p.rod_cislo = o.rod_cislo
        WHERE
            r.vystavenie BETWEEN TO_DATE(:start_date, 'YYYY-MM-DD') AND TO_DATE(:end_date, 'YYYY-MM-DD')
        GROUP BY 
            TO_CHAR(r.vystavenie, 'YYYY-MM'),
            p.id_poistenca,
            o.meno,
            o.priezvisko
    ) ranked
    WHERE patient_order <= 5
    ORDER BY
        month_year,
        prescription_count DESC,
        patient_order
    ''')

    start_date = request.args.get('start_date', '2024-01-01')
    end_date = request.args.get('end_date', '2024-12-31')

    results = db.session.execute(query, {'start_date': start_date, 'end_date': end_date}).fetchall()

    prescription_data = []
    for row in results:
        prescription_data.append({
            'month_year': row[0],
            'id_poistenca': row[1],
            'meno': row[2],
            'priezvisko': row[3],
            'prescription_count': row[4],
            'patient_order': row[5]
        })

    to_return = {
        'username': select_current_user().login,
        'prescription_analysis': prescription_data
    }

    return jsonify(to_return)

@pds_api.route('/doctor_prescription_analysis/')
def doctor_prescription_analysis():
    query = text('''
    SELECT
        r.lekar,
        s.NAZOV_SPECIALIZACIE,
        o.meno,
        o.priezvisko,
        COUNT(*) AS prescriptions_count,
        DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) AS doctor_rank
    FROM
        pavlanin2.m_recept r
    JOIN
        pavlanin2.m_zamestnanec z ON z.id_zamestnanca = r.lekar
    JOIN
        pavlanin2.m_osoba o ON z.rod_cislo = o.rod_cislo
    JOIN
        pavlanin2.m_specializacia@dblinkx s on z.specializacia = s.kod_specializacie
    WHERE
        r.vystavenie BETWEEN TO_DATE(:start_date, 'YYYY-MM-DD') AND TO_DATE(:end_date, 'YYYY-MM-DD')
    GROUP BY
        r.lekar,
        s.NAZOV_SPECIALIZACIE,
        o.rod_cislo,
        o.meno,
        o.priezvisko
    ORDER BY
        doctor_rank
    ''')

    start_date = request.args.get('start_date', '2024-01-01')
    end_date = request.args.get('end_date', '2024-12-31')

    results = db.session.execute(query, {'start_date': start_date, 'end_date': end_date}).fetchall()

    doctor_data = []
    for row in results:
        doctor_data.append({
            'lekar': row[0],
            'specializacia': row[1],
            'meno': row[2],
            'priezvisko': row[3],
            'prescriptions_count': row[4],
            'doctor_rank': row[5]
        })

    to_return = {
        'username': select_current_user().login,
        'doctor_analysis': doctor_data
    }

    return jsonify(to_return)