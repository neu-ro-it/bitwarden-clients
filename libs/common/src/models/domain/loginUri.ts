import { IDecryptable } from "@bitwarden/common/interfaces/IDecryptable";
import { encrypted } from "@bitwarden/common/misc/encrypted.decorator";

import { UriMatchType } from "../../enums/uriMatchType";
import { LoginUriData } from "../data/loginUriData";
import { LoginUriView } from "../view/loginUriView";

import Domain from "./domainBase";
import { EncString } from "./encString";
import { SymmetricCryptoKey } from "./symmetricCryptoKey";

export class LoginUri extends Domain implements IDecryptable<LoginUriView> {
  @encrypted
  uri: EncString;
  match: UriMatchType;

  constructor(obj?: LoginUriData) {
    super();
    if (obj == null) {
      return;
    }

    this.match = obj.match;
    this.buildDomainModel(
      this,
      obj,
      {
        uri: null,
      },
      []
    );
  }

  decrypt(orgId: string, encKey?: SymmetricCryptoKey): Promise<LoginUriView> {
    return this.decryptObj(
      new LoginUriView(this),
      {
        uri: null,
      },
      orgId,
      encKey
    );
  }

  toLoginUriData(): LoginUriData {
    const u = new LoginUriData();
    this.buildDataModel(
      this,
      u,
      {
        uri: null,
        match: null,
      },
      ["match"]
    );
    return u;
  }

  toView(decryptedProperties: any) {
    const view = new LoginUriView();
    view.match = this.match;

    Object.assign(view, decryptedProperties);

    return view;
  }
}
