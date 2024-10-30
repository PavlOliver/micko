from .models import YourModel


def select_test():
    items = YourModel.query.all()
    names = [item.name for item in items]
    return str(names)
