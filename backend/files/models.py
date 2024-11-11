from uuid import uuid4

from flask_login import UserMixin
from sqlalchemy.dialects.oracle import VARCHAR2, CHAR, DATE, NUMBER
from sqlalchemy.types import CLOB, UserDefinedType

from backend.files import db


class TAdresa(UserDefinedType):
    def get_col_spec(self):
        return "m_t_adresa"

    def bind_processor(self, dialect):
        def process(value):
            if value is not None:
                return f"{value['ulica']},{value['mesto']},{value['psc']}"
            return value

        return process

    def result_processor(self, dialect, coltype):
        def process(value):
            if value is not None:
                return {
                    'ulica': value.ULICA,
                    'mesto': value.MESTO,
                    'psc': value.PSC
                }
            return value

        return process


class TNudzovyKontakt(UserDefinedType):
    def get_col_spec(self):
        return "m_t_nudzovy_kontakt"

    def bind_processor(self, dialect):
        def process(value):
            if value is not None:
                return f"{value['meno']},{value['priezvisko']},{value['tel_cislo']},{value['vztah']}"
            return value

        return process

    def result_processor(self, dialect, coltype):
        def process(value):
            if value is not None:
                return {
                    'meno': value.MENO,
                    'priezvisko': value.PRIEZVISKO,
                    'tel_cislo': value.TEL_CISLO,
                    'vztah': value.VZTAH
                }
            return value

        return process


class MNTAtc(UserDefinedType):
    def get_col_spec(self):
        return "m_nt_atc"

    def bind_processor(self, dialect):
        def process(value):
            if value is not None:
                return [f"{item['kod_atc']},{item['nazov_atc']}" for item in value]
            return value

        return process

    def result_processor(self, dialect, coltype):
        def process(value):
            if value is not None:
                return [{'kod_atc': item.KOD_ATC, 'nazov_atc': item.NAZOV_ATC} for item in value]
            return value

        return process


class Diagnoza(db.Model):
    __tablename__ = 'm_diagnoza'

    kod_diagnozy = db.Column(VARCHAR2(9), primary_key=True)
    nazov_diagnozy = db.Column(VARCHAR2(255), nullable=False)
    doplnujuce_info = db.Column(CLOB, nullable=True)


class Osoba(db.Model):
    __tablename__ = 'm_osoba'

    rod_cislo = db.Column(VARCHAR2(10), nullable=False, primary_key=True)
    meno = db.Column(VARCHAR2(50), nullable=False)
    priezvisko = db.Column(VARCHAR2(50), nullable=False)
    adresa = db.Column(TAdresa, nullable=True)
    tel_cislo = db.Column(VARCHAR2(50), nullable=True)


class Pacient(db.Model):
    __tablename__ = 'm_pacient'

    id_poistenca = db.Column(VARCHAR2(10), primary_key=True)
    rod_cislo = db.Column(VARCHAR2(10), db.ForeignKey('m_osoba.rod_cislo'), nullable=False)
    datum_od = db.Column(DATE, nullable=False)
    nudzovy_kontakt = db.Column(TNudzovyKontakt, nullable=True)


class Specializacia(db.Model):
    __tablename__ = 'm_specializacia'

    kod_specializacie = db.Column(NUMBER(38, 0), primary_key=True)
    nazov_specializacie = db.Column(VARCHAR2(50), nullable=False)
    popis = db.Column(VARCHAR2(255), nullable=True)


class Zamestnanec(db.Model):
    __tablename__ = 'm_zamestnanec'

    id_zamestnanca = db.Column(CHAR(6), primary_key=True)
    rod_cislo = db.Column(VARCHAR2(10), db.ForeignKey('m_osoba.rod_cislo'), nullable=False)
    specializacia = db.Column(NUMBER(38, 0), db.ForeignKey('m_specializacia.kod_specializacie'), nullable=False)
    fotka = db.Column(VARCHAR2(20), nullable=True)


class Pouzivatel(db.Model, UserMixin):
    __tablename__ = 'm_pouzivatel'

    id_zamestnanca = db.Column(CHAR(6), db.ForeignKey('m_zamestnanec.id_zamestnanca'), primary_key=True)
    login = db.Column(VARCHAR2(50), nullable=False)
    heslo = db.Column(VARCHAR2(50), nullable=False)
    rola = db.Column(CHAR(1), nullable=False)

    def get_id(self):
        return str(self.id_zamestnanca)


