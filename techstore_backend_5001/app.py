import os
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración de Supabase (PostgreSQL)
# Usaremos las credenciales directas proporcionadas
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres.lmfqkenmrinyywvnldks:distribuidas_techstore@aws-1-us-west-2.pooler.supabase.com:5432/postgres"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Configuración de Firebase Admin
if not firebase_admin._apps:
    try:
        import json
        if 'FIREBASE_CREDENTIALS_JSON' in os.environ:
            cred_dict = json.loads(os.environ['FIREBASE_CREDENTIALS_JSON'])
            cred = credentials.Certificate(cred_dict)
        else:
            cred = credentials.Certificate('firebase-credentials.json')
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print("Advertencia: No se pudo inicializar Firebase Admin:", e)

# Decorador para proteger rutas
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split(" ")
            if len(parts) > 1:
                token = parts[1]

        if not token:
            return jsonify({'error': 'Token faltante'}), 401

        try:
            usuario_decodificado = auth.verify_id_token(token)
            request.user = usuario_decodificado
        except Exception as e:
            return jsonify({'error': 'Token inválido', 'detalle': str(e)}), 401

        return f(*args, **kwargs)
    return decorated

# --- MODELOS ---
class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    firebase_uid = db.Column(db.String(128), unique=True)
    nombre = db.Column(db.String(100))
    correo = db.Column(db.String(100), unique=True)
    rol = db.Column(db.String(50), default='cliente')
    eliminado = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Producto(db.Model):
    __tablename__ = 'productos'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    descripcion = db.Column(db.String(500))
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    stock = db.Column(db.Integer, default=0)
    imagen = db.Column(db.String(255))
    eliminado = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Compra(db.Model):
    __tablename__ = 'compras'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    total = db.Column(db.Numeric(10, 2), default=0.0)
    estado = db.Column(db.String(50), default='completada')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    detalles = db.relationship('DetalleCompra', backref='compra', lazy=True)

class DetalleCompra(db.Model):
    __tablename__ = 'detalle_compras'
    id = db.Column(db.Integer, primary_key=True)
    compra_id = db.Column(db.Integer, db.ForeignKey('compras.id'))
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'))
    cantidad = db.Column(db.Integer, nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)

# --- RUTAS DE LA API ---
@app.route('/api/', methods=['GET'])
def index():
    return jsonify({"mensaje": "API TechStore 360 funcionando correctamente"})

# USUARIOS
@app.route('/api/usuarios', methods=['GET'])
@token_required
def get_usuarios():
    # Sync with Firebase logic could go here, but for now we read from DB + Firebase Admin
    usuarios = Usuario.query.all()
    resultado = []
    
    # Try to augment with Firebase data
    for u in usuarios:
        try:
            fb_user = auth.get_user(u.firebase_uid)
            is_disabled = fb_user.disabled
        except Exception:
            is_disabled = u.eliminado
            
        # FIX: created_at.strftime bug fixed by checking type
        fecha = ""
        if u.created_at:
            if isinstance(u.created_at, str):
                fecha = u.created_at
            else:
                fecha = u.created_at.strftime("%Y-%m-%d %H:%M:%S")

        resultado.append({
            "id": u.id,
            "firebase_uid": u.firebase_uid,
            "nombre": u.nombre,
            "correo": u.correo,
            "rol": u.rol,
            "eliminado": is_disabled,
            "fecha_registro": fecha
        })
    return jsonify(resultado), 200

@app.route('/api/usuarios', methods=['POST'])
def create_usuario():
    datos = request.json
    uid = datos.get('firebase_uid')
    correo = datos.get('correo')
    nombre = datos.get('nombre')
    
    # Check if exists
    existe = Usuario.query.filter_by(correo=correo).first()
    if existe:
        return jsonify({"mensaje": "Usuario ya existe en BD", "id": existe.id}), 200

    nuevo_user = Usuario(firebase_uid=uid, correo=correo, nombre=nombre)
    db.session.add(nuevo_user)
    db.session.commit()
    return jsonify({"mensaje": "Usuario creado", "id": nuevo_user.id}), 201

@app.route('/api/usuarios/<int:id>', methods=['PUT'])
@token_required
def update_usuario(id):
    datos = request.json
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # Reactivar
    if datos.get('eliminado') is False:
        usuario.eliminado = False
        try:
            auth.update_user(usuario.firebase_uid, disabled=False)
        except: pass
        db.session.commit()
        return jsonify({"mensaje": "Usuario reactivado"}), 200

    if 'nombre' in datos:
        usuario.nombre = datos['nombre']
        try:
            auth.update_user(usuario.firebase_uid, display_name=datos['nombre'])
        except: pass

    if 'rol' in datos:
        usuario.rol = datos['rol']
        try:
            auth.set_custom_user_claims(usuario.firebase_uid, {'role': datos['rol']})
        except: pass

    db.session.commit()
    return jsonify({"mensaje": "Usuario actualizado"}), 200

