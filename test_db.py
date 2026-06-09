import psycopg2

try:
    conn = psycopg2.connect(
        host="aws-1-us-west-2.pooler.supabase.com",
        database="postgres",
        user="postgres.lmfqkenmrinyywvnldks",
        password="distribuidas_techstore",
        port="5432"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    record = cursor.fetchone()
    print("Conexión exitosa a la base de datos:", record)
    
    # Listar tablas
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    tables = cursor.fetchall()
    print("Tablas encontradas:", [t[0] for t in tables])
    
    conn.close()
except Exception as e:
    print("Error de conexión:", e)
