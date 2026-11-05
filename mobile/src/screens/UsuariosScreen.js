// Sección solo para el administrador: ver, crear y eliminar cuentas
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import * as api from '../api';
import { colores } from '../theme';
import { Boton, Campo, ErrorForm, Estado, Hoja } from '../components/ui';

const VACIO = { nombre: '', correo: '', password: '', rol: 'empleado' };

export default function UsuariosScreen({ avisar, usuarioActual }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [errorForm, setErrorForm] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setUsuarios(await api.getUsuarios());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirNuevo = () => {
    setForm(VACIO);
    setErrorForm('');
    setFormVisible(true);
  };

  const guardar = async () => {
    if (!form.nombre.trim()) return setErrorForm('Escribe el nombre.');
    if (!form.correo.trim()) return setErrorForm('Escribe el correo.');
    if (form.password.length < 6) return setErrorForm('La contraseña debe tener al menos 6 caracteres.');
    setGuardando(true);
    try {
      await api.crearUsuario(form);
      avisar('Cuenta creada');
      setFormVisible(false);
      cargar();
    } catch (e) {
      setErrorForm(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = (u) => {
    Alert.alert('Eliminar cuenta', `¿Eliminar la cuenta de ${u.nombre}? Ya no podrá entrar al sistema.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.eliminarUsuario(u.id_usuario);
            avisar('Cuenta eliminada');
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
        data={error ? [] : usuarios}
        keyExtractor={(u) => String(u.id_usuario)}
        contentContainerStyle={s.lista}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
        ListHeaderComponent={
          <View style={s.encabezado}>
            <View style={{ flex: 1 }}>
              <Text style={s.titulo}>Usuarios</Text>
              <Text style={s.resumen}>Cuentas que pueden entrar</Text>
            </View>
            <Boton titulo="Crear cuenta" tipo="principal" onPress={abrirNuevo} />
          </View>
        }
        renderItem={({ item: u }) => {
          const soyYo = u.id_usuario === usuarioActual.id_usuario;
          return (
            <View style={s.tarjeta}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <Text style={s.nombre}>{u.nombre}{soyYo ? ' (tú)' : ''}</Text>
                <Text style={[s.rol, u.rol === 'admin' && s.rolAdmin]}>
                  {u.rol === 'admin' ? 'Administrador' : 'Empleado'}
                </Text>
              </View>
              <Text style={s.correo}>{u.correo}</Text>
              {!soyYo && (
                <View style={s.acciones}>
                  <Boton titulo="Eliminar" chico tipo="peligro" onPress={() => eliminar(u)} />
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={error ? <Estado texto={error} error accion="Reintentar" onAccion={cargar} /> : null}
      />

      <Hoja visible={formVisible} titulo="Crear cuenta" alCerrar={() => setFormVisible(false)}>
        <Campo etiqueta="Nombre" value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} />
        <Campo
          etiqueta="Correo"
          value={form.correo}
          onChangeText={(v) => setForm({ ...form, correo: v })}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Campo
          etiqueta="Contraseña inicial"
          value={form.password}
          onChangeText={(v) => setForm({ ...form, password: v })}
          secureTextEntry
        />
        <Text style={s.etiqueta}>Rol</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[
            ['empleado', 'Empleado'],
            ['admin', 'Administrador']
          ].map(([valor, texto]) => {
            const activo = form.rol === valor;
            return (
              <Pressable
                key={valor}
                onPress={() => setForm({ ...form, rol: valor })}
                style={[s.chip, activo && s.chipActivo]}
                accessibilityState={{ selected: activo }}
              >
                <Text style={[s.chipTexto, activo && { color: colores.tinta }]}>{texto}</Text>
              </Pressable>
            );
          })}
        </View>
        <ErrorForm texto={errorForm} />
        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
          <Boton titulo="Cancelar" onPress={() => setFormVisible(false)} />
          <Boton titulo={guardando ? 'Creando…' : 'Crear cuenta'} tipo="principal" disabled={guardando} onPress={guardar} />
        </View>
      </Hoja>
    </View>
  );
}

const s = StyleSheet.create({
  lista: { padding: 16, paddingBottom: 40 },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, gap: 10 },
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
  correo: { fontSize: 14, color: colores.tintaSuave, marginTop: 4 },
  rol: {
    fontSize: 13,
    fontWeight: '500',
    color: colores.azul,
    backgroundColor: colores.azulClaro,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'flex-start'
  },
  rolAdmin: { color: '#7A5C00', backgroundColor: '#FFF3C4' },
  acciones: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  etiqueta: { fontSize: 14, fontWeight: '600', color: colores.tintaSuave, marginBottom: 6 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.linea,
    backgroundColor: colores.panel
  },
  chipActivo: { backgroundColor: colores.amarillo, borderColor: '#C99700' },
  chipTexto: { fontSize: 14, color: colores.tintaSuave, fontWeight: '500' }
});
