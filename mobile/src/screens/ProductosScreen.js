import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as api from '../api';
import { colores, STOCK_BAJO } from '../theme';
import { Boton, Campo, ErrorForm, Estado, Hoja } from '../components/ui';

const VACIO = { nombre: '', descripcion: '', precio: '', stock: '', id_categoria: null };

function colorStock(stock) {
  if (stock < STOCK_BAJO) return colores.rojo;
  if (stock < 30) return colores.amarillo;
  return colores.verde;
}

// Fila de "chips" para elegir una categoría
function SelectorCategoria({ categorias, valor, onCambiar, conTodas }) {
  const opciones = conTodas ? [{ id_categoria: null, nombre: 'Todas' }, ...categorias] : categorias;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 2 }}>
      {opciones.map((c) => {
        const activo = valor === c.id_categoria;
        return (
          <Pressable
            key={String(c.id_categoria)}
            onPress={() => onCambiar(c.id_categoria)}
            style={[s.chip, activo && s.chipActivo]}
            accessibilityState={{ selected: activo }}
          >
            <Text style={[s.chipTexto, activo && { color: colores.tinta }]}>{c.nombre}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default function ProductosScreen({ avisar }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [filtro, setFiltro] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [formVisible, setFormVisible] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [errorForm, setErrorForm] = useState('');
  const [guardando, setGuardando] = useState(false);

  // READ
  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [prods, cats] = await Promise.all([
        api.getProductos({ buscar, categoria: filtro ?? '' }),
        api.getCategorias()
      ]);
      setProductos(prods);
      setCategorias(cats);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [buscar, filtro]);

  useEffect(() => {
    const t = setTimeout(cargar, 300);
    return () => clearTimeout(t);
  }, [cargar]);

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm({ ...VACIO, id_categoria: filtro });
    setErrorForm('');
    setFormVisible(true);
  };

  const abrirEditar = (p) => {
    setEditandoId(p.id_producto);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: String(p.precio),
      stock: String(p.stock),
      id_categoria: p.id_categoria
    });
    setErrorForm('');
    setFormVisible(true);
  };

  // CREATE / UPDATE
  const guardar = async () => {
    const precio = Number(form.precio.replace(',', '.'));
    const stock = Number(form.stock);
    if (!form.nombre.trim()) return setErrorForm('Escribe el nombre del producto.');
    if (form.precio === '' || isNaN(precio) || precio < 0) return setErrorForm('El precio debe ser 0 o más.');
    if (form.stock === '' || !Number.isInteger(stock) || stock < 0)
      return setErrorForm('El stock debe ser un número entero, 0 o más.');
    if (!form.id_categoria) return setErrorForm('Elige una categoría.');

    const datos = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precio,
      stock,
      id_categoria: form.id_categoria
    };

    setGuardando(true);
    try {
      if (editandoId) {
        await api.actualizarProducto(editandoId, datos);
        avisar('Producto actualizado');
      } else {
        await api.crearProducto(datos);
        avisar('Producto registrado');
      }
      setFormVisible(false);
      cargar();
    } catch (e) {
      setErrorForm(e.message);
    } finally {
      setGuardando(false);
    }
  };

  // DELETE
  const eliminar = (p) => {
    Alert.alert('Eliminar producto', `¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.eliminarProducto(p.id_producto);
            avisar('Producto eliminado');
            cargar();
          } catch (e) {
            avisar(e.message, 'error');
          }
        }
      }
    ]);
  };

  const renderProducto = ({ item: p }) => (
    <View style={s.tarjeta}>
      <View style={s.filaSuperior}>
        <View style={{ flex: 1 }}>
          <Text style={s.nombre}>{p.nombre}</Text>
          {p.descripcion ? <Text style={s.desc}>{p.descripcion}</Text> : null}
        </View>
        <Text style={s.precio}>Bs {Number(p.precio).toFixed(2)}</Text>
      </View>

      <Text style={s.categoria}>{p.categoria}</Text>

      <View style={s.stock}>
        <Text style={[s.stockNumero, p.stock < STOCK_BAJO && { color: colores.rojo }]}>
          {p.stock === 0 ? 'Agotado' : `${p.stock} u.`}
        </Text>
        <View style={s.stockPista}>
          <View
            style={{
              width: `${Math.min(100, (p.stock / 60) * 100)}%`,
              height: '100%',
              backgroundColor: colorStock(p.stock)
            }}
          />
        </View>
      </View>

      <View style={s.acciones}>
        <Boton titulo="Editar" chico onPress={() => abrirEditar(p)} />
        <Boton titulo="Eliminar" chico tipo="peligro" onPress={() => eliminar(p)} />
      </View>
    </View>
  );

  const stockBajo = productos.filter((p) => p.stock < STOCK_BAJO).length;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={error ? [] : productos}
        keyExtractor={(p) => String(p.id_producto)}
        renderItem={renderProducto}
        contentContainerStyle={s.lista}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <View style={s.encabezado}>
              <View>
                <Text style={s.titulo}>Productos</Text>
                <Text style={s.resumen}>
                  {productos.length} productos
                  {stockBajo > 0 && <Text style={{ color: colores.rojo, fontWeight: '600' }}> · {stockBajo} con stock bajo</Text>}
                </Text>
              </View>
              <Boton titulo="Registrar" tipo="principal" onPress={abrirNuevo} />
            </View>
            <Campo etiqueta="Buscar" placeholder="Nombre o descripción" value={buscar} onChangeText={setBuscar} />
            <SelectorCategoria categorias={categorias} valor={filtro} onCambiar={setFiltro} conTodas />
          </View>
        }
        ListEmptyComponent={
          error ? (
            <Estado texto={error} error accion="Reintentar" onAccion={cargar} />
          ) : cargando ? null : (
            <Estado
              texto={buscar || filtro ? 'Ningún producto coincide con la búsqueda.' : 'Todavía no hay productos.'}
              accion={!buscar && !filtro ? 'Registrar el primero' : undefined}
              onAccion={abrirNuevo}
            />
          )
        }
      />

      <Hoja
        visible={formVisible}
        titulo={editandoId ? 'Editar producto' : 'Registrar producto'}
        alCerrar={() => setFormVisible(false)}
      >
        <Campo etiqueta="Nombre" value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} maxLength={150} />
        <Campo
          etiqueta="Descripción"
          value={form.descripcion}
          onChangeText={(v) => setForm({ ...form, descripcion: v })}
          multiline
          maxLength={255}
        />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Campo etiqueta="Precio (Bs)" value={form.precio} onChangeText={(v) => setForm({ ...form, precio: v })} keyboardType="decimal-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Campo etiqueta="Stock" value={form.stock} onChangeText={(v) => setForm({ ...form, stock: v })} keyboardType="number-pad" />
          </View>
        </View>
        <Text style={s.etiqueta}>Categoría</Text>
        <View style={{ marginBottom: 16 }}>
          <SelectorCategoria
            categorias={categorias}
            valor={form.id_categoria}
            onCambiar={(id) => setForm({ ...form, id_categoria: id })}
          />
        </View>
        <ErrorForm texto={errorForm} />
        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
          <Boton titulo="Cancelar" onPress={() => setFormVisible(false)} />
          <Boton
            titulo={guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Registrar producto'}
            tipo="principal"
            disabled={guardando}
            onPress={guardar}
          />
        </View>
      </Hoja>
    </View>
  );
}

const s = StyleSheet.create({
  lista: { padding: 16, paddingBottom: 40 },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  titulo: { fontSize: 32, fontWeight: '700', color: colores.tinta },
  resumen: { color: colores.tintaSuave, marginTop: 2 },
  tarjeta: {
    backgroundColor: colores.panel,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10
  },
  filaSuperior: { flexDirection: 'row', gap: 10 },
  nombre: { fontSize: 17, fontWeight: '600', color: colores.tinta },
  desc: { fontSize: 14, color: colores.tintaSuave, marginTop: 2 },
  precio: { fontSize: 17, fontWeight: '700', color: colores.tinta },
  categoria: {
    alignSelf: 'flex-start',
    backgroundColor: colores.azulClaro,
    color: colores.azul,
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden'
  },
  stock: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  stockNumero: { width: 70, fontSize: 16, fontWeight: '700', color: colores.tinta },
  stockPista: { flex: 1, height: 8, backgroundColor: '#E6EAEE', borderRadius: 2, overflow: 'hidden' },
  acciones: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.linea,
    backgroundColor: colores.panel
  },
  chipActivo: { backgroundColor: colores.amarillo, borderColor: '#C99700' },
  chipTexto: { fontSize: 14, color: colores.tintaSuave, fontWeight: '500' },
  etiqueta: { fontSize: 14, fontWeight: '600', color: colores.tintaSuave, marginBottom: 6 }
});