@app.route('/api/usuarios/<int:id>', methods=['DELETE'])
@token_required
def delete_usuario(id):
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    usuario.eliminado = True
    try:
        auth.update_user(usuario.firebase_uid, disabled=True)
    except: pass

    db.session.commit()
    return jsonify({"mensaje": "Usuario desactivado"}), 200

# PRODUCTOS
@app.route('/api/productos', methods=['GET'])
def get_productos():
    productos = Producto.query.all()
    resultado = []
    for p in productos:
        resultado.append({
            "id": p.id,
            "nombre": p.nombre,
            "descripcion": p.descripcion,
            "precio": float(p.precio),
            "stock": p.stock,
            "imagen": p.imagen,
            "eliminado": p.eliminado
        })
    return jsonify(resultado), 200

@app.route('/api/productos', methods=['POST'])
@token_required
def crear_producto():
    datos = request.json
    nuevo = Producto(
        nombre=datos['nombre'], 
        descripcion=datos.get('descripcion'),
        precio=datos['precio'], 
        stock=datos.get('stock', 0), 
        imagen=datos.get('imagen')
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({"mensaje": "Producto creado", "id": nuevo.id}), 201

@app.route('/api/productos/<int:id>', methods=['PUT'])
@token_required
def editar_producto(id):
    producto = Producto.query.get(id)
    if not producto:
        return jsonify({"error": "No encontrado"}), 404
        
    datos = request.json
    if 'eliminado' in datos:
        producto.eliminado = datos['eliminado']
    
    if 'nombre' in datos: producto.nombre = datos['nombre']
    if 'descripcion' in datos: producto.descripcion = datos['descripcion']
    if 'precio' in datos: producto.precio = datos['precio']
    if 'stock' in datos: producto.stock = datos['stock']
    if 'imagen' in datos: producto.imagen = datos['imagen']
    
    db.session.commit()
    return jsonify({"mensaje": "Producto actualizado"}), 200

@app.route('/api/productos/<int:id>', methods=['DELETE'])
@token_required
def eliminar_producto(id):
    producto = Producto.query.get(id)
    if not producto:
        return jsonify({"error": "No encontrado"}), 404
    producto.eliminado = True
    db.session.commit()
    return jsonify({"mensaje": "Producto eliminado"}), 200

# COMPRAS
@app.route('/api/compras', methods=['GET'])
@token_required
def get_compras():
    compras = Compra.query.order_by(Compra.created_at.desc()).all()
    resultado = []
    for c in compras:
        # User details
        usuario = Usuario.query.get(c.usuario_id)
        
        # Details
        detalles = []
        for d in c.detalles:
            detalles.append({
                "producto_id": d.producto_id,
                "cantidad": d.cantidad,
                "precio_unitario": float(d.subtotal / d.cantidad) if d.cantidad > 0 else 0
            })
            
        fecha = ""
        if c.created_at:
            if isinstance(c.created_at, str): fecha = c.created_at
            else: fecha = c.created_at.strftime("%Y-%m-%d %H:%M:%S")

        resultado.append({
            "id": c.id,
            "usuario_id": c.usuario_id,
            "cliente": usuario.nombre if usuario else f"ID {c.usuario_id}",
            "correo": usuario.correo if usuario else "",
            "total": float(c.total),
            "estado": c.estado,
            "fecha": fecha,
            "detalles": detalles
        })
    return jsonify(resultado), 200

@app.route('/api/compras', methods=['POST'])
@token_required
def crear_compra():
    datos = request.json
    usuario_id = datos.get('usuario_id')
    total = datos.get('total', 0)
    
    nueva = Compra(usuario_id=usuario_id, total=total)
    db.session.add(nueva)
    db.session.flush()  # ← obtiene el ID antes del commit

    for detalle in datos.get('detalles', []):
        producto = Producto.query.get(detalle['producto_id'])
        if producto:
            d = DetalleCompra(
                compra_id=nueva.id,
                producto_id=detalle['producto_id'],
                cantidad=detalle['cantidad'],
                subtotal=float(producto.precio) * detalle['cantidad']
            )
            db.session.add(d)

    db.session.commit()
    return jsonify({"mensaje": "Compra registrada", "id": nueva.id}), 201

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)
