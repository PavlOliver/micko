import datetime

from backend.files import create_app

app = create_app()


@app.route('/data')
def get_time():
    # Returning an api for showing in  reactjs
    return {
        'Name': "geek",
        "Age": "22",
        "Date": datetime.datetime.now(),
        "programming": "python"
    }


if __name__ == '__main__':
    app.run(debug=True)
