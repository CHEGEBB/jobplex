import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
// import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
// import '@fortawesome/fontawesome-free/css/solid.min.css';
// import '@fortawesome/fontawesome-free/css/regular.min.css';
// import '@fortawesome/fontawesome-free/css/brands.min.css';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
