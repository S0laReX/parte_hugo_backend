import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ProductosScreen from './src/screens/ProductosScreen';
import CategoriasScreen from './src/screens/CategoriasScreen';
import { Boton, Campo, Hoja } from './src/components/ui';
import { getApiUrl, setApiUrl } from './src/api';
import { colores } from './src/theme';

export default function App() {
  const [pestana, setPestana] = useState('productos');
  const [aviso, setAviso] = useState(null);
  const [servidorVisible, setServidorVisible] = useState(false);
  const [urlEditada, setUrlEditada] = useState(getApiUrl());
  const [version, setVersion] = useState(0); // al cambiar, las pantallas se recargan

  const avisar = (texto, tipo = 'ok') => setAviso({ texto, tipo, id: Date.now() });

  // El aviso desaparece solo
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3000);
    return () => clearTimeout(t);
  }, [aviso]);

  const guardarServidor = () => {
    setApiUrl(urlEditada.trim());
    setServidorVisible(false);
    setVersion((v) => v + 1);
    avisar('Servidor actualizado');
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={{ flex: 0, backgroundColor: colores.tinta }} />
      <View style={s.barra}>
        <View style={s.barraFila}>
          <Text style={s.marca}>Ferretería</Text>
          <Pressable onPress={() => { setUrlEditada(getApiUrl()); setServidorVisible(true); }} hitSlop={10}>
            <Text style={s.servidor}>Servidor</Text>
          </Pressable>
        </View>
        <View style={s.pestanas}>
          {[
            ['productos', 'Productos'],
            ['categorias', 'Categorías']
          ].map(([clave, texto]) => (
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
        {pestana === 'productos' ? (
          <ProductosScreen key={`p${version}`} avisar={avisar} />
        ) : (
          <CategoriasScreen key={`c${version}`} avisar={avisar} />
        )}
      </SafeAreaView>

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
  servidor: { color: '#B9C3CC', fontSize: 14, fontWeight: '600' },
  pestanas: { flexDirection: 'row', gap: 4, marginTop: 10 },
  pestana: { paddingVertical: 10, paddingHorizontal: 16, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
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
