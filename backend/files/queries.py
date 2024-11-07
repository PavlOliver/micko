from flask_login import current_user


def select_current_user():
    if current_user.is_authenticated:
        if current_user.is_anonymous:
            return None
        return current_user
    return None
