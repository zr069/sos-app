import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import ContactCard from '../components/ContactCard';
import { Contact, GhostEvent } from '../types';
import { getContacts, addContact, getEvents, addEvent } from '../lib/storage';
import { calcAllMetrics } from '../lib/metrics';
import { BANNER_ID, loadInterstitial, trackGhostAndMaybeShowAd } from '../lib/ads';

export default function HomeScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [events, setEvents] = useState<GhostEvent[]>([]);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<TextInput>(null);
  const [bannerError, setBannerError] = useState(false);

  useEffect(() => {
    loadInterstitial();
  }, []);

  const loadData = useCallback(async () => {
    const [c, e] = await Promise.all([getContacts(), getEvents()]);
    setContacts(c);
    setEvents(e);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleAddContact = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setNewName('');
    Keyboard.dismiss();
    await addContact(trimmed);
    await loadData();
  };

  const handleGhost = async (contactId: string) => {
    await addEvent(contactId);
    await trackGhostAndMaybeShowAd();
    await loadData();
  };

  const getEventsForContact = (contactId: string) =>
    events.filter((e) => e.contactId === contactId);

  // Globale Metriken
  const totalEvents = events.length;
  const contactMetrics = contacts.map((c) => ({
    contact: c,
    metrics: calcAllMetrics(getEventsForContact(c.id)),
  }));
  const withMetrics = contactMetrics.filter((cm) => cm.metrics);
  const avgSigma =
    withMetrics.length > 0
      ? withMetrics.reduce((sum, cm) => sum + cm.metrics!.sigma, 0) /
        withMetrics.length
      : 0;
  const criticalContact = [...withMetrics].sort(
    (a, b) => b.metrics!.sigma - a.metrics!.sigma
  )[0];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              <Text style={styles.title}>The Ghosting Protocol</Text>
              <Text style={styles.subtitle}>
                Quantitative Analyse interpersoneller Kommunikationsverweigerung
              </Text>

              {/* Globale Metriken */}
              <View style={styles.globalMetrics}>
                <View style={styles.globalMetricItem}>
                  <Text style={styles.globalMetricValue}>{contacts.length}</Text>
                  <Text style={styles.globalMetricLabel}>Kontakte</Text>
                </View>
                <View style={styles.globalMetricItem}>
                  <Text style={styles.globalMetricValue}>{totalEvents}</Text>
                  <Text style={styles.globalMetricLabel}>Events</Text>
                </View>
                <View style={styles.globalMetricItem}>
                  <Text style={styles.globalMetricValue}>{avgSigma.toFixed(2)}</Text>
                  <Text style={styles.globalMetricLabel}>Ø Score</Text>
                </View>
                <View style={styles.globalMetricItem}>
                  <Text style={styles.globalMetricValue} numberOfLines={1}>
                    {criticalContact?.contact.name ?? '–'}
                  </Text>
                  <Text style={styles.globalMetricLabel}>Schlimmster</Text>
                </View>
              </View>

              {/* Kontakt hinzufuegen */}
              <View style={styles.inputRow}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Name des Kontakts"
                  placeholderTextColor="#a1a1aa"
                  value={newName}
                  onChangeText={setNewName}
                  onSubmitEditing={handleAddContact}
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    !newName.trim() && styles.addButtonDisabled,
                  ]}
                  onPress={handleAddContact}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addButtonText}>+ Kontakt hinzufügen</Text>
                </TouchableOpacity>
              </View>

              {contacts.length === 0 && (
                <Text style={styles.emptyText}>
                  Noch keine Kontakte erfasst. Füge jemanden hinzu, der deine Anrufe
                  ignoriert.
                </Text>
              )}
            </>
          }
          renderItem={({ item }) => (
            <ContactCard
              contact={item}
              events={getEventsForContact(item.id)}
              onGhost={() => handleGhost(item.id)}
            />
          )}
        />
      </KeyboardAvoidingView>
      {!bannerError && (
        <View style={styles.bannerContainer}>
          <BannerAd
            unitId={BANNER_ID}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            onAdFailedToLoad={() => setBannerError(true)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  flex: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  title: {
    color: '#09090b',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    color: '#71717a',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  globalMetrics: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f5',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  globalMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  globalMetricValue: {
    color: '#09090b',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  globalMetricLabel: {
    color: '#71717a',
    fontSize: 10,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#09090b',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  addButton: {
    backgroundColor: '#09090b',
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    color: '#fafafa',
    fontSize: 13,
    fontWeight: '700',
  },
  bannerContainer: {
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  emptyText: {
    color: '#a1a1aa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 22,
  },
});
