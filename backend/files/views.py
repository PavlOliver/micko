from flask import Blueprint, jsonify, request
from flask_login import login_required

from . import db
from .queries import select_current_user

views = Blueprint('views', __name__)


@views.route('/home')
@login_required
def home():
    if select_current_user():
        return jsonify({'username': select_current_user().login})
    return jsonify({'error': 'User not found'})


@views.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == 'GET':
        if select_current_user():
            return jsonify({'username': select_current_user().login})
        return jsonify({'error': 'User not found'})
    else:
        new_password = request.json['new_password']
        select_current_user().heslo = new_password
        db.session.commit()
        return jsonify({'message': 'Profile updated'})
