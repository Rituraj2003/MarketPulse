import React, { useState } from 'react'
import './Login.css'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase'
import { useNavigate } from 'react-router-dom'
import {updateProfile} from 'firebase/auth'

const Login = () => {
    const [isSignUp, setIsSignUp] = useState(true)
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        if (isSignUp) {
            try {
                await createUserWithEmailAndPassword(auth, email, password)
                await updateProfile(auth.currentUser, {
                    displayName: username
                })
                navigate('/')
            } catch (error) {
                setError(error.message)
            }
        } else {
            try {
                await signInWithEmailAndPassword(auth, email, password)
                navigate('/')
            } catch (error) {
                setError(error.message)
            }
        }
    }

    return (
        <div className='form-container'>
            <h1 className='sign-up'>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
            <p className='welcome-message'>
                {isSignUp
                    ? 'Welcome to Market Pulse! Please fill in the details below to create your account.'
                    : 'Welcome back! Please sign in to your account.'}
            </p>
            <div>
                <form onSubmit={handleSubmit}>
                    {isSignUp && (
                        <input
                            type="text"
                            name="username"
                            id="username"
                            className='username'
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    )}
                    <input
                        type="text"
                        name="email"
                        id="email"
                        className='email'
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        name="password"
                        id="password"
                        className='password'
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button type="submit" className='submit-btn'>{isSignUp ? 'Sign Up' : 'Sign In'}</button>
                </form>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <p className='login-prompt'>
                    {isSignUp ? <>Already have an account?{' '}
                        <button type='button' onClick={() => setIsSignUp(false)} className='sign-in-btn'>
                            Sign In
                        </button>
                    </>
                        :
                        <>Don't have an Account?{' '}
                            <button type='button' onClick={() => setIsSignUp(true)} className='sign-up-btn'>
                                Sign Up
                            </button>
                        </>}
                </p>
                <p className='reset-password'>Forgot your password? <a href="/reset-password">Reset Password</a></p>
            </div>
        </div>
    )
}

export default Login
