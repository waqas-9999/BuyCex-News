import { useState,useEffect } from "react";
import Hero from "../components/Home/Hero";

export default function Home() {
  const [users, setUsers] = useState([]);

  const getUsers = () => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUsers(data);
      })
      .catch((err) => console.error('Error fetching users:', err));
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-y-20 min-h-[100vh] ">
      <Hero />
      <div className="mt-10 w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">Users</h2>
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="p-4 grid grid-cols-3 border rounded-md shadow-sm">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-sm">{user.company.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
