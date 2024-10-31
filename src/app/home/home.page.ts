import { Component, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular'
import { App } from '@capacitor/app'
import { Network } from '@capacitor/network'
import { Capacitor } from '@capacitor/core'
import { Device } from '@capacitor/device'
import {  Motion } from '@capacitor/motion';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  platformName: string = "none"
  nativePlatform: boolean = false
  cameraAvailable: boolean = false

  deviceName: string = "none"
  operatingSystem: string = "none"
  manufacturer: string = "none"
  isVirtual: boolean = false
  uuid: string = "none"

  batteryLevel: string = "100"
  isCharging: boolean = false

  isConnected: boolean = false
  connectionType: string = "none"

  x: string = ""
  y: string = ""
  z: string = ""

  logs: string[] = []

  constructor(private ngZone: NgZone, private platform: Platform) {

    this.platform.backButton.subscribeWithPriority(-1, () => {
      App.exitApp()
    })

    this.platformName = Capacitor.getPlatform()
    this.nativePlatform = Capacitor.isNativePlatform()
    this.cameraAvailable = Capacitor.isPluginAvailable('Camera')

    Device.getInfo().then(
      info => {
        this.deviceName = info.name || "No name"
        this.operatingSystem = info.operatingSystem.toString()
        this.manufacturer = info.manufacturer
        this.isVirtual = info.isVirtual
      }
    )

    Device.getId().then(
      id => {
        this.uuid = id.identifier
      }
    )

    Device.getBatteryInfo().then(
      batteryInfo => {
          this.batteryLevel = (batteryInfo.batteryLevel! * 100).toFixed() || ""
          this.isCharging = batteryInfo.isCharging || false
      }
    )

    Network.addListener("networkStatusChange", (status) => 
    this.ngZone.run( () => {
      this.isConnected = status.connected;
      this.connectionType = status.connectionType;
      this.logs.push("Cambió el tipo de conexión")
    }))

    App.addListener('resume', () => {
      this.ngZone.run(() => {
        this.logs.push("onResume")
      })
    })

    App.addListener('pause', () => {
      this.ngZone.run(() => {
        this.logs.push("onPause")
      })
    })

    App.addListener("appStateChange", (isActive) => {
      this.ngZone.run(() => {
        if(isActive)
          this.logs.push("onStart")
        else 
          this.logs.push("onStop")
      })
    })

    Motion.addListener("accel", (event) => {
      this.ngZone.run(() => {
        this.x = event.accelerationIncludingGravity.x.toFixed()
        this.y = event.accelerationIncludingGravity.y.toFixed()
        this.z = event.accelerationIncludingGravity.z.toFixed()
      })
    })
  }
}
