import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FeatureBillingPageRoutingModule } from './feature-billing-routing.module';

import { FeatureBillingPage } from './feature-billing.page';
import {ApplicationPipesModule} from "../../../../pipes/application-pipes";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ApplicationPipesModule,
    IonicModule,
    FeatureBillingPageRoutingModule
  ],
  declarations: [FeatureBillingPage]
})
export class FeatureBillingPageModule {}
