"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  async function login(e:any){

    e.preventDefault();

    const res=await fetch("/api/login",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        email,
        password
      })

    });

    const data=await res.json();

    if(res.ok){

      router.push("/");

    }else{

      alert(data.message);

    }

  }

  return(

    <div className="flex min-h-screen items-center justify-center">

      <form
      onSubmit={login}
      className="space-y-4 w-96 border rounded-xl p-6">

        <h1 className="text-2xl font-bold">
          INTEGRA
        </h1>

        <input
        className="border p-2 w-full"
        placeholder="Correo"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        />

        <input
        className="border p-2 w-full"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        />

        <button
        className="bg-blue-600 text-white w-full p-2 rounded">
          Entrar
        </button>

      </form>

    </div>

  );

}