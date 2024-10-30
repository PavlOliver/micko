from flask import Blueprint
from .queries import select_test
from .models import Diagnoza, db
import csv

views = Blueprint('views', __name__)


@views.route('/')
def index():
    names = select_test()
    return names



