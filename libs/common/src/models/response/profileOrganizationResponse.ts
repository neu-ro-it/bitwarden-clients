import { OrganizationUserStatusType } from "../../enums/organizationUserStatusType";
import { OrganizationUserType } from "../../enums/organizationUserType";
import { ProductType } from "../../enums/productType";
import { PermissionsApi } from "../api/permissions.api";

import { BaseResponse } from "./baseResponse";

export class ProfileOrganizationResponse extends BaseResponse {
  id: string;
  name: string;
  usePolicies: boolean;
  useGroups: boolean;
  useDirectory: boolean;
  useEvents: boolean;
  useTotp: boolean;
  use2fa: boolean;
  useApi: boolean;
  useSso: boolean;
  useKeyConnector: boolean;
  useScim: boolean;
  useResetPassword: boolean;
  selfHost: boolean;
  usersGetPremium: boolean;
  seats: number;
  maxCollections: number;
  maxStorageGb?: number;
  key: string;
  hasPublicAndPrivateKeys: boolean;
  status: OrganizationUserStatusType;
  type: OrganizationUserType;
  enabled: boolean;
  ssoBound: boolean;
  identifier: string;
  permissions: PermissionsApi;
  resetPasswordEnrolled: boolean;
  userId: string;
  providerId: string;
  providerName: string;
  familySponsorshipFriendlyName: string;
  familySponsorshipAvailable: boolean;
  planProductType: ProductType;
  keyConnectorEnabled: boolean;
  keyConnectorUrl: string;
  familySponsorshipLastSyncDate?: Date;
  familySponsorshipValidUntil?: Date;
  familySponsorshipToDelete?: boolean;

  constructor(response: any) {
    super(response);
    this.id = this.getResponseProperty("Id");
    this.name = this.getResponseProperty("Name");
    this.usePolicies = this.getResponseProperty("UsePolicies");
    this.useGroups = this.getResponseProperty("UseGroups");
    this.useDirectory = this.getResponseProperty("UseDirectory");
    this.useEvents = this.getResponseProperty("UseEvents");
    this.useTotp = this.getResponseProperty("UseTotp");
    this.use2fa = this.getResponseProperty("Use2fa");
    this.useApi = this.getResponseProperty("UseApi");
    this.useSso = this.getResponseProperty("UseSso");
    this.useKeyConnector = this.getResponseProperty("UseKeyConnector") ?? false;
    this.useScim = this.getResponseProperty("UseScim") ?? false;
    this.useResetPassword = this.getResponseProperty("UseResetPassword");
    this.selfHost = this.getResponseProperty("SelfHost");
    this.usersGetPremium = this.getResponseProperty("UsersGetPremium");
    this.seats = this.getResponseProperty("Seats");
    this.maxCollections = this.getResponseProperty("MaxCollections");
    this.maxStorageGb = this.getResponseProperty("MaxStorageGb");
    this.key = this.getResponseProperty("Key");
    this.hasPublicAndPrivateKeys = this.getResponseProperty("HasPublicAndPrivateKeys");
    this.status = this.getResponseProperty("Status");
    this.type = this.getResponseProperty("Type");
    this.enabled = this.getResponseProperty("Enabled");
    this.ssoBound = this.getResponseProperty("SsoBound");
    this.identifier = this.getResponseProperty("Identifier");
    this.permissions = new PermissionsApi(this.getResponseProperty("permissions"));
    this.resetPasswordEnrolled = this.getResponseProperty("ResetPasswordEnrolled");
    this.userId = this.getResponseProperty("UserId");
    this.providerId = this.getResponseProperty("ProviderId");
    this.providerName = this.getResponseProperty("ProviderName");
    this.familySponsorshipFriendlyName = this.getResponseProperty("FamilySponsorshipFriendlyName");
    this.familySponsorshipAvailable = this.getResponseProperty("FamilySponsorshipAvailable");
    this.planProductType = this.getResponseProperty("PlanProductType");
    this.keyConnectorEnabled = this.getResponseProperty("KeyConnectorEnabled") ?? false;
    this.keyConnectorUrl = this.getResponseProperty("KeyConnectorUrl");
    const familySponsorshipLastSyncDateString = this.getResponseProperty(
      "FamilySponsorshipLastSyncDate"
    );
    if (familySponsorshipLastSyncDateString) {
      this.familySponsorshipLastSyncDate = new Date(familySponsorshipLastSyncDateString);
    }
    const familySponsorshipValidUntilString = this.getResponseProperty(
      "FamilySponsorshipValidUntil"
    );
    if (familySponsorshipValidUntilString) {
      this.familySponsorshipValidUntil = new Date(familySponsorshipValidUntilString);
    }
    this.familySponsorshipToDelete = this.getResponseProperty("FamilySponsorshipToDelete");
  }
}
