#!/usr/bin/env python3
"""
migrate_sqlite_to_postgres.py

Script para migrar datos de SQLite (sistema antiguo) a PostgreSQL (nuevo)
Migra usuarios y sus contraseñas preservando compatibilidad
"""
import sqlite3
import psycopg2
import os
import sys
from pathlib import Path

# Añadir parent directory al path para imports
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.core.config import settings
from app.core.security import hash_password

def migrate():
    print("🔄 Migración de SQLite a PostgreSQL")
    print("=" * 50)

    # 1. Conectar a SQLite antiguo
    sqlite_path = Path(__file__).parent.parent / "sireset.db"
    if not sqlite_path.exists():
        print(f"❌ No se encontró {sqlite_path}")
        print("Buscando en data/...")
        sqlite_path = Path(__file__).parent.parent / "data" / "auth.db"

    if not sqlite_path.exists():
        print("❌ No se encontró base de datos SQLite antigua")
        return

    print(f"📂 SQLite: {sqlite_path}")
    sqlite_conn = sqlite3.connect(str(sqlite_path))
    sqlite_conn.row_factory = sqlite3.Row

    # 2. Conectar a PostgreSQL nuevo
    print(f"🐘 PostgreSQL: {settings.DATABASE_URL}")
    try:
        pg_conn = psycopg2.connect(settings.DATABASE_URL)
        pg_cursor = pg_conn.cursor()
    except Exception as e:
        print(f"❌ Error conectando a PostgreSQL: {e}")
        print("\nAsegúrate de:")
        print("1. Tener DATABASE_URL configurado en .env")
        print("2. Base de datos PostgreSQL creada y accesible")
        return

    # 3. Crear tablas en PostgreSQL si no existen
    print("🔨 Creando tablas en PostgreSQL...")
    pg_cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR UNIQUE NOT NULL,
            name VARCHAR NOT NULL,
            role VARCHAR NOT NULL,
            pw_hash VARCHAR NOT NULL,
            active BOOLEAN NOT NULL DEFAULT TRUE,
            modules JSON NOT NULL DEFAULT '[]'
        )
    """)

    pg_cursor.execute("""
        CREATE TABLE IF NOT EXISTS modules (
            code VARCHAR PRIMARY KEY,
            title VARCHAR NOT NULL,
            description VARCHAR,
            enabled BOOLEAN NOT NULL DEFAULT TRUE
        )
    """)

    pg_conn.commit()

    # 4. Migrar módulos
    print("\n📦 Migrando módulos...")
    sqlite_cursor = sqlite_conn.cursor()
    sqlite_cursor.execute("SELECT * FROM modules")
    modules = sqlite_cursor.fetchall()

    for mod in modules:
        pg_cursor.execute("""
            INSERT INTO modules (code, title, enabled)
            VALUES (%s, %s, %s)
            ON CONFLICT (code) DO UPDATE
            SET title = EXCLUDED.title, enabled = EXCLUDED.enabled
        """, (mod["code"], mod["title"], bool(mod["enabled"])))

    pg_conn.commit()
    print(f"✅ {len(modules)} módulos migrados")

    # 5. Migrar usuarios
    print("\n👥 Migrando usuarios...")
    sqlite_cursor.execute("SELECT * FROM users")
    users = sqlite_cursor.fetchall()

    migrated = 0
    for user in users:
        # Convertir modules JSON
        import json
        modules = json.loads(user["modules"]) if user["modules"] else []

        # Insertar usuario (el hash se mantiene, será migrado en primer login)
        try:
            pg_cursor.execute("""
                INSERT INTO users (email, name, role, pw_hash, active, modules)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (email) DO UPDATE
                SET name = EXCLUDED.name,
                    role = EXCLUDED.role,
                    active = EXCLUDED.active,
                    modules = EXCLUDED.modules
            """, (
                user["email"],
                user["name"],
                user["role"],
                user["pw_hash"],
                bool(user["active"]),
                json.dumps(modules)
            ))
            migrated += 1
            print(f"  ✓ {user['email']} ({user['role']})")
        except Exception as e:
            print(f"  ✗ Error migrando {user['email']}: {e}")

    pg_conn.commit()
    print(f"\n✅ {migrated}/{len(users)} usuarios migrados")

    # 6. Verificación
    print("\n🔍 Verificando migración...")
    pg_cursor.execute("SELECT COUNT(*) FROM users")
    user_count = pg_cursor.fetchone()[0]

    pg_cursor.execute("SELECT COUNT(*) FROM modules")
    module_count = pg_cursor.fetchone()[0]

    print(f"  PostgreSQL tiene ahora:")
    print(f"  - {user_count} usuarios")
    print(f"  - {module_count} módulos")

    # Listar usuarios migrados
    pg_cursor.execute("SELECT email, name, role, active FROM users ORDER BY id")
    print("\n  Usuarios en PostgreSQL:")
    for u in pg_cursor.fetchall():
        status = "✓" if u[3] else "✗"
        print(f"    {status} {u[0]} - {u[1]} ({u[2]})")

    # Cerrar conexiones
    sqlite_conn.close()
    pg_conn.close()

    print("\n" + "=" * 50)
    print("✅ Migración completada exitosamente")
    print("\nNotas importantes:")
    print("1. Los passwords se migraron en formato legacy (pbkdf2$...)")
    print("2. Se actualizarán automáticamente a 600k iteraciones en el primer login")
    print("3. La base de datos SQLite antigua NO fue eliminada (backup de seguridad)")

if __name__ == "__main__":
    migrate()
