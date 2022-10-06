import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

@Component({
  selector: "app-home",
  templateUrl: "home.component.html",
})
export class HomeComponent {
  loginInitiated = false;

  formGroup = this.formBuilder.group({
    email: ["", [Validators.required, Validators.email]],
  });

  submit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      return;
    }
  }

  constructor(
    protected platformUtilsService: PlatformUtilsService,
    private formBuilder: FormBuilder
  ) {}
}
