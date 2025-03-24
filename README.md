### Frontend
`npx create-next-app@latest frontend`

`npm install axios`

`npm install react-icons`

`npm install @headlessui/react`

### Backend
__venv:__

`pip install flask`
`pip install flask-cors`

`pip install python-dotenv pyjwt`

`pip install bcrypt`

`pip install flask-sqlalchemy psycopg2-binary`


### Databse

`sudo -u postgres createdb ixios_db`

`sudo -u postgres psql -c "CREATE USER iamuser WITH PASSWORD 'iampass';"`

`sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ixios_db TO iamuser;"`

`sudo -u postgres psql -c "ALTER USER iamuser WITH SUPERUSER;"`

`psql -U iamuser -d ixios_db -c "SELECT * FROM user;"`
