import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

for schema in inspector.get_schema_names():
    print(f"\nSchema: {schema}")
    for table_name in inspector.get_table_names(schema=schema):
        print(f" - Table: {table_name}")
    for view_name in inspector.get_view_names(schema=schema):
        print(f" - View: {view_name}")
