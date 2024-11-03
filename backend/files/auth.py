from flask import Blueprint, request, jsonify, url_for, redirect, session
from flask_jwt_extended import jwt_required, get_jwt_identity
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
        return jsonify({"access_token": 'xxxx', "status": "success"}), 200


@auth.route('/x')
def x():
    session['user'] = Pouzivatel.query.first().id_zamestnanca
    return 'x'


@auth.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('auth.login'))


@auth.route('/xx')
@login_required
def xx():
    if current_user.is_authenticated:
        return jsonify({'username': current_user.login})
    return jsonify({'error': 'error'})


@auth.route('/tst')
@jwt_required()
def tst():
    current_user_id = get_jwt_identity()
    user = Pouzivatel.query.get(current_user_id)
    return 'tst'
