// Pantalla de acceso:
//  - modo "registro": la primera vez, crea la cuenta del ferretero (administrador)
//  - modo "login": iniciar sesión
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as api from '../api';
import { colores } from '../theme';
import { Boton, Campo, ErrorForm } from '../components/ui';

export default function AccesoScreen({ modo, alEntrar, aviso, alAbrirServidor }) {
  const esRegistro = modo === 'registro';
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', confirmar: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const set = (campo) => (valor) => setForm({ ...form, [campo]: valor });

  const enviar = async () => {
    if (esRegistro) {
      if (!form.nombre.trim()) return setError('Escribe tu nombre.');
      if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
      if (form.password !== form.confirmar) return setError('Las contraseñas no coinciden.');
    } else if (!form.correo || !form.password) {
      return setError('Escribe tu correo y contraseña.');
    }

    setEnviando(true);
    try {
      const sesion = esRegistro
        ? await api.registroInicial({ nombre: form.nombre, correo: form.correo, password: form.password })
        : await api.login({ correo: form.correo, password: form.password });
      await alEntrar(sesion);
    } catch (e) {
      setError(e.message);
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.fondo} keyboardShouldPersistTaps="handled">
        <View style={s.panel}>
          <Text style={s.marca}>Ferretería</Text>
          <Text style={s.titulo}>{esRegistro ? 'Crear la cuenta del ferretero' : 'Iniciar sesión'}</Text>
          <Text style={s.texto}>
            {esRegistro
              ? 'Es la primera vez que se usa el sistema. Esta cuenta será la del administrador; después podrás crear cuentas para tus empleados.'
              : 'Entra con el correo y la contraseña que te dio el ferretero.'}
          </Text>

          {aviso ? <Text style={s.aviso}>{aviso}</Text> : null}

          {esRegistro && (
            <Campo etiqueta="Nombre" value={form.nombre} onChangeText={set('nombre')} autoComplete="name" />
          )}
          <Campo
            etiqueta="Correo"
            value={form.correo}
            onChangeText={set('correo')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
          />
          <Campo etiqueta="Contraseña" value={form.password} onChangeText={set('password')} secureTextEntry />
          {esRegistro && (
            <Campo etiqueta="Repite la contraseña" value={form.confirmar} onChangeText={set('confirmar')} secureTextEntry />
          )}

          <ErrorForm texto={error} />
          <Boton
            titulo={enviando ? 'Un momento…' : esRegistro ? 'Crear cuenta y entrar' : 'Entrar'}
            tipo="principal"
            disabled={enviando}
            onPress={enviar}
          />
        </View>

        <Pressable onPress={alAbrirServidor} hitSlop={10} style={{ marginTop: 18 }}>
          <Text style={s.servidor}>Servidor: {api.getApiUrl()}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  fondo: { flexGrow: 1, justifyContent: 'center', padding: 16, backgroundColor: colores.tinta },
  panel: {
    backgroundColor: colores.panel,
    borderRadius: 10,
    borderTopWidth: 6,
    borderTopColor: colores.amarillo,
    padding: 22
  },
  marca: { color: '#C99700', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  titulo: { fontSize: 28, fontWeight: '700', color: colores.tinta, marginBottom: 8 },
  texto: { color: colores.tintaSuave, fontSize: 15, marginBottom: 18 },
  aviso: {
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 3,
    borderLeftColor: colores.amarillo,
    padding: 8,
    marginBottom: 14,
    color: colores.tinta
  },
  servidor: { color: '#B9C3CC', textAlign: 'center', fontSize: 13, textDecorationLine: 'underline' }
});
