import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('STUDENT');

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: role } // This triggers your SQL function!
        }
      });
      if (error) alert(error.message);
      else alert('Check your email for the confirmation link!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleAuth} className="p-8 bg-white shadow-md rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        {isSignUp && (
          <>
            <input 
              type="text" placeholder="Full Name" className="w-full p-2 mb-4 border rounded"
              onChange={(e) => setFullName(e.target.value)} required
            />
            <select 
              className="w-full p-2 mb-4 border rounded"
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="STUDENT">Student</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="ADMIN">Admin</option>
            </select>
          </>
        )}

        <input 
          type="email" placeholder="Email" className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setEmail(e.target.value)} required
        />
        <input 
          type="password" placeholder="Password" className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setPassword(e.target.value)} required
        />

        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          {isSignUp ? 'Sign Up' : 'Login'}
        </button>

        <p className="mt-4 text-sm text-center cursor-pointer text-blue-500" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </p>
      </form>
    </div>
  );
}