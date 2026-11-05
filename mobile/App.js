import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ProductosScreen from './src/screens/ProductosScreen';
import CategoriasScreen from './src/screens/CategoriasScreen';
import UsuariosScreen from './src/screens/UsuariosScreen';
import AccesoScreen from './src/screens/AccesoScreen';
import { Boton, Campo, Estado, Hoja } from './src/components/ui';
import * as api from './src/api';
import { colores } from './src/theme';

export default function App() {
  const [sesion, setSesion] = useState(undefined); // undefined = cargando, null = sin sesión
  const [necesitaRegistro, setNecesitaRegistro] = useState(null);
  const [errorConexion, setErrorConexion] = useState('');
  const [avisoAcceso, setAvisoAcceso] = useState('');

  const [pestana, setPestana] = useState('productos');
  const [aviso, setAviso] = useState(null);
  const [servidorVisible, setServidorVisible] = useState(false);
  const [urlEditada, setUrlEditada] = useState(api.getApiUrl());
  const [version, setVersion] = useState(0); // al cambiar, las pantallas se recargan

  const avisar = useCallback((texto, tipo = 'ok') => setAviso({ texto, tipo, id: Date.now() }), []);

  // El aviso desaparece solo
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3000);
    return () => clearTimeout(t);
  }, [aviso]);

  const cerrarSesion = useCallback(async (mensaje = '') => {
    await api.guardarSesion(null);
    setSesion(null);
    setPestana('productos');
    setAvisoAcceso(mensaje);
  }, []);

  // Si la API dice que la sesión venció, volvemos al login
  useEffect(() => {
    api.onSesionVencida((mensaje) => cerrarSesion(mensaje || 'Tu sesión expiró. Vuelve a iniciar sesión.'));
  }, [cerrarSesion]);

  // Al abrir la app, recuperamos la sesión guardada
  useEffect(() => {
    api.cargarSesion().then((s) => setSesion(s));
  }, []);

  // Sin sesión: preguntamos si hace falta el registro inicial del ferretero
  const consultarEstado = useCallback(() => {
    setErrorConexion('');
    setNecesitaRegistro(null);
    api.estadoAuth()
      .then((d) => setNecesitaRegistro(d.necesitaRegistro))
      .catch((e) => setErrorConexion(e.message));
  }, []);

  useEffect(() => {
    if (sesion === null) consultarEstado();
  }, [sesion, consultarEstado, version]);

  const entrar = async (nuevaSesion) => {
    await api.guardarSesion(nuevaSesion);
    setSesion(nuevaSesion);
    setAvisoAcceso('');
    avisar(`Hola, ${nuevaSesion.usuario.nombre}`);
  };

  const abrirServidor = () => {
    setUrlEditada(api.getApiUrl());
    setServidorVisible(true);
  };

  const guardarServidor = () => {
    api.setApiUrl(urlEditada.trim());
    setServidorVisible(false);
    setVersion((v) => v + 1);
    avisar('Servidor actualizado');
  };

  const confirmarSalida = () => {
    Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => cerrarSesion() }
    ]);
  };

  // ----- Contenido según el estado -----
  let contenido;
  if (sesion === undefined) {
    contenido = <ActivityIndicator style={{ marginTop: 60 }} color={colores.amarillo} size="large" />;
  } else if (!sesion) {
    if (errorConexion) {
      contenido = (
        <View style={{ padding: 16, flex: 1, justifyContent: 'center' }}>
          <Estado texto={errorConexion} error accion="Reintentar" onAccion={consultarEstado} />
          <Pressable onPress={abrirServidor} hitSlop={10} style={{ marginTop: 16 }}>
            <Text style={s.enlace}>Cambiar servidor</Text>
          </Pressable>
        </View>
      );
    } else if (necesitaRegistro === null) {
      contenido = <ActivityIndicator style={{ marginTop: 60 }} color={colores.amarillo} size="large" />;
    } else {
      contenido = (
        <AccesoScreen
          key={necesitaRegistro ? 'registro' : 'login'}
          modo={necesitaRegistro ? 'registro' : 'login'}
          alEntrar={entrar}
          aviso={avisoAcceso}
          alAbrirServidor={abrirServidor}
        />
      );
    }
  }

  const usuario = sesion?.usuario;
  const esAdmin = usuario?.rol === 'admin';
  const pestanas = [
    ['productos', 'Productos'],
    ['categorias', 'Categorías'],
    ...(esAdmin ? [['usuarios', 'Usuarios']] : [])
  ];

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={{ flex: 0, backgroundColor: colores.tinta }} />

      {sesion ? (
        <>
          <View style={s.barra}>
            <View style={s.barraFila}>
              <View style={{ flex: 1 }}>
                <Text style={s.marca}>Ferretería</Text>
                <Text style={s.usuario}>
                  {usuario.nombre} · <Text style={s.rol}>{esAdmin ? 'Administrador' : 'Empleado'}</Text>
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Pressable onPress={confirmarSalida} hitSlop={10}>
                  <Text style={s.salir}>Salir</Text>
                </Pressable>
                <Pressable onPress={abrirServidor} hitSlop={10}>
                  <Text style={s.servidor}>Servidor</Text>
                </Pressable>
              </View>
            </View>
            <View style={s.pestanas}>
              {pestanas.map(([clave, texto]) => (
                <Pressable
                  key={clave}
                  onPress={() => setPestana(clave)}
                  style={[s.pestana, pestana === clave && s.pestanaActiva]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: pestana === clave }}
                >
                  <Text style={[s.pestanaTexto, pestana === clave && { color: colores.tinta }]}>{texto}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colores.acero }}>
            {pestana === 'productos' && <ProductosScreen key={`p${version}`} avisar={avisar} esAdmin={esAdmin} />}
            {pestana === 'categorias' && <CategoriasScreen key={`c${version}`} avisar={avisar} esAdmin={esAdmin} />}
            {pestana === 'usuarios' && esAdmin && (
              <UsuariosScreen key={`u${version}`} avisar={avisar} usuarioActual={usuario} />
            )}
          </SafeAreaView>
        </>
      ) : (
        <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colores.tinta }}>
          {contenido}
        </SafeAreaView>
      )}

      {aviso && (
        <View style={[s.aviso, aviso.tipo === 'error' && { borderLeftColor: colores.rojo }]} pointerEvents="none">
          <Text style={s.avisoTexto}>{aviso.texto}</Text>
        </View>
      )}

      <Hoja visible={servidorVisible} titulo="Servidor de la API" alCerrar={() => setServidorVisible(false)}>
        <Text style={s.ayuda}>
          Escribe la dirección que muestra el backend al iniciar (línea "Red"), terminando en /api.
        </Text>
        <Campo
          etiqueta="Dirección"
          value={urlEditada}
          onChangeText={setUrlEditada}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="http://192.168.1.50:3000/api"
        />
        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
          <Boton titulo="Cancelar" onPress={() => setServidorVisible(false)} />
          <Boton titulo="Guardar servidor" tipo="principal" onPress={guardarServidor} />
        </View>
      </Hoja>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  barra: { backgroundColor: colores.tinta, borderBottomWidth: 4, borderBottomColor: colores.amarillo, paddingHorizontal: 16 },
  barraFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
  marca: { color: '#fff', fontSize: 26, fontWeight: '700' },
  usuario: { color: '#fff', fontSize: 14, marginTop: 2 },
  rol: { color: colores.amarillo, fontWeight: '600' },
  salir: { color: '#fff', fontSize: 15, fontWeight: '700' },
  servidor: { color: '#B9C3CC', fontSize: 13, fontWeight: '600' },
  enlace: { color: '#B9C3CC', textAlign: 'center', textDecorationLine: 'underline' },
  pestanas: { flexDirection: 'row', gap: 4, marginTop: 10 },
  pestana: { paddingVertical: 10, paddingHorizontal: 14, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  pestanaActiva: { backgroundColor: colores.amarillo },
  pestanaTexto: { color: '#B9C3CC', fontSize: 16, fontWeight: '700' },
  aviso: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: colores.tinta,
    borderLeftWidth: 5,
    borderLeftColor: colores.verde,
    borderRadius: 6,
    padding: 12
  },
  avisoTexto: { color: '#fff', fontSize: 15 },
  ayuda: { color: colores.tintaSuave, marginBottom: 12, fontSize: 14 }
});
