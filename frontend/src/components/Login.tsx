import { useState } from 'react'
import { login as userLogin } from "../api/auth"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import type { LoginData } from '../api/auth'
import { useForm } from 'react-hook-form'
import { login as storeLogin } from '../store/authSlice'
import Input from './Input'

function Login() {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [error, setError] = useState("")
    const { register, handleSubmit } = useForm<LoginData>();

    const login = async (data: LoginData) => {
        setError("")
        
       try {
         const response = await userLogin(data);
 
         if (!response) {
             throw new Error("Could not login")
         }
         dispatch(storeLogin(response.data))

         navigate("/")
       } catch (error) {
         if(error instanceof Error) {
           setError(error.message)
         } else {
          setError("Login failed")
         }
       }

    }

  return (
    <div className='bg-yellow-800'>
      <h1>Welcome back</h1>

      {error && (
          <p className="text-red-600 text-sm text-center mb-4">
            {error}
          </p>
        )}
      <form onSubmit={handleSubmit(login)}>
        <div>
          <div>
            <Input type="text"
              placeholder="Email or Phone"
              {...register("email", {
                required: "Email or phone is required",
                validate: {
                  matchPattern: (value) =>
                  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                  "Invalid email address",
                },
              })}
            />

            <Input type="text"
              placeholder="Enter password"
              {...register("password", {
                required: "Password is required"
              })}
            />
          </div>

          <div>
            <button type='submit'>Sign in</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login