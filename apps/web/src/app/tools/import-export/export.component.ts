import { Component } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";

import { ExportComponent as BaseExportComponent } from "@bitwarden/angular/components/export.component";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EventService } from "@bitwarden/common/abstractions/event.service";
import { ExportService } from "@bitwarden/common/abstractions/export.service";
import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification/userVerification.service.abstraction";
import { EncryptedExportType } from "@bitwarden/common/enums/encryptedExportType";

import { UserVerificationPromptComponent } from "src/app/components/user-verification-prompt.component";

@Component({
  selector: "app-export",
  templateUrl: "export.component.html",
})
export class ExportComponent extends BaseExportComponent {
  organizationId: string;
  encryptedExportType = EncryptedExportType;

  constructor(
    cryptoService: CryptoService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    exportService: ExportService,
    eventService: EventService,
    policyService: PolicyService,
    logService: LogService,
    userVerificationService: UserVerificationService,
    formBuilder: UntypedFormBuilder,
    fileDownloadService: FileDownloadService,
    private modalService: ModalService
  ) {
    super(
      cryptoService,
      i18nService,
      platformUtilsService,
      exportService,
      eventService,
      policyService,
      window,
      logService,
      userVerificationService,
      formBuilder,
      fileDownloadService
    );
  }

  async submit() {
    if (this.isFileEncryptedExport) {
      if (this.filePassword != this.confirmFilePassword) {
        this.platformUtilsService.showToast(
          "error",
          this.i18nService.t("errorOccurred"),
          this.i18nService.t("filePasswordAndConfirmFilePasswordDoNotMatch")
        );
        return;
      }
    } else {
      this.exportForm.controls.filePassword.disable();
      this.exportForm.controls.confirmFilePassword.disable();
    }

    this.exportForm.markAllAsTouched();
    if (!this.exportForm.valid) {
      return;
    }

    if (this.disabledByPolicy) {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("personalVaultExportPolicyInEffect")
      );
      return;
    }

    let confirmDescription = "exportWarningDesc";

    if (this.exportForm.get("format").value === "encrypted_json") {
      confirmDescription =
        this.exportForm.get("fileEncryptionType").value == EncryptedExportType.FileEncrypted
          ? "fileEncryptedExportWarningDesc"
          : "encExportKeyWarningDesc";
    }

    const ref = this.modalService.open(UserVerificationPromptComponent, {
      allowMultipleModals: true,
      data: {
        confirmDescription: confirmDescription,
        confirmButtonText: "exportVault",
        modalTitle: "confirmVaultExport",
      },
    });

    if (ref == null) {
      return;
    }

    const userVerified = await ref.onClosedPromise();
    if (userVerified) {
      //successful
      this.doExport();
    }
  }

  protected saved() {
    super.saved();
    this.platformUtilsService.showToast("success", null, this.i18nService.t("exportSuccess"));
  }

  get isFileEncryptedExport() {
    return (
      this.format === "encrypted_json" &&
      this.fileEncryptionType === EncryptedExportType.FileEncrypted
    );
  }
}
