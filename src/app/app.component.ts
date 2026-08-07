import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ClcIaWidgetComponent} from './shared/clc-ia-widget.component';
import {ThemeService} from './core/theme.service';

@Component({
  selector:'app-root',
  standalone:true,
  imports:[RouterOutlet,ClcIaWidgetComponent],
  template:`<router-outlet/><app-clc-ia-widget/>`
})
export class AppComponent{
  constructor(theme:ThemeService){theme.apply();}
}
