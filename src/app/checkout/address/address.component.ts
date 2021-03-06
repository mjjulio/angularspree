import { getOrderId, getOrderNumber } from './../reducers/selectors';
import { AppState } from './../../interfaces';
import { Store } from '@ngrx/store';
import { Address } from './../../core/models/address';
import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { UserActions } from '../../user/actions/user.actions';
import { getUserAddressess, getCountries } from '../../user/reducers/selector';
import { Country } from '../../core/models/country';
import { CheckoutActions } from '../actions/checkout.actions';
import { Router } from '@angular/router';
import { fadeInAnimation } from '../../shared/animations/fade-in.animation';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  animations: [fadeInAnimation],
})
export class AddressComponent implements OnInit, OnDestroy {
  stateSub$: Subscription;
  orderState: string;
  orderId: number;
  shipAddress: Address;
  isEditButtonPressed: boolean;
  addressData: Address;
  isAddNewAddress: boolean;
  userAddresses$: Observable<Array<Address>>;
  isUserSelectedAddress: boolean;
  countries$: Observable<Country[]>;
  subscriptionList$: Array<Subscription> = [];
  orderNumber$: Observable<string>;
  @HostBinding('@fadeInAnimation')
  public animatePage = true;


  constructor(private store: Store<AppState>,
    private userActions: UserActions,
    private checkoutAction: CheckoutActions,
    private router: Router,
    private checkOutActions: CheckoutActions) {
    this.store.dispatch(this.userActions.fetchUserAddress());
  }

  ngOnInit() {
    this.subscriptionList$.push(
      this.store.select(getOrderId).subscribe(orderId => this.orderId = orderId)
    );
    this.userAddresses$ = this.store.select(getUserAddressess);
    this.store.dispatch(this.userActions.fetchCountries());
    this.countries$ = this.store.select(getCountries);
    this.orderNumber$ = this.store.select(getOrderNumber);
  }

  userAddressEdit(addressData) {
    this.addressData = addressData
    this.isEditButtonPressed = true;
  }

  addressEditedDone() {
    this.isEditButtonPressed = false;
  }

  addNewAddress() {
    this.isAddNewAddress = true;
  }

  cancelAddress(event) {
    return this.isAddNewAddress = event;
  }

  getSelectedAddress(event) {
    this.shipAddress = event;
    this.isUserSelectedAddress = true;
    this.store.dispatch(this.checkoutAction.bindAddress(this.shipAddress, this.orderId))
  }

  changeAddress() {
    this.isUserSelectedAddress = false;
  }

  checkoutToPayment() {
    this.subscriptionList$.push(
      this.store.select(getOrderId)
        .subscribe(orderId => {
          this.store.dispatch(this.checkOutActions.getShippingPreferences(orderId, []))
        })
    );

  }

  ngOnDestroy() {
    this.subscriptionList$.forEach(sub$ => sub$.unsubscribe());
  }
}
