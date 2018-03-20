import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { HomePage } from '../home/home';
import { UsuarioService } from '../../domain/usuario/usuario-service';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { UsuarioDao } from '../../domain/usuario/usuario-dao';
import { Usuario } from '../../domain/usuario/usuario';
import { Platform } from 'ionic-angular/platform/platform';
// import { AppMinimize } from '@ionic-native/app-minimize';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { GeolocationService } from '../../domain/geolocation/geolocation-service';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { GeoTracker } from '../../domain/geolocation/geotracker';

@Component({
    templateUrl: 'login.html'
})
export class LoginPage implements OnInit {

    public usuario: Usuario = new Usuario('mario', 'gsm', 0, 0);

    constructor(
        private backgroundGeolocation: BackgroundGeolocation,
        public navCrtl: NavController,
        private service: UsuarioService,
        private alertCrtl: AlertController,
        private loaderCrtl: LoadingController,
        private platform: Platform,
        private dao: UsuarioDao,
        private androidPermissions: AndroidPermissions,
        private geolocationService: GeolocationService,
        private toastCtrl: ToastController,
        private geoTrack: GeoTracker
    ) {

    }

    ngOnInit(): void {
        // validando o tempo de login do usuário do banco
        this.dao.carregar()
            .then((usuario: Usuario) => {
                if (usuario == null) {
                    console.log('Nenhum usuário identificado no banco')
                    return;
                }
                this.usuario = usuario;
                // usuário carregado do banco, validando o tempo de sessão
                let dataAtual = new Date().getTime();
                let dia = 86400000; // 1 dia em MS
                if (usuario.timestamp >= (dataAtual - dia)) {
                    // menos de um dia de login, passar para tela Home
                    this.irParaHome();
                }
                // mais de um dia do login, efetuar login
            })
            .catch(err => {
                console.log(err);
                // houve algum erro para pegar o usuario, fazer login então
            })
    }

    efetuaLogin() {
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION).then((permissao: AndroidPermissions) => {
            if ( permissao.hasPermission || 1==1 )  {
                console.log('Permissão de GPS ativada');
                this.validarLogin();
            } else {
                // solicitando permissao
                this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION).then((permissao: AndroidPermissions) => {
                    console.log('Permissão concedida ? ' + permissao.hasPermission);
                    if (permissao.hasPermission) {
                        this.validarLogin();
                    } else {
                        // não concedeu permissão
                        this.alertCrtl.create({
                            title: 'Acesso a localização',
                            subTitle: 'É necessário conceder permissão para uso da localização do dispositivo',
                            buttons: [{ text: 'Entendido' }]
                        }).present();
                        return;
                    }
                }).catch(err => {
                    console.log(err);
                    alert('Houve um erro ao solicitar acesso ao GPS')
                    return;
                })
            }
        }).catch(err => {
            console.log(err);
            alert('Houve um problema ao validar a permissão de GPS');
            return;
        });
        
    }

    validarLogin() {
        // validando se o GPS esta ativo
        this.backgroundGeolocation.isLocationEnabled().then(ativo => {
            if (ativo) {
                // GPS ativado
                let loader = this.loaderCrtl.create({
                    content: 'Validando credenciais...'
                });

                loader.present().then(() => {
                    // servido de efetuar login
                    this.service.efetuarLogin(this.usuario)
                        .then((logado) => {
                            loader.dismiss();
                            if (logado) {
                                // usuário e senha válidos
                                this.irParaHome();
                            } else {
                                // usuario ou senha invalidos
                                this.alertCrtl.create({
                                    title: 'Credenciais inválidas!',
                                    subTitle: 'Usuário/senha inválidos',
                                    buttons: [{ text: 'OK' }]
                                }).present();
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            loader.dismiss();
                            this.alertCrtl.create({
                                title: 'Falha na conexão',
                                subTitle: 'Não foi possível validar suas credenciais',
                                buttons: [{ text: "Verificarei minha conexão" }]
                            }).present();
                        })
                });
            } else {
                this.alertCrtl.create({
                    title: 'GPS desabilitado',
                    subTitle: 'Ative o dispositivo GPS',
                    buttons: [{ text: 'Entendido!' }]
                }).present();
                return;
            }
        }).catch(err => {
            alert('Não foi possível comunicacar com GPS');
            return;
        })
    }

    irParaHome() {
        this.platform.ready().then(ready => {
            this.platform.registerBackButtonAction(function (e) {
                e.preventDefault();
            }, 1000);
            this.platform.backButton.closed = false;
            this.platform.backButton.isStopped = false;
        })

        let loader = this.loaderCrtl.create({
            content: 'Carregando GPS',
        });
        loader.present().then(() => {

            this.geoTrack.start(this.usuario.id);
            loader.dismiss();
            this.navCrtl.setRoot(HomePage, { 'usuario': this.usuario });
        })
    }
}