import datetime

from flask import Blueprint, jsonify
from flask import request
from flask_login import login_required

views = Blueprint('views', __name__)


@views.route('/')
@login_required
def home():
    return jsonify({'username': 'xxx'})


