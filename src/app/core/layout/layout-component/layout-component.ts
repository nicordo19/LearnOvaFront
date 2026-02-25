import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer-component/footer-component';
import { HeaderComponent } from '../header-component/header-component';
import { NavbarComponent } from '../navbar-component/navbar-component';
@Component({
  standalone: true,
  selector: 'app-layout-component',
  imports: [NavbarComponent, HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './layout-component.html',
  styleUrl: './layout-component.scss',
})
export class LayoutComponent {}
