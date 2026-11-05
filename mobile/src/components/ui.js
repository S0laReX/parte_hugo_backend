// Componentes pequeños reutilizables: botón, campo de texto, hoja modal, estado vacío
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform } from 'react-native';
import { colores } from '../theme';

export function Boton({ titulo, onPress, tipo = 'normal', disabled, chico }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.boton,
        chico && s.botonChico,
        tipo === 'principal' && s.botonPrincipal,
        tipo === 'peligro' && s.botonPeligro,
        (pressed || disabled) && { opacity: 0.6 }
      ]}
    >
      <Text style={[s.botonTexto, chico && { fontSize: 14 }, tipo === 'peligro' && { color: colores.rojo }]}>
        {titulo}
      </Text>
    </Pressable>
  );
}

export function Campo({ etiqueta, ...props }) {
  return (
    <View style={s.campo}>
      <Text style={s.etiqueta}>{etiqueta}</Text>
      <TextInput
        style={[s.input, props.multiline && { minHeight: 70, textAlignVertical: 'top' }]}
        placeholderTextColor="#98A2AB"
        {...props}
      />
    </View>
  );
}

// Formulario que sube desde abajo
export function Hoja({ visible, titulo, alCerrar, children }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={alCerrar}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.hojaFondo}>
        <Pressable style={{ flex: 1 }} onPress={alCerrar} />
        <View style={s.hoja}>
          <Text style={s.hojaTitulo}>{titulo}</Text>
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Estado({ texto, error, accion, onAccion }) {
  return (
    <View style={[s.estado, error && { borderColor: colores.rojo }]}>
      <Text style={[s.estadoTexto, error && { color: colores.rojo }]}>{texto}</Text>
      {accion && <Boton titulo={accion} onPress={onAccion} tipo={error ? 'normal' : 'principal'} />}
    </View>
  );
}

export function ErrorForm({ texto }) {
  if (!texto) return null;
  return <Text style={s.errorForm}>{texto}</Text>;
}

const s = StyleSheet.create({
  boton: {
    borderWidth: 1,
    borderColor: colores.linea,
    backgroundColor: colores.panel,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center'
  },
  botonChico: { paddingVertical: 6, paddingHorizontal: 12 },
  botonPrincipal: { backgroundColor: colores.amarillo, borderColor: '#C99700' },
  botonPeligro: { borderColor: '#E8B4AE' },
  botonTexto: { fontWeight: '600', fontSize: 16, color: colores.tinta },
  campo: { marginBottom: 14 },
  etiqueta: { fontSize: 14, fontWeight: '600', color: colores.tintaSuave, marginBottom: 4 },
  input: {
    backgroundColor: colores.panel,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colores.tinta
  },
  hojaFondo: { flex: 1, backgroundColor: 'rgba(31,42,51,0.55)' },
  hoja: {
    backgroundColor: colores.panel,
    borderTopWidth: 6,
    borderTopColor: colores.amarillo,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '88%'
  },
  hojaTitulo: { fontSize: 24, fontWeight: '700', color: colores.tinta, marginBottom: 16 },
  estado: {
    backgroundColor: colores.panel,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colores.linea,
    borderRadius: 8,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    marginTop: 8
  },
  estadoTexto: { color: colores.tintaSuave, textAlign: 'center', fontSize: 15 },
  errorForm: {
    color: colores.rojo,
    backgroundColor: colores.rojoClaro,
    borderLeftWidth: 3,
    borderLeftColor: colores.rojo,
    padding: 8,
    marginBottom: 14
  }
});
