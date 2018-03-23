import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { OrdemServico } from '../../domain/ordem-servico/ordem-servico';
import { OrdemservicoPage } from '../ordem-servico/ordem-servico';
import { OrdemServicoService } from '../../domain/ordem-servico/ordem-servico-service';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { OrdemServicoDao } from '../../domain/ordem-servico/ordem-servico-dao';
import { Usuario } from '../../domain/usuario/usuario';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { UsuarioDao } from '../../domain/usuario/usuario-dao';
import { LoginPage } from '../login/login';
import { GeoTracker } from '../../domain/geolocation/geotracker';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  public ordemServicos: Array<OrdemServico> = [];
  private usuario: Usuario;

  constructor(
    private navCtrl: NavController,
    private loaderCrtl: LoadingController,
    private service: OrdemServicoService,
    private alertCrtl: AlertController,
    private ordemServicoDao: OrdemServicoDao,
    private navParams: NavParams,
    private toastCrtl: ToastController,
    private localNotifications: LocalNotifications,
    private usuarioDao: UsuarioDao,
    private geoTrack: GeoTracker
  ) {
    this.usuario = this.navParams.get('usuario');
    this.geoTrack = this.navParams.get('geo');
    this.atualizarOs(10000);
  }

  ngOnInit(): void {

    this.geoTrack.bgGeo.on('providerchange', function (provider) {
      if (!provider.gps) {
        alert('Ative o GPS para utilizar o aplicativo');
        // usuário desativou o gps
        // this.alertCrtl.create({
        //   title: 'GPS desativado',
        //   subTitle: 'Ative o GPS para utilizar o app',
        //   buttons: [{ text: 'Ok' }]
        // }).present().then(() => {
          this.deslogar();
        // })
      }
    });

    let loader = this.loaderCrtl.create({
      content: 'Carregando O.S. ...'
    });
    loader.present().then(() => {

      // usando id para buscar as os
      this.carregarOs()
        .then(retorno => {
          // fechando loading              
          loader.dismiss();
        })
        // algum erro de busca das os
        .catch(err => {
          console.log(err);
          loader.dismiss();
          // this.alertCrtl.create({
          //   title: 'Falha ao comunicar com o servidor ' + this.usuario.id,
          //   subTitle: err,
          //   buttons: [{ text: 'Ok' }]
          // }).present()
        })
    })
  }

  deslogar() {
    // deslogando usuario
    this.usuarioDao.apagar();
    this.geoTrack.stop();
    this.navCtrl.setRoot(LoginPage);
  }

  carregarOs() {
    // usando id para buscar as os
    return this.service.listar(this.usuario.id)
      .then(retorno => {
        console.log('Retorno ' + retorno);
        // populando a tela de os 
        this.ordemServicos = retorno;
        // salvando as os no banco de dados local
        this.ordemServicoDao.salvarVarios(this.ordemServicos);

        this.localNotifications.cancelAll();
        this.localNotifications.schedule({
          id: 1,
          text: this.ordemServicos.length + ' nova(s) O.S.',
          sound: null,
          data: { secret: 'app' }
        });
      })
  }


  atualizarOs(tempo) {
    setTimeout(() => {

      this.carregarOs().then(ret => {
        // this.toastCrtl.create({
        //   message: 'O.S. atualizadas!'
        // }).present();

        this.atualizarOs(tempo);
      });

    }, tempo);
  }
  acessarOrdem(os: OrdemServico) {
    this.navCtrl.push(OrdemservicoPage, { os, editar: true });
  }
  visualizarOrdem(os: OrdemServico) {
    // visualizar a os
    this.navCtrl.push(OrdemservicoPage, { os, editar: false });
  }

  pegarOrdem(os: OrdemServico) {
    let loader = this.loaderCrtl.create({
      content: 'Processando..'
    });
    loader.present().then(() => {
      // pegando a ordem de serviço
      if (this.service.pegarOrdemServico(this.usuario.id, os)) {
        loader.dismiss();
        this.navCtrl.push(OrdemservicoPage, { os, editar: true })
      } else {
        loader.dismiss();
        // não foi possível pegar a OS
        this.alertCrtl.create({
          title: 'Operação não permitida',
          subTitle: 'OS indisponível',
          buttons: [{ text: 'Ok' }]
        }).present();
      }
    })

  }
}
