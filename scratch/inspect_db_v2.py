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

print("Tables:")
for table_name in inspector.get_table_names():
    print(f"- {table_name}")

print("\nViews:")
for view_name in inspector.get_view_names():
    print(f"- {view_name}")

print("\nColumns for 'compras':")
for col in inspector.get_columns('compras'):
    print(f" - {col['name']}")
