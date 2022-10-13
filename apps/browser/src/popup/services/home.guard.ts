import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { StateService } from "@bitwarden/common/abstractions/state.service";

@Injectable()
export class HomeGuard {
  constructor(private stateService: StateService, private router: Router) {}

  async canActivate() {
    const rememberedEmail = await this.stateService.getRememberedEmail();

    if (rememberedEmail == null) {
      return true;
    }

    return this.router.createUrlTree(["login"]);
  }
}
