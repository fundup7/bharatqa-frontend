import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './LoginPage.css';

export default function LoginPage({ onLogin }) {
  return (
    <div className="login-page">
      <div className="login-card glass-card">
        <div className="login-icon">🔐</div>
        <h1>Welcome to BharatQA</h1>
        <p>Sign in with your Google account to access the dashboard.</p>

        <div className="login-google-wrap">
          <GoogleLogin
            onSuccess={onLogin}
            onError={() => alert('Login failed. Please try again.')}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="300"
          />
        </div>

        <p className="login-note">
          We only request basic profile info (name, email, picture).
          <br />No credit card required.
        </p>
      </div>
    </div>
  );
}