"use client";

import { useState, useEffect } from 'react';
import { addDoc, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export default function NotesPage() {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('');
  const [newNoteTags, setNewNoteTags] = useState(''); // Added Tags
  const [notes, setNotes] = useState<Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    creator: string;
    timestamp: Date;
    tags: string[]; // Added Tags
  }>>([]);

  const handleAddNote = async () => {
    if (newNoteContent.trim() === '' || newNoteTitle.trim() === '') return;
  
    try {
      const user = auth.currentUser;
      if (user) {
        const tagsArray = newNoteTags.split(',').map(tag => tag.trim()).filter(tag => tag.startsWith('#'));
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newNoteTitle,
            content: newNoteContent,
            category: newNoteCategory,
            tags: tagsArray // ส่งแท็กไปยัง backend
          })
        });
        setNewNoteContent('');
        setNewNoteTitle('');
        setNewNoteCategory('');
        setNewNoteTags(''); // ล้างฟิลด์แท็ก
        fetchNotes(); // ดึงข้อมูลใหม่หลังจากเพิ่มโน้ต
      }
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };
  
  
  const fetchNotes = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const notesQuery = query(collection(db, 'notes'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(notesQuery);
        const fetchedNotes = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'Untitled',
            content: data.content || '',
            category: data.category || 'default',
            creator: data.creator || 'Unknown',
            timestamp: (data.timestamp as Timestamp).toDate(),
            tags: data.tags || [] // Display Tags
          };
        });
        setNotes(fetchedNotes);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // NotesPage Component
return (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-gray-100">
    <h1 className="text-5xl font-bold mb-8 text-blue-600">Note ของฉัน</h1>
    
    {/* Note Input Form */}
    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
      <h2 className="text-2xl font-semibold mb-4 text-black">สร้าง Note ใหม่</h2>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={newNoteTitle}
          onChange={(e) => setNewNoteTitle(e.target.value)}
          className="border border-gray-300 rounded p-3 w-full focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="หัวข้อ"
        />
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          className="border border-gray-300 rounded p-3 w-full focus:ring-2 focus:ring-blue-500 text-black"
          rows={4}
          placeholder="รายละเอียด"
        />
        <input
          type="text"
          value={newNoteCategory}
          onChange={(e) => setNewNoteCategory(e.target.value)}
          className="border border-gray-300 rounded p-3 w-full focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="หมวดหมู่"
        />
        <input
          type="text"
          value={newNoteTags}
          onChange={(e) => setNewNoteTags(e.target.value)}
          className="border border-gray-300 rounded p-3 w-full focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="Tags (เช่น #work, #important)"
        />
        <button
          onClick={handleAddNote}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          สร้าง Note
        </button>
      </div>
    </div>

    {/* Notes List */}
    <ul className="w-full max-w-md space-y-4">
      {notes.map((note) => (
        <li key={note.id} className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-xl font-semibold text-gray-800">{note.title}</h3>
          <p className="text-gray-700 mt-2">{note.content}</p>
          <div className="text-gray-500 mt-2 text-sm">
            <p><strong>หมวดหมู่:</strong> {note.category}</p>
            <p><strong>ชื่อผู้สร้าง:</strong> {note.creator}</p>
            <p><strong>วันเวลาที่สร้าง:</strong> {note.timestamp.toLocaleString()}</p>
            <p><strong>Tags:</strong> {note.tags.length > 0 ? note.tags.join(', ') : 'ไม่มีแท็ก'}</p> {/* Display Tags */}
          </div>
        </li>
      ))}
    </ul>
  </div>
);

}
