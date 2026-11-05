import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Equipment, Reading } from '../domain/types';

type Props = {
  equipment: Equipment | null;
  readings: Reading[];
  loading: boolean;
  onClose: () => void;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString('es-AR');
}

export function HistoryModal({ equipment, readings, loading, onClose }: Props) {
  return (
    <Modal visible={equipment !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <Text style={styles.title}>Historial de lecturas</Text>
          <Text style={styles.subtitle}>{equipment?.id} · {equipment?.name} · últimos 10 registros</Text>
          {loading ? (
            <ActivityIndicator color="#2365C7" style={{ margin: 20 }} />
          ) : readings.length === 0 ? (
            <Text style={styles.empty}>Todavía no hay lecturas registradas para este equipo.</Text>
          ) : (
            <ScrollView style={{ maxHeight: 360 }}>
              {readings.map((reading) => (
                <View key={reading.id} style={styles.item}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.date}>{formatDate(reading.createdAt)}</Text>
                    <Text style={styles.source}>Origen: {reading.source}</Text>
                  </View>
                  <Text style={styles.temp}>{reading.temperature.toFixed(1)} °C</Text>
                </View>
              ))}
            </ScrollView>
          )}
          <Pressable onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </Pressable>
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
  empty: { textAlign: 'center', color: '#687990', marginVertical: 20 },
  item: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#DFE7F2', paddingVertical: 9 },
  date: { fontSize: 12, fontWeight: '700', color: '#14233E' },
  source: { fontSize: 11, color: '#687990', marginTop: 2 },
  temp: { fontSize: 15, fontWeight: '800', color: '#14233E' },
  button: { height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2365C7', marginTop: 4 },
  buttonText: { color: '#FFF', fontWeight: '800' },
});
