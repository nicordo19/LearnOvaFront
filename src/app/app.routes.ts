import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout-component/layout-component';
import { LoginComponent } from './features/auth/login-component/login-component';
import { Profile } from './features/auth/profile/profile';
import { RegisterComponent } from './features/auth/register-component/register-component';
import { HomeVideos } from './features/videos/home-videos/home-videos';
import { UploadVideoComponent } from './features/videos/upload-video-component/upload-video-component';
import { VideoDetail } from './features/videos/video-detail/video-detail';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: HomeVideos,
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
      {
        path: 'videos/upload',
        component: UploadVideoComponent,
      },
      {
        path: 'videos/:id',
        component: VideoDetail,
      },
    ],
  },
];
