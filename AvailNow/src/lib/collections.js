// src/lib/collections.js
import { firestore } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Define collection names
export const COLLECTIONS = {
  CALENDAR_INTEGRATIONS: "calendar_integrations",
  SELECTED_CALENDARS: "selected_calendars",
  CALENDAR_EVENTS: "calendar_events",
  CALENDAR_SETTINGS: "calendar_settings",
  WIDGET_SETTINGS: "widget_settings",
  WIDGET_STATS: "widget_stats",
};

// Generic function to get a document by ID
export const getDocumentById = async (collectionName, id) => {
  const docRef = doc(firestore, collectionName, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id };
  }

  return null;
};

// Generic function to get documents by a field value
export const getDocumentsByField = async (collectionName, field, value) => {
  const q = query(
    collection(firestore, collectionName),
    where(field, "==", value)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
};

// Generic function to create a document with a specific ID
export const createDocument = async (collectionName, id, data) => {
  const docRef = id
    ? doc(firestore, collectionName, id)
    : doc(collection(firestore, collectionName));
  const docData = {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };

  await setDoc(docRef, docData);
  return { ...docData, id: docRef.id };
};

// Generic function to update a document
export const updateDocument = async (collectionName, id, data) => {
  const docRef = doc(firestore, collectionName, id);
  const updateData = {
    ...data,
    updated_at: serverTimestamp(),
  };

  await updateDoc(docRef, updateData);
  return { ...updateData, id };
};

// Generic function to delete a document
export const deleteDocument = async (collectionName, id) => {
  const docRef = doc(firestore, collectionName, id);
  await deleteDoc(docRef);
  return { success: true };
};

// Function to upsert a document (create or update)
export const upsertDocument = async (collectionName, query, data) => {
  // First try to find the document
  const q = query(
    collection(firestore, collectionName),
    ...Object.entries(query).map(([field, value]) => where(field, "==", value))
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // Document exists, update it
    const docRef = querySnapshot.docs[0].ref;
    const updateData = {
      ...data,
      updated_at: serverTimestamp(),
    };

    await updateDoc(docRef, updateData);
    return { ...updateData, id: docRef.id };
  } else {
    // Document doesn't exist, create it
    return createDocument(collectionName, null, { ...query, ...data });
  }
};

// Calendar-specific functions
export const getCalendarIntegrationsByUser = async (userId) => {
  return getDocumentsByField(
    COLLECTIONS.CALENDAR_INTEGRATIONS,
    "user_id",
    userId
  );
};

export const getSelectedCalendarsByUser = async (userId) => {
  return getDocumentsByField(COLLECTIONS.SELECTED_CALENDARS, "user_id", userId);
};

export const getCalendarSettingsByUser = async (userId) => {
  const results = await getDocumentsByField(
    COLLECTIONS.CALENDAR_SETTINGS,
    "user_id",
    userId
  );
  return results.length > 0 ? results[0] : null;
};

export const getWidgetSettingsByUser = async (userId) => {
  const results = await getDocumentsByField(
    COLLECTIONS.WIDGET_SETTINGS,
    "user_id",
    userId
  );
  return results.length > 0 ? results[0] : null;
};
