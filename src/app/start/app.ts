import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogOutletComponent } from '../components/dialog/dialog.outlet.component';
import { TitleBarComponent } from '../components/window/titlebar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DialogOutletComponent, TitleBarComponent],
  templateUrl: './app.html',
})
export class App {

}
