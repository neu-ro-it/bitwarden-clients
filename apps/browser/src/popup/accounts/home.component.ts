import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";

@Component({
  selector: "app-home",
  templateUrl: "home.component.html",
})
export class HomeComponent {
  loginInitiated = false;

  formGroup = this.formBuilder.group({
    email: ["", [Validators.required, Validators.email]],
  });

  get email() {
    return this.formGroup.get("email");
  }

  constructor(
    protected platformUtilsService: PlatformUtilsService,
    private stateService: StateService,
    private formBuilder: FormBuilder
  ) {}

  async initiateLogin(): Promise<void> {
    this.email.setValue(await this.stateService.getRememberedEmail());
    this.loginInitiated = true;
  }

  submit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      return;
    }
  }
}
