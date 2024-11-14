from flask import Blueprint, request, jsonify, url_for, redirect, session
from flask_login import login_user, current_user, logout_user, login_required

from .models import Pouzivatel

auth = Blueprint('auth', __name__)


@auth.route('/login', methods=['POST'])
def login():
    user = Pouzivatel.query.filter_by(login=request.json['username']).first()
    if user is None or user.heslo != request.json['password']:
        return jsonify({"message": "Invalid username or password", "status": "fail"}), 401
    else:
        login_user(user, remember=True)
        session['user'] = user.id_zamestnanca
        return jsonify({"message": "Logged in", "status": "success"}), 200


@auth.route('/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({"message": "Logged out", "status": "success"}), 200


@auth.route('/x')
def x():
    session['user'] = Pouzivatel.query.first().id_zamestnanca
    return 'x'


@auth.route('/xx')
@login_required
def xx():
    if current_user.is_authenticated:
        return jsonify({'username': current_user.login})
    return jsonify({'error': 'error'})

