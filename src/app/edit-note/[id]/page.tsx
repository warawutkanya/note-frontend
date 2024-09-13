"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db, auth } from "../../../firebase";
import {
  collection,
  addDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
  doc,
} from "firebase/firestore";

interface Note {
  title: string;
  content: string;
  category: string;
}

interface HistoryItem {
  id: string;
  editor: string;
  editedAt: string;
  changes: string;
}

const EditNotePage: React.FC = () => {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { id } = useParams() as { id: string };
  const router = useRouter();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        if (id) {
          const docRef = doc(db, "notes", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const noteData = docSnap.data();
            setNote({
              title: noteData.title,
              content: noteData.content,
              category: noteData.category || "",
            });
            await fetchHistory(id); // Fetch history after fetching the note
          } else {
            setError("Note not found");
          }
        }
      } catch (error) {
        console.error("Error fetching note:", error);
        setError("Failed to fetch note.");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const fetchHistory = async (noteId: string) => {
    try {
      const historyRef = collection(db, "notes", noteId, "history");
      const historySnap = await getDocs(historyRef);
      const historyData = historySnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          editor: data.editorName || "Unknown",
          editedAt: data.timestamp.toDate().toLocaleString(),
          changes: data.changes || "No changes recorded",
        };
      });
      setHistory(historyData);
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("Failed to fetch history.");
    }
  };

  const handleUpdate = async () => {
    try {
      if (id && note) {
        const noteRef = doc(db, "notes", id);
        const noteSnap = await getDoc(noteRef);
  
        if (noteSnap.exists()) {
          const previousData = noteSnap.data();
  
          const changes = `หัวข้อ: ${previousData.title} -> ${note.title}\รายละเอียด: ${previousData.content} -> ${note.content}\หมวดหมู่: ${previousData.category || "None"} -> ${note.category}`;
  
          const historyRef = collection(db, "notes", id, "history");
          await addDoc(historyRef, {
            timestamp: serverTimestamp(),
            editor: auth.currentUser?.uid || "unknown",
            editorName: auth.currentUser?.displayName || auth.currentUser?.email || "Unknown",
            changes: changes,
          });
  
          await updateDoc(noteRef, {
            title: note.title,
            content: note.content,
            category: note.category,
          });
  
          router.push("/"); // Redirect to home page after update
        }
      }
    } catch (error) {
      console.error("Error updating note:", error);
      setError("Failed to update note. Please check the console for details.");
    }
  };
  

  if (loading) return <div>Loading your note, please wait...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-4xl font-bold mb-4">เเก้ไข Note</h1>
      {note && (
        <div className="flex flex-col gap-4 w-full max-w-lg">
          <input
            type="text"
            value={note.title}
            onChange={(e) => setNote({ ...note, title: e.target.value })}
            className="border border-gray-300 rounded p-2 w-full"
            placeholder="Title"
          />
          <textarea
            value={note.content}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
            className="border border-gray-300 rounded p-2 w-full"
            rows={4}
            placeholder="Content"
          />
          <input
            type="text"
            value={note.category}
            onChange={(e) => setNote({ ...note, category: e.target.value })}
            className="border border-gray-300 rounded p-2 w-full"
            placeholder="Category"
          />
          <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            เเก้ไข Note
          </button>
        </div>
      )}

      <div className="mt-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">ประวัติการแก้ไข</h2>
        {history.length > 0 ? (
          <ul className="space-y-4">
            {history.map((item) => (
              <li key={item.id} className="border p-4 rounded shadow-sm">
                <p>
                  <strong>เเก้ไขโดย:</strong> {item.editor}
                </p>
                <p>
                  <strong>เเก้ไขตอนวันที่:</strong> {item.editedAt}
                </p>
                <pre className="whitespace-pre-wrap">
                  <strong>เเก้ไข:</strong>
                  {item.changes}
                </pre>
              </li>
            ))}
          </ul>
        ) : (
          <p>No edit history available.</p>
        )}
      </div>
    </div>
  );
};

export default EditNotePage;
