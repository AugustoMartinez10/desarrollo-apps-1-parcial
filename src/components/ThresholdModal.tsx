import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Equipment } from '../domain/types';

type Props = {
  equipment: Equipment | null;
  onCancel: () => void;
  onSave: (id: string, text: string) => Promise<string | null>;
};

export function ThresholdModal({ equipment, onCancel, onSave }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Cada vez que se abre para un equipo, se carga su límite actual.
  useEffect(() => {
    if (equipment) {
      setText(String(equipment.maxTemp));
      setError(null);
    }
  }, [equipment]);

  const save = async () => {
    if (!equipment || saving) return;
    setSaving(true);
    const result = await onSave(equipment.id, text);
    setSaving(false);
    if (result) {
      setError(result);
    } else {
      onCancel();
    }
  };

  return (
    <Modal visible={equipment !== null} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <Text style={styles.title}>Límite de temperatura</Text>
          <Text style={styles.subtitle}>{equipment?.id} · {equipment?.name}</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={(value) => { setText(value); setError(null); }}
            keyboardType="decimal-pad"
            placeholder="Ej: 65.5"
            placeholderTextColor="#8C9CB0"
          />
          <Text style={styles.hint}>Número mayor que 0 y menor o igual a 150 °C.</Text>
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.row}>
            <Pressable onPress={onCancel} style={[styles.button, styles.cancel]}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={() => void save()} disabled={saving} style={[styles.button, styles.ok]}>
              <Text style={styles.okText}>{saving ? 'Guardando…' : 'Guardar'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,35,62,0.45)', justifyContent: 'center', padding: 24 },
  box: { backgroundColor: '#FFF', borderRadius: 15, padding: 18, gap: 10 },
  title: { fontSize: 17, fontWeight: '800', color: '#14233E' },
  subtitle: { fontSize: 12, color: '#687990' },
  input: { borderWidth: 1, borderColor: '#CCD9E9', borderRadius: 11, height: 46, paddingHorizontal: 14, fontSize: 16, color: '#14233E' },
  hint: { fontSize: 11, color: '#687990' },
  error: { fontSize: 12, color: '#C45639', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 9, marginTop: 4 },
  button: { flex: 1, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  cancel: { backgroundColor: '#DDE9F8' },
  ok: { backgroundColor: '#2365C7' },
  cancelText: { color: '#162D50', fontWeight: '800' },
  okText: { color: '#FFF', fontWeight: '800' },
});
