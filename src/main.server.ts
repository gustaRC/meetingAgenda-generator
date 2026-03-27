import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { BootstrapContext } from '@angular/platform-browser';
import { appConfig } from './app/app.config';

export default function bootstrap(context: BootstrapContext) {
  return bootstrapApplication(AppComponent, appConfig, context);
}
