import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import * as api from '../api';
import { colores } from '../theme';
import { Boton, Campo, ErrorForm, Estado, Hoja } from '../components/ui';

const VACIO = { nombre: '', descripcion: '' };

export default function CategoriasScreen({ avisar, esAdmin }) {
  const [categorias, setCategorias] = useState([]);
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
      setCategorias(await api.getCategorias());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm(VACIO);
    setErrorForm('');
    setFormVisible(true);
  };

  const abrirEditar = (c) => {
    setEditandoId(c.id_categoria);
    setForm({ nombre: c.nombre, descripcion: c.descripcion || '' });
    setErrorForm('');
    setFormVisible(true);
  };

  // CREATE / UPDATE
  const guardar = async () => {
    if (!form.nombre.trim()) return setErrorForm('Escribe el nombre de la categoría.');
    const datos = { nombre: form.nombre.trim(), descripcion: form.descripcion.trim() || null };
    setGuardando(true);
    try {
      if (editandoId) {
        await api.actualizarCategoria(editandoId, datos);
        avisar('Categoría actualizada');
      } else {
        await api.crearCategoria(datos);
        avisar('Categoría registrada');
      }
      setFormVisible(false);
      cargar();
    } catch (e) {
      setErrorForm(e.message);
    } finally {
      setGuardando(false);
    }
  };

  // DELETE (la API no deja borrar si tiene productos)
  const eliminar = (c) => {
    Alert.alert('Eliminar categoría', `¿Eliminar la categoría "${c.nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.eliminarCategoria(c.id_categoria);
            avisar('Categoría eliminada');
            cargar();
          } catch (e) {
            avisar(e.message, 'error');
          }
        }
      }
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={error ? [] : categorias}
        keyExtractor={(c) => String(c.id_categoria)}
        contentContainerStyle={s.lista}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
        ListHeaderComponent={
          <View style={s.encabezado}>
            <View>
              <Text style={s.titulo}>Categorías</Text>
              <Text style={s.resumen}>{categorias.length} categorías</Text>
            </View>
            <Boton titulo="Registrar" tipo="principal" onPress={abrirNuevo} />
          </View>
        }
        renderItem={({ item: c }) => (
          <View style={s.tarjeta}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Text style={s.nombre}>{c.nombre}</Text>
              <Text style={s.total}>
                {c.total_productos} {c.total_productos === 1 ? 'producto' : 'productos'}
              </Text>
            </View>
            {c.descripcion ? <Text style={s.desc}>{c.descripcion}</Text> : null}
            <View style={s.acciones}>
              <Boton titulo="Editar" chico onPress={() => abrirEditar(c)} />
              {esAdmin && (
                <Boton titulo="Eliminar" chico tipo="peligro" onPress={() => eliminar(c)} />
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          error ? (
            <Estado texto={error} error accion="Reintentar" onAccion={cargar} />
          ) : cargando ? null : (
            <Estado
              texto="Todavía no hay categorías. Registra una para poder agregar productos."
              accion="Registrar la primera"
              onAccion={abrirNuevo}
            />
          )
        }
      />

      <Hoja
        visible={formVisible}
        titulo={editandoId ? 'Editar categoría' : 'Registrar categoría'}
        alCerrar={() => setFormVisible(false)}
      >
        <Campo etiqueta="Nombre" value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} maxLength={100} />
        <Campo
          etiqueta="Descripción"
          value={form.descripcion}
          onChangeText={(v) => setForm({ ...form, descripcion: v })}
          multiline
          maxLength={255}
        />
        <ErrorForm texto={errorForm} />
        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
          <Boton titulo="Cancelar" onPress={() => setFormVisible(false)} />
          <Boton
            titulo={guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Registrar categoría'}
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
  nombre: { fontSize: 17, fontWeight: '600', color: colores.tinta, flex: 1 },
  total: { fontSize: 14, color: colores.tintaSuave },
  desc: { fontSize: 14, color: colores.tintaSuave, marginTop: 4 },
  acciones: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 12 }
});
