import { useState, useEffect } from "react";
import { supabase } from "../createClient";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  // Get users from database
  async function fetchUsers() {
    const { data, error } = await supabase.from("users").select("*");
    if (!error) {
      setUsers(data || []);
    }
  }

  // Load users when page starts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Add new user
  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || !age) return alert("Please enter both name and age");

    const { data, error } = await supabase
      .from("users")
      .insert([{ name, age: Number(age) }])
      .select();

    if (error) {
      alert("Error: " + error.message);
    } else {
      setUsers([data[0], ...users]); // Add new user to list
      setName("");
      setAge("");
    }
  }

  return (
    <div className="p-6 flex flex-col items-center gap-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
          Add User
        </button>
      </form>

      {/* Users Table */}
      <table className="border-collapse border border-gray-400 w-full max-w-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-1">ID</th>
            <th className="border px-3 py-1">Name</th>
            <th className="border px-3 py-1">Age</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border px-3 py-1">{u.id}</td>
              <td className="border px-3 py-1">{u.name}</td>
              <td className="border px-3 py-1">{u.age}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
