import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogOutletComponent } from '../components/dialog/dialog.outlet.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DialogOutletComponent],
  templateUrl: './app.html',
})
export class App {

}
