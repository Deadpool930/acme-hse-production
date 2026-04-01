import psycopg2
from psycopg2 import sql
import os

def setup_postgres():
    # Credentials to create
    TARGET_USER = "hse_user"
    TARGET_PASSWORD = "hse_password"
    TARGET_DB = "acme_hse"
    
    # Try connecting to the default 'postgres' database
    # Assuming the current user (Dell) has access or standard local dev setup
    try:
        # We use autocommit=True to run CREATE DATABASE
        conn = psycopg2.connect(dbname="postgres", user="postgres", host="127.0.0.1")
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Connected to default 'postgres' database.")
        
        # 1. Create User
        try:
            cur.execute(f"CREATE USER {TARGET_USER} WITH PASSWORD '{TARGET_PASSWORD}';")
            print(f"User '{TARGET_USER}' created.")
        except psycopg2.errors.DuplicateObject:
            print(f"User '{TARGET_USER}' already exists.")
            
        # 2. Create Database
        try:
            cur.execute(f"CREATE DATABASE {TARGET_DB} OWNER {TARGET_USER};")
            print(f"Database '{TARGET_DB}' created.")
        except psycopg2.errors.DuplicateDatabase:
            print(f"Database '{TARGET_DB}' already exists.")
            
        cur.close()
        conn.close()
        
        # 3. Run Schema Script
        print(f"Applying schema from postgres_schema.sql to '{TARGET_DB}'...")
        conn = psycopg2.connect(dbname=TARGET_DB, user=TARGET_USER, password=TARGET_PASSWORD, host="127.0.0.1")
        conn.autocommit = True
        cur = conn.cursor()
        
        schema_path = r"c:\Users\Dell\Desktop\achme\backend\database\postgres_schema.sql"
        if os.path.exists(schema_path):
            with open(schema_path, "r") as f:
                schema_sql = f.read()
                # Split by semicolon for better execution in some cases, 
                # but psycopg2 handles bulk well.
                # However, Postgres Enum creation (DO $$) needs to be handled as one block.
                cur.execute(schema_sql)
            print("Schema applied successfully.")
        else:
            print(f"Error: Schema file not found at {schema_path}")
            
        cur.close()
        conn.close()
        print("Database setup complete!")
        
    except Exception as e:
        print(f"Critical Error during DB setup: {e}")
        print("\nNote: Ensure your PostgreSQL 18 service is running and 'postgres' user has trust/peer access for local connections.")

if __name__ == "__main__":
    setup_postgres()
