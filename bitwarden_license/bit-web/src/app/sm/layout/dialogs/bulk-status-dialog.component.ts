import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";

export interface BulkStatusDetails {
  title: string;
  subTitle: string;
  columnTitle: string;
  message: string;
  details: BulkOperationStatus[];
}

export class BulkOperationStatus {
  id: string;
  name: string;
  errorMessage?: string;
}

@Component({
  selector: "sm-bulk-status-dialog",
  templateUrl: "./bulk-status-dialog.component.html",
})
export class BulkStatusDialogComponent {
  constructor(public dialogRef: DialogRef, @Inject(DIALOG_DATA) public data: BulkStatusDetails) {}
}
