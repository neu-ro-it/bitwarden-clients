import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";

import { ModalRef } from "@bitwarden/angular/components/modal/modal.ref";
import { ModalConfig } from "@bitwarden/angular/services/modal.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { ImportService } from "@bitwarden/common/abstractions/import.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";



@Component({
  templateUrl: "file-password-prompt.component.html",
})
export class FilePasswordPromptComponent {
  showFilePassword: boolean;
  filePassword = new FormControl("");
  organizationId: string;
  fileContents: string;
  importService: ImportService;

  constructor(
    private modalRef: ModalRef,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    config: ModalConfig
  ) {
    this.fileContents = config.data.fileContents;
    this.organizationId = config.data.organizationId;

    // ImportService is scoped to the import/export feature module and isn't injected by modalService.open
    this.importService = config.data.importService;
  }

  toggleFilePassword() {
    this.showFilePassword = !this.showFilePassword;
  }

  async submit() {
    const importerPassword = this.importService.getImporter(
      "bitwardenpasswordprotected",
      this.organizationId,
      this.filePassword.value
    );

    const passwordError = await this.importService.import(
      importerPassword,
      this.fileContents,
      this.organizationId
    );

    if (passwordError != null) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("error"),
        this.i18nService.t("invalidFilePassword")
      );
    } else {
      this.modalRef.close(true);
    }
  }
}
