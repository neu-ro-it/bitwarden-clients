import { Component } from "@angular/core";

import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

@Component({
  selector: "app-home",
  templateUrl: "home.component.html",
})
export class HomeComponent {
  constructor(
    protected platformUtilsService: PlatformUtilsService,
  ) {}
}
