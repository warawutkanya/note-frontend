import { NextResponse } from 'next/server';
import { db } from '../../../firebase'; // Adjust the path if necessary
import {
  collection,
  doc,
  query,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  where,
  OrderByDirection,
  Timestamp
} from 'firebase/firestore';

// Fetch notes and optionally include sorting and tag filtering
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const noteId = url.pathname.split('/').pop();
    const sortBy = url.searchParams.get('sortBy') || 'timestamp';
    const order = url.searchParams.get('order') || 'desc';
    const tagFilter = url.searchParams.get('tag'); // Optional tag filter

    // Ensure valid order direction
    const validOrder: OrderByDirection = (order === 'asc' || order === 'desc') ? order : 'desc';

    if (noteId && !url.searchParams.has('sortBy')) { // Fetch history if noteId is provided
      const historyRef = collection(db, 'notes', noteId, 'history');
      const q = query(historyRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return NextResponse.json(history);
    }

    // Fetch notes otherwise
    const notesRef = collection(db, 'notes');
    let notesQuery = query(notesRef, orderBy(sortBy, validOrder));

    if (tagFilter) {
      notesQuery = query(notesRef, where('tags', 'array-contains', tagFilter), orderBy(sortBy, validOrder));
    }

    const querySnapshot = await getDocs(notesQuery);
    const notes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Error fetching notes' }, { status: 500 });
  }
}

// Delete note and its history
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const noteId = url.pathname.split('/').pop();

    if (!noteId) {
      return NextResponse.json({ success: false, message: 'No note ID provided' }, { status: 400 });
    }

    // Delete the note
    const noteRef = doc(db, 'notes', noteId);
    await deleteDoc(noteRef);

    // Delete history for the note
    const historyRef = collection(db, 'notes', noteId, 'history');
    const querySnapshot = await getDocs(historyRef);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note or its history:', error);
    return NextResponse.json({ success: false, message: 'Error deleting note or its history' }, { status: 500 });
  }
}

// Update (edit) a note
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const noteId = url.pathname.split('/').pop();

    if (!noteId) {
      return NextResponse.json({ success: false, message: 'No note ID provided' }, { status: 400 });
    }

    const body = await request.json();
    const { title, content, category, tags } = body; // Include tags in the body

    if (!title || !content || !category) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, { title, content, category, tags }); // Update tags

    // Add to history
    const historyRef = collection(db, 'notes', noteId, 'history');
    await addDoc(historyRef, {
      title,
      content,
      category,
      tags,
      timestamp: Timestamp.now() // Use Firestore Timestamp
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ success: false, message: 'Error updating note' }, { status: 500 });
  }
}

// Create a new note
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, category, tags } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    // Add a new note to the 'notes' collection
    const notesRef = collection(db, 'notes');
    const docRef = await addDoc(notesRef, { title, content, category, tags: tags || [], timestamp: Timestamp.now() });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ success: false, message: 'Error creating note' }, { status: 500 });
  }
}

// Ensure all existing notes have an initialized `tags` field
const updateNotes = async () => {
  try {
    const notesRef = collection(db, 'notes');
    const notesSnapshot = await getDocs(notesRef);

    const updatePromises = notesSnapshot.docs.map(async (noteDoc) => {
      const noteData = noteDoc.data();
      if (!('tags' in noteData)) {
        await updateDoc(doc(db, 'notes', noteDoc.id), { tags: [] });
      }
    });

    await Promise.all(updatePromises);
    console.log('Notes updated');
  } catch (error) {
    console.error('Error updating notes:', error);
  }
};

updateNotes();
