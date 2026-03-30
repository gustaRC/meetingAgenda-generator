// core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private accessToken: string | null = null;
  currentUser$ !: any;

  constructor(private auth: Auth) {
    this.currentUser$ = user(this.auth);
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    // Solicita permissão ao Drive
    provider.addScope('https://www.googleapis.com/auth/drive');
    provider.addScope('https://www.googleapis.com/auth/drive.readonly');

    const result = await signInWithPopup(this.auth, provider);
    // Pega o accessToken OAuth2 — é ele que autoriza as chamadas ao Drive
    const credential = GoogleAuthProvider.credentialFromResult(result);
    this.accessToken = credential?.accessToken ?? null;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async logout(): Promise<void> {
    this.accessToken = null;
    await signOut(this.auth);
  }
}
