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


class TAtc(UserDefinedType):
    def get_col_spec(self):
        return "m_t_atc"

    def bind_processor(self, dialect):
        def process(value):
            if value is not None:
                return f"{value['kod_atc']},{value['nazov_atc']}"
            return value

        return process

    def result_processor(self, dialect, coltype):
        def process(value):
            if value is not None:
                return {
                    'kod_atc': value.KOD_ATC,
                    'nazov_atc': value.NAZOV_ATC
                }
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

    def get_full_name(self):
        osoba = Osoba.query.filter(Osoba.rod_cislo == self.rod_cislo).first()
        return f"{osoba.meno} {osoba.priezvisko}" if osoba else None

    def get_name(self):
        osoba = Osoba.query.filter(Osoba.rod_cislo == self.rod_cislo).first()
        return osoba.meno if osoba else None

    def get_surename(self):
        osoba = Osoba.query.filter(Osoba.rod_cislo == self.rod_cislo).first()
        return osoba.priezvisko if osoba else None

    def get_fullname_and_id(self):
        osoba = Osoba.query.filter(Osoba.rod_cislo == self.rod_cislo).first()
        return f"{osoba.meno} {osoba.priezvisko} - {self.id_poistenca}" if osoba else None

    def to_dic(self):
        osoba = Osoba.query.filter(Osoba.rod_cislo == self.rod_cislo).first()
        return {
            'id_poistenca': self.id_poistenca,
            'rodne_cislo': self.rod_cislo,
            'meno': osoba.meno,
            'priezvisko': osoba.priezvisko,
        }

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

    def get_full_name_and_login(self):
        osoba = Osoba.query.filter(Osoba.rod_cislo == self.rod_cislo).first()
        pouzivatel = Pouzivatel.query.filter(Pouzivatel.id_zamestnanca == self.id_zamestnanca).first()
        return f"{osoba.meno} {osoba.priezvisko} - {pouzivatel.login}" if osoba else None

    def get_full_name(self):
        osoba = Osoba.query.filter(Osoba.rod_cislo == self.rod_cislo).first()
        return f"{osoba.meno} {osoba.priezvisko}" if osoba else None


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
    """Model for the table m_miestnost
    Attributes:

        """
    __tablename__ = 'm_miestnost'

    cislo_miestnosti = db.Column(CHAR(4), primary_key=True)
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

    id_objednavky = db.Column(NUMBER(38, 0), primary_key=True, autoincrement=True)
    dovod = db.Column(VARCHAR2(50), nullable=True)
    datum_objednavky = db.Column(DATE, nullable=False)
    pocet_blokov = db.Column(NUMBER(38, 0), nullable=False)
    miestnost = db.Column(CHAR(5), db.ForeignKey('m_miestnost.cislo_miestnosti'), nullable=False)
    pacient = db.Column(VARCHAR2(10), db.ForeignKey('m_pacient.id_poistenca'), nullable=False)
    lekar = db.Column(CHAR(6), db.ForeignKey('m_zamestnanec.id_zamestnanca'), nullable=False)

    def to_dic(self):
        pacient = Pacient.query.filter(Pacient.id_poistenca == self.pacient).first()
        return {
            'id': self.id_objednavky,
            'reason': self.dovod,
            'date': self.datum_objednavky.strftime('%d.%m.%Y'),
            'time': self.datum_objednavky.strftime('%H:%M'),
            'blocks': self.pocet_blokov,
            'room': self.miestnost,
            'patient': pacient.get_fullname_and_id(),
            'doctor': self.lekar,
            'day': self.datum_objednavky.strftime('%A')
        }


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

    kod = db.Column(CHAR(5), primary_key=True)
    nazov = db.Column(VARCHAR2(255), nullable=False)
    reg_cislo = db.Column(VARCHAR2(16), nullable=False)
    doplnok = db.Column(VARCHAR2(120), nullable=False)
    typ_reg = db.Column(VARCHAR2(3), nullable=False)
    drzitel = db.Column(VARCHAR2(12), nullable=False)
    indikacna_skupina = db.Column(NUMBER(38, 0), nullable=True)
    atc = db.Column(TAtc, nullable=True)
    expiracia = db.Column(VARCHAR2(14), nullable=False)
    vydaj = db.Column(VARCHAR2(2), nullable=False) #R-viazany na lek predpis, F-Nie je viazany na lek predpis, Rx-viazany na lek predpis s obmedzenim predpisovania, RB-Viazany na osobitne tlacivo so sikmym modyým pruhom
    kod_statu = db.Column(VARCHAR2(2), nullable=False)
    platnost = db.Column(CHAR(1), nullable=True)
    bezp_prvok = db.Column(CHAR(1), nullable=True)
    datum_reg = db.Column(DATE, nullable=True)


class Recept(db.Model):
    __tablename__ = 'm_recept'

    id_receptu = db.Column(NUMBER(38, 0), primary_key=True, autoincrement=True)
    liek = db.Column(CHAR(5), db.ForeignKey('m_liek.kod'), primary_key=True)
    vybrane = db.Column(DATE, nullable=True)
    vystavenie = db.Column(DATE, nullable=False)
    pacient = db.Column(VARCHAR2(10), db.ForeignKey('m_pacient.id_poistenca'), primary_key=True)
    lekar = db.Column(CHAR(6), db.ForeignKey('m_zamestnanec.id_zamestnanca'), primary_key=True)
    pocet = db.Column(NUMBER(38, 0), nullable=False)
    poznamka = db.Column(VARCHAR2(255), nullable=True)

    def to_dic(self):
        pacient = Pacient.query.filter(Pacient.id_poistenca == self.pacient).first()
        liek = Liek.query.filter(Liek.kod_lieku == self.liek).first()
        lekar = Zamestnanec.query.filter(Zamestnanec.id_zamestnanca == self.lekar).first()
        return {
            'id_receptu': self.id_receptu,
            'liek': liek.nazov if liek else None,
            'vybrane': self.vybrane.strftime('%H:%M %d.%m.%Y'),
            'vystavenie': self.vybrane.strftime('%H:%M %d.%m.%Y'),
            'pacient': pacient.get_full_name() if pacient else None,
            'lekar': lekar.get_full_name_and_login() if lekar else None,
            'pocet': self.pocet,
            'poznamka': self.poznamka
        }


class SkladLiekov(db.Model):
    __tablename__ = 'm_sklad_liekov'

    sarza = db.Column(NUMBER(38, 0), primary_key=True)
    liek = db.Column(CHAR(5), db.ForeignKey('m_liek.kod_lieku'), primary_key=True)
    pocet = db.Column(NUMBER(38, 0), nullable=False)
    datum_dodania = db.Column(DATE, nullable=False)
    expiracia = db.Column(DATE, nullable=False)
    faktura_scan = db.Column(VARCHAR2(20), nullable=False)
    pohyb = db.Column(CHAR(1), nullable=False)  # P - prichod, V - vydanie
