import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function GoogleSignInButton({ onSuccess }) {
  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={() => alert('Login failed')}
      theme="outline"
      size="large"
      text="signin_with"
      shape="rectangular"
      width="280"
    />
  );
}