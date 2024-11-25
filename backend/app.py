from backend.files import create_app

app = create_app()

#crete route that will return files from my static folder

if __name__ == '__main__':
    app.run(debug=True)
