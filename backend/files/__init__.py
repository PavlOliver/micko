import json
from flask_cors import CORS
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def create_app():
    with open('backend/static/config.json') as config_file:
        config = json.load(config_file)

    app = Flask(__name__)
    CORS(app)
    app.config['SECRET_KEY'] = "our secret key"
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f'oracle+oracledb://{config["username"]}:{config["password"]}@{config["hostname"]}/{config["sid"]}')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    from .views import views
    from .auth import auth

    app.register_blueprint(views)
    app.register_blueprint(auth)

    db.init_app(app)
    with app.app_context():
        db.create_all()

    return app