class ZdravotnyZaznam(db.Model):
    __tablename__ = 'm_zdravotny_zaznam'

    id_zaznamu = db.Column(NUMBER(38, 0), primary_key=True)
    lekar = db.Column(CHAR(6), db.ForeignKey('m_zamestnanec.id_zamestnanca'), nullable=False)
    pacient = db.Column(VARCHAR2(10), db.ForeignKey('m_pacient.id_poistenca'), nullable=False)
    kod_diagnozy = db.Column(CHAR(6), db.ForeignKey('m_diagnoza.kod_diagnozy'), nullable=False)
    datum_vysetrenia = db.Column(DATE, nullable=False)
    popis = db.Column(CLOB, nullable=True)


class Miestnost(db.Model):
    __tablename__ = 'm_miestnost'

    cislo_miestnosti = db.Column(CHAR(5), primary_key=True)
    typ = db.Column(VARCHAR2(50), nullable=False)
    kapacita = db.Column(NUMBER(38, 0), nullable=False)
    stav = db.Column(CHAR(1), nullable=False)


class Zmena(db.Model):
    __tablename__ = 'm_zmena'

    zamestnanec = db.Column(CHAR(6), db.ForeignKey('m_zamestnanec.id_zamestnanca'), primary_key=True)
    od_kedy = db.Column(DATE, primary_key=True)
    do_kedy = db.Column(DATE, nullable=False)
    typ_zmeny = db.Column(VARCHAR2(50), nullable=False)
    miestnost = db.Column(CHAR(5), db.ForeignKey('m_miestnost.cislo_miestnosti'), nullable=True)


class Objednavka(db.Model):
    __tablename__ = 'm_objednavka'

    id_objednavky = db.Column(NUMBER(38, 0), primary_key=True)
    datum_objednavky = db.Column(DATE, nullable=False)
    miesnost = db.Column(CHAR(5), db.ForeignKey('m_miestnost.cislo_miestnosti'), nullable=False)
    pacient = db.Column(VARCHAR2(10), db.ForeignKey('m_pacient.id_poistenca'), nullable=False)
    lekar = db.Column(CHAR(6), db.ForeignKey('m_zamestnanec.id_zamestnanca'), nullable=False)


class Hospitalizacia(db.Model):
    __tablename__ = 'm_hospitalizacia'

    id_hospitalizacie = db.Column(NUMBER(38, 0), primary_key=True)
    pacient = db.Column(VARCHAR2(10), db.ForeignKey('m_pacient.id_poistenca'), nullable=False)
    datum_od = db.Column(DATE, nullable=False)
    datum_do = db.Column(DATE, nullable=False)
    miestnost = db.Column(CHAR(5), db.ForeignKey('m_miestnost.cislo_miestnosti'), nullable=False)
    dovod = db.Column(VARCHAR2(255), nullable=False)
    lekar = db.Column(CHAR(6), db.ForeignKey('m_zamestnanec.id_zamestnanca'), nullable=False)


class Liek(db.Model):
    __tablename__ = 'm_liek'

    kod_lieku = db.Column(CHAR(5), primary_key=True)
    reg_cislo = db.Column(VARCHAR2(50), nullable=False)
    doplnok = db.Column(VARCHAR2(50), nullable=True)
    stav = db.Column(CHAR(1), nullable=False)
    typ_reg_proc = db.Column(VARCHAR2(50), nullable=False)
    drzitel = db.Column(VARCHAR2(50), nullable=False)
    indikacna_skupina = db.Column(NUMBER(38, 0), nullable=False)
    atc_kol = db.Column(MNTAtc, nullable=True)
    expiracia = db.Column(NUMBER(38, 0), nullable=False)
    podanie = db.Column(VARCHAR2(50), nullable=True)
    vydaj = db.Column(VARCHAR2(50), nullable=False)
    vydanie = db.Column(DATE, nullable=False)


class Recept(db.Model):
    __tablename__ = 'm_recept'

    id_receptu = db.Column(NUMBER(38, 0), primary_key=True)
    liek = db.Column(CHAR(5), db.ForeignKey('m_liek.kod_lieku'), primary_key=True)
    vybrane = db.Column(DATE, nullable=False)
    pacient = db.Column(VARCHAR2(10), db.ForeignKey('m_pacient.id_poistenca'), primary_key=True)
    lekar = db.Column(CHAR(6), db.ForeignKey('m_zamestnanec.id_zamestnanca'), primary_key=True)


class SkladLiekov(db.Model):
    __tablename__ = 'm_sklad_liekov'

    sarza = db.Column(NUMBER(38, 0), primary_key=True)
    liek = db.Column(CHAR(5), db.ForeignKey('m_liek.kod_lieku'), primary_key=True)
    pocet = db.Column(NUMBER(38, 0), nullable=False)
    datum_dodania = db.Column(DATE, nullable=False)
    expiracia = db.Column(DATE, nullable=False)
    faktura_scan = db.Column(VARCHAR2(20), nullable=False)
    pohyb = db.Column(CHAR(1), nullable=False)  # P - prichod, V - vydanie
