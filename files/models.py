from flask_sqlalchemy import SQLAlchemy
from files import db


class YourModel(db.Model):
    __tablename__ = 'your_table_name'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
