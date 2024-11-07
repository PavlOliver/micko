import json

from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def create_app():
    with open('backend/static/config.json') as config_file:
        config = json.load(config_file)

    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
    app.config['SECRET_KEY'] = "our secret key"
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f'oracle+oracledb://{config["username"]}:{config["password"]}@{config["hostname"]}:{config["port"]}/{config["sid"]}')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    from .views import views
    from .auth import auth
    from .test_routes import test_routes
    from .api import api

    app.register_blueprint(views)
    app.register_blueprint(auth)
    app.register_blueprint(test_routes)
    app.register_blueprint(api)

    from .models import Pouzivatel

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id_user):
        return Pouzivatel.query.get(id_user)

    db.init_app(app)
    with app.app_context():
        db.create_all()

    return app