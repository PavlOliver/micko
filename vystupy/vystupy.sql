--vystupy sa nachadzaju v /backend/files/pds_api.py,
-- tam su ale vo vacsine nastavene ako selecty v JSON formate kvoli JSON API,
-- prikladam niektore uprave mimo JSON API formatu.

select *
from (
    select meno,
           priezvisko,
           rod_cislo,
           pocet_dni,
           dense_rank() over (order by pocet_dni desc) as por
    from (
        select o.meno, o.priezvisko, o.rod_cislo,
               round(sum(case
                   when h.datum_do is null then
                       greatest(least(to_date(:end_date, 'YYYY-MM-DD'), sysdate) -
                       greatest(h.datum_od, to_date(:start_date, 'YYYY-MM-DD')) + 1, 0)
                   else
                       greatest(h.datum_do - greatest(h.datum_od, to_date(:start_date, 'YYYY-MM-DD')) + 1, 0)
               end)) as pocet_dni
            from pavlanin2.m_osoba o
                join pavlanin2.m_pacient p on o.rod_cislo = p.rod_cislo
                join pavlanin2.m_hospitalizacia h on p.id_poistenca = h.pacient
                    where h.datum_od <= to_date(:end_date, 'YYYY-MM-DD')
                    and (h.datum_do is null or h.datum_do >= to_date(:start_date, 'YYYY-MM-DD'))
                        group by o.meno, o.priezvisko, o.rod_cislo
        )
        order by por
    );

select *
FROM (
    SELECT
        z.id_zamestnanca as lekar,
        os.meno || ' ' || os.priezvisko as lekar_name,
        count(o.pacient) as total_orders,
        rank() over(order by count(o.pacient) desc) as doctor_rank
            FROM pavlanin2.m_zamestnanec z
                left join pavlanin2.m_objednavka o on z.id_zamestnanca = o.lekar
                left join pavlanin2.M_OSOBA os on z.rod_cislo = os.rod_cislo
                    where o.datum_objednavky BETWEEN TO_DATE(:start_date, 'YYYY-MM-DD') AND TO_DATE(:end_date, 'YYYY-MM-DD')
                        GROUP BY z.id_zamestnanca, os.meno, os.priezvisko
    )
        WHERE doctor_rank <= 10
            ORDER BY doctor_rank;

select
    d.kod_diagnozy,
    d.nazov_diagnozy,
    LISTAGG(p.id_poistenca, ', ') within group (order by p.id_poistenca) as pacienti,
    count(p.id_poistenca) as pocet_pacientov
        from pavlanin2.m_diagnoza d
            left join pavlanin2.m_zdravotny_zaznam z ON d.kod_diagnozy = z.kod_diagnozy
            left join pavlanin2.m_pacient p ON z.pacient = p.id_poistenca
            and to_char(z.datum_vysetrenia, 'YYYY') = :year
                group by d.kod_diagnozy, d.nazov_diagnozy
                    order by COUNT(p.id_poistenca) desc;

select year,
    sum(number_of_hospitalizations) AS total_hospitalizations,
    sum(number_of_discharges) AS total_discharges
        from (
            select to_char(datum_od, 'YYYY') as year,
                    COUNT(*) AS number_of_hospitalizations,
                    0 AS number_of_discharges
                        from  pavlanin2.m_hospitalizacia
                            where datum_od IS NOT NULL
                                group by to_char(datum_od, 'YYYY')
    union all
            select to_char(datum_do, 'YYYY') AS year,
                    0 AS number_of_hospitalizations,
                    COUNT(*) AS number_of_discharges
                        from pavlanin2.m_hospitalizacia
                            where datum_do IS NOT NULL
                                group by to_char(datum_do, 'YYYY')
            )
        group by year
            order by year;