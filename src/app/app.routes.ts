import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout-component/layout-component';
import { LoginComponent } from './features/auth/login-component/login-component';
import { Profile } from './features/auth/profile/profile';
import { RegisterComponent } from './features/auth/register-component/register-component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'profile',
        component: Profile,
      },
    ],
  },
];
