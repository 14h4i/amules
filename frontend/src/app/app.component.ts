import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private _authService: AuthService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token')) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      if (accessToken) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
          .then(res => res.json())
          .then(profile => {
            if (profile && profile.email) {
              const googleUser = {
                email: profile.email,
                fullName: profile.name || profile.email.split('@')[0],
                avatar: profile.picture || '',
                authProvider: 'google'
              };
              this._authService.loginWithGoogle(googleUser).subscribe({
                next: () => {
                  window.history.replaceState({}, document.title, window.location.pathname);
                },
                error: () => {}
              });
            }
          })
          .catch(() => {});
      }
    }
  }
}
