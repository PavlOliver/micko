from flask import Blueprint, request, jsonify, session
from flask_login import login_user, current_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash

from . import db
from .models import Pouzivatel

auth = Blueprint('auth', __name__)


@auth.route('/login', methods=['POST'])
def login():
    print(request.json)
    user = Pouzivatel.query.filter_by(login=request.json['username']).first()
    if user is None or check_password_hash(user.heslo, request.json['password']) is False:
        return jsonify({"message": "Invalid username or password", "status": "fail"}), 401
    else:
        login_user(user, remember=True)
        session['user'] = user.id_zamestnanca
        return jsonify({"message": "Logged in", "status": "success"}), 200


@auth.route('/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({"message": "Logged out", "status": "success"}), 200


@auth.route('/hash_all')
def hash_all():
    users = Pouzivatel.query.all()
    for user in users:
        user.heslo = generate_password_hash('password123')
    db.session.commit()
    return jsonify({"message": "All passwords hashed", "status": "success"}), 200
