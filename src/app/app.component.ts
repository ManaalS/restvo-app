import {AfterViewInit, Component, NgZone, OnInit, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import {StripeService} from "ngx-stripe";

//import {registerWebPlugin} from "@capacitor/core";
//import {OAuth2Client} from '@byteowls/capacitor-oauth2';

import {
    ActionSheetController,
    MenuController,
    ModalController,
    Platform,
} from '@ionic/angular';
import { NetworkService } from './services/network-service.service';
import { UserData } from './services/user.service';
import {Chat} from "./services/chat.service";
import {ShowrecipientinfoPage} from "./pages/connect/showrecipientinfo/showrecipientinfo.page";
import {Capacitor, Plugins} from "@capacitor/core";
const { App } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, AfterViewInit {

    constructor(
        private router: Router,
        private storage: Storage,
        private zone: NgZone,
        private stripeService: StripeService,
        private actionSheetCtrl: ActionSheetController,
        private menuCtrl: MenuController,
        private modalCtrl: ModalController,
        public platform: Platform,
        public networkService: NetworkService,
        public userData: UserData,
        public chatService: Chat
  ) {}

    async ngOnInit() {
        this.menuCtrl.enable(false);
        this.userData.refreshUserStatus$.subscribe(async (res) => {
            if (res && res.type === 'show recipient') {
                const modalPage = await this.modalCtrl.create({
                    component: ShowrecipientinfoPage,
                    componentProps: res.data
                });
                await modalPage.present();
            }
        });
    }

    async ngAfterViewInit() {
        await this.platform.ready();
        try {
            if (Capacitor.isPluginAvailable('App')) {
                const data = await App.getLaunchUrl();
                if (data && data.url) {
                    this.openUrl(data.url);
                }
                App.addListener('appUrlOpen', async (app_data) => {
                    if (app_data && app_data.url) {
                        this.zone.run(() => {
                            this.openUrl(app_data.url);
                        });
                    }
                });
            } else {
                console.log("App Plugin not available");
            }
        } catch (err) {
            console.log("error when activating Capacitor's App Plugin");
        }
    }

    async openUrl(dataUrl) {
        const routeUrl = dataUrl.slice(22, dataUrl.length);
        if (routeUrl && routeUrl.length) {
            const params = {};
            let urlComponents: any;
            if (this.platform.is('ios')) {
                urlComponents = routeUrl.split('%3B'); // to account for the matrix notation ";" in iOS, which encodes as %3B
            } else {
                urlComponents = routeUrl.split(';'); // to account for the matrix notation ";" in Android
            }
            if (urlComponents.length > 1) {
                for (let i = 1; i < urlComponents.length; i++) {
                    params[urlComponents[i].split('=')[0]] = urlComponents[i].split('=')[1];
                }
            }
            console.log("launch app!", routeUrl, urlComponents[0], params);
            const modal = await this.modalCtrl.getTop();
            if (modal) {
                modal.dismiss();
            }
            this.router.navigate([urlComponents[0], params]);
        }
    }

    changeTab(tab) {
        this.menuCtrl.close();
        this.router.navigateByUrl('app/' + tab);
    }

    async settings() {
        this.router.navigateByUrl('/app/user/profile');
        this.menuCtrl.close();
    }


    //Not sure if this function is tied to another feature beyond the "mentoring mode" feature that has been commented out
    //If it isn't tied to another feature, then perhaps we can also remove this code as well
    
    async toggleAdminMode() {
        if (!this.userData.UIready) return;
        await this.storage.set('UIMentoringMode', this.userData.UIMentoringMode);
        if (this.userData.UIMentoringMode) {
            this.userData.openUserPrograms({ modalPage: this.platform.width() < 768 });
            this.menuCtrl.close();
        } else {
            if (this.userData.defaultProgram) {
                this.router.navigateByUrl('/app/discover/home/' + this.userData.defaultProgram._id);
            } else {
                this.router.navigateByUrl('/app/discover');
            }
        }
    }

    async saveToLocalStorage() {
        await this.storage.set('serverDomain', this.networkService.domain);
        if (this.networkService.domain === 'https://server.restvo.com') {
            this.stripeService.setKey('pk_live_yJ6A4nw34iPEMTvJnAzTZPLl');
        } else {
            this.stripeService.setKey('pk_test_x6u9uWj1QBPuhpD1MtOTTriS');
        }
    }
}
