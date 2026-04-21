import React, { useState, useRef } from "react";

function NotesApp() {
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const inputRef = useRef(null);

  const handleSubmit = () => {
    if (noteInput.trim() === "") return;

    if (editIndex !== null) {
      const updatedNotes = [...notes];
      updatedNotes[editIndex] = noteInput;
      setNotes(updatedNotes);
      setEditIndex(null);
    } else {
      setNotes([...notes, noteInput]);
    }

    setNoteInput("");
    inputRef.current.focus();
  };

  const handleDelete = (index) => {
    const filteredNotes = notes.filter((_, i) => i !== index);
    setNotes(filteredNotes);
  };

  const handleEdit = (index) => {
    setNoteInput(notes[index]);
    setEditIndex(index);
    inputRef.current.focus();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-12 px-4">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-3xl text-blue-600 font-semibold mb-6 text-center">
          Notes App
        </h2>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Enter note..."
            value={noteInput}
            ref={inputRef}
            onChange={(e) => setNoteInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {editIndex !== null ? "Update" : "Submit"}
          </button>
        </div>

        <ul className="space-y-3">
          {notes.map((note, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
            >
              <span className="text-gray-700">{note}</span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(index)}
                  className="bg-yellow-500 text-white px-4 py-1 rounded-md hover:bg-yellow-600 transition"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(index)}
                  className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {notes.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No notes added yet.</p>
        )}
      </div>
    </div>
  );
}

export default NotesApp;