import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, GhostEvent } from '../types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const CONTACTS_KEY = 'ghost_contacts';
const EVENTS_KEY = 'ghost_events';

export async function getContacts(): Promise<Contact[]> {
  const raw = await AsyncStorage.getItem(CONTACTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveContacts(contacts: Contact[]): Promise<void> {
  await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

export async function addContact(name: string): Promise<Contact> {
  const contact: Contact = {
    id: generateId(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  const contacts = await getContacts();
  contacts.push(contact);
  await saveContacts(contacts);
  return contact;
}

export async function deleteContact(id: string): Promise<void> {
  const contacts = await getContacts();
  await saveContacts(contacts.filter((c) => c.id !== id));
  const events = await getEvents();
  await saveEvents(events.filter((e) => e.contactId !== id));
}

export async function getEvents(): Promise<GhostEvent[]> {
  const raw = await AsyncStorage.getItem(EVENTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveEvents(events: GhostEvent[]): Promise<void> {
  await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export async function addEvent(contactId: string): Promise<GhostEvent> {
  const event: GhostEvent = {
    id: generateId(),
    contactId,
    timestamp: new Date().toISOString(),
  };
  const events = await getEvents();
  events.push(event);
  await saveEvents(events);
  return event;
}

export async function deleteEvent(id: string): Promise<void> {
  const events = await getEvents();
  await saveEvents(events.filter((e) => e.id !== id));
}

export async function getEventsForContact(contactId: string): Promise<GhostEvent[]> {
  const events = await getEvents();
  return events.filter((e) => e.contactId === contactId);
}
