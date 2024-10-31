from backend.files import db


class YourModel(db.Model):
    __tablename__ = 'your_table_name'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))


class Diagnoza(db.Model):
    kod_diagnozy = db.Column(db.String(6), primary_key=True)
    nazov_diagnozy = db.Column(db.String(255), nullable=False)
    doplnujuce_info = db.Column(db.String(700), nullable=True)
