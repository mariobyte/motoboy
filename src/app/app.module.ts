import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { Device } from '@ionic-native/device';
import { Dialogs } from '@ionic-native/dialogs';

import { HttpModule } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

// SERVICES
import { UsuarioService } from '../domain/usuario/usuario-service';
import { OrdemServicoService } from '../domain/ordem-servico/ordem-servico-service';
import { ServicoService } from '../domain/servico/serico-service';
import { GeolocationService } from '../domain/geolocation/geolocation-service';
import { GeoTracker } from '../domain/geolocation/geotracker';

// PAGES
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { OrdemservicoPage } from '../pages/ordem-servico/ordem-servico';

import { Md5 } from 'ts-md5/dist/md5';

// PROVIDERS
import { Storage } from '@ionic/storage';
import { OrdemServicoDao } from '../domain/ordem-servico/ordem-servico-dao';
import { UsuarioDao } from '../domain/usuario/usuario-dao';
import { ServicoDao } from '../domain/servico/servico-dao';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { SignaturePage } from '../pages/signature/signature';
import { SignaturePadModule } from 'angular2-signaturepad';

import { MyApp } from './app.component';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Geolocation } from '@ionic-native/geolocation';


function providerStorage() {

  return new Storage({
    name: 'checkin-os',
    storeName: 'ordem-servicos'
  })
}

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    OrdemservicoPage,
    SignaturePage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    SignaturePadModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    OrdemservicoPage,
    SignaturePage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Device,
    Dialogs,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: Storage, useFactory: providerStorage },

    Md5,
    // AppMinimize,
    AndroidPermissions,
    BackgroundGeolocation,
    LocalNotifications,
    Geolocation,

    // SERVICES
    UsuarioService,
    OrdemServicoService,
    ServicoService,
    GeolocationService,
    GeoTracker,

    // DAOs
    OrdemServicoDao,
    UsuarioDao,
    ServicoDao
  ]
})
export class AppModule { }
