import { openDB } from 'idb';


// Utility function to open IndexedDB
export const openIndexedDB = async () => {
    const db = await openDB('savedResponses', 1, {
        upgrade(db, oldVersion, newVersion, transaction, event) {
            // If it's the first time opening the database
            if (oldVersion < 1) {
                db.createObjectStore('jot-responses', {
                    keyPath: 'id',
                });
            }
        },
    });
    return db;
};


// Utility function to save form data
//@ts-expect-error: data varies and too complex to type
export const saveFormData = async (data, sessionId) => {
    console.log('data ', data)
    // Open store
    const db = await openIndexedDB();
    const tx = db.transaction('jot-responses', 'readwrite');
    const store = tx.objectStore('jot-responses');

    // Retrieve existing data within the same transaction
    const existingData = await store.get(sessionId);
    const mergedData = { questions: data, id: sessionId };

    // Save the merged data back to the database
    await store.put(mergedData);
    await tx.done;
};


// Utility function to retrieve form data by ID
export const getFormData = async (sessionId: string) => {
    const db = await openIndexedDB();
    const store = db.transaction('jot-responses').objectStore('jot-responses');
    return store.get(sessionId);
};


export const deleteField = async (fieldName: string) => {
    const db = await openIndexedDB();
    // const store = db.transaction('formData').objectStore('formData');

    const tx = db.transaction('jot-responses', 'readwrite');
    const store = tx.objectStore('jot-responses');

    // Get all records (or use a cursor if needed)
    const firstRecord = await store.get(0);
    if (firstRecord) {
        // Set the field to an empty string
        firstRecord[fieldName] = '';
        // Update the record
        await store.put(firstRecord);
    }

}

