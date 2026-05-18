import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "skillwatch.db")
print("Target DB path:", db_path)

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN last_login DATETIME;")
        conn.commit()
        print("[SUCCESS] last_login column added successfully to users table!")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
            print("[INFO] Column last_login already exists.")
        else:
            print("[ERROR]", e)
    finally:
        conn.close()
else:
    print("[ERROR] Database file not found at", db_path)
