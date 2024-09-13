"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  orderBy,
  startAfter,
  limit,
  QueryDocumentSnapshot,
  DocumentData,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

interface Note {
  id: string;
  uid: string;
  creator: string;
  title: string;
  category: string;
  content: string;
  timestamp: Date;
  tags: string[];
}

const NOTES_PER_PAGE = 4;

const Home: React.FC = () => {
  const { user, loading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [firstVisible, setFirstVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchNotes("timestamp", "desc");
    }
  }, [user]);

  const fetchNotes = async (
    sortBy: string = "timestamp",
    order: "asc" | "desc" = "desc",
    startDoc: QueryDocumentSnapshot<DocumentData> | null = null
  ) => {
    try {
      const notesQuery = query(
        collection(db, "notes"),
        orderBy(sortBy, order),
        startDoc ? startAfter(startDoc) : limit(NOTES_PER_PAGE)
      );

      const noteSnapshots = await getDocs(notesQuery);
      const fetchedNotes = noteSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
        tags: doc.data().tags || [],
      })) as Note[];

      setNotes(fetchedNotes);
      setFirstVisible(noteSnapshots.docs[0] || null);
      setLastVisible(noteSnapshots.docs[noteSnapshots.docs.length - 1] || null);
      setHasNextPage(noteSnapshots.docs.length === NOTES_PER_PAGE);
      setHasPreviousPage(!!startDoc);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError("Failed to fetch notes. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = window.confirm("ลบ note นี้?");
    if (!isConfirmed) return;

    try {
      const noteRef = doc(db, "notes", id);
      await deleteDoc(noteRef);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
      setError("Failed to delete the note. Please try again.");
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/edit-note/${id}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 sm:p-12">
      <header className="text-center mb-8">
        {user ? (
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            ยินดีต้อนรับคุณ, {user.displayName || user.email}
          </h1>
        ) : (
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            Welcome to Note Easy
          </h1>
        )}

        <div className="mb-6">
          <label htmlFor="sort" className="mr-2 text-gray-600">
            Sort by:
          </label>
          <select
            id="sort"
            onChange={(event) =>
              fetchNotes(
                event.target.value.split("-")[0],
                event.target.value.split("-")[1] as "asc" | "desc"
              )
            }
            className="border p-2 rounded-lg bg-white shadow-md"
          >
            <option value="timestamp-desc">ใหม่สุด</option>
            <option value="timestamp-asc">เก่าสุด</option>
          </select>
        </div>

        <button
          onClick={() => router.push("/notes")}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-500 transition"
        >
          สร้าง Note
        </button>
      </header>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <main className="w-full max-w-4xl">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note.id}
              className="border bg-white rounded-lg shadow-md p-6 mb-6 transition transform hover:shadow-lg hover:-translate-y-1"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {note.title}
              </h2>
              <p className="text-gray-600 mb-4">{note.content}</p>
              <p className="text-sm text-gray-500">
                วันเวลาที่สร้าง: {note.timestamp.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">ชื่อผู้สร้าง: {note.creator}</p>
              <p className="text-sm text-gray-500">หมวดหมู่: {note.category}</p>
              <p className="text-sm text-gray-500">
                แท็ก: {note.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">ไม่มีแท็ก</span>
                )}
              </p>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleEdit(note.id)}
                  className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-300"
                >
                  เเก้ไข
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No notes available</p>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => fetchNotes("timestamp", "desc", firstVisible)}
            disabled={!hasPreviousPage}
            className={`px-4 py-2 rounded-lg font-semibold ${
              hasPreviousPage
                ? "bg-blue-500 text-white hover:bg-blue-400"
                : "bg-gray-300 text-gray-400 cursor-not-allowed"
            }`}
          >
            ก่อนหน้า
          </button>
          <button
            onClick={() => fetchNotes("timestamp", "desc", lastVisible)}
            disabled={!hasNextPage}
            className={`px-4 py-2 rounded-lg font-semibold ${
              hasNextPage
                ? "bg-blue-500 text-white hover:bg-blue-400"
                : "bg-gray-300 text-gray-400 cursor-not-allowed"
            }`}
          >
            หน้าถัดไป
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
