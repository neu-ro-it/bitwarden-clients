import { OrganizationUserType } from "../../enums/organizationUserType";
import { PermissionsApi } from "../api/permissions.api";

import { SelectionReadOnlyRequest } from "./selectionReadOnlyRequest";

export class OrganizationUserInviteRequest {
  emails: string[] = [];
  type: OrganizationUserType;
  accessAll: boolean;
  collections: SelectionReadOnlyRequest[] = [];
  permissions: PermissionsApi;
}
